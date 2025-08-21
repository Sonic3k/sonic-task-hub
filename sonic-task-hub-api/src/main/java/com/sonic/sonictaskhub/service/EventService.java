package com.sonic.sonictaskhub.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sonic.sonictaskhub.model.dto.EventDto;
import com.sonic.sonictaskhub.model.entity.Category;
import com.sonic.sonictaskhub.model.entity.Event;
import com.sonic.sonictaskhub.model.entity.User;
import com.sonic.sonictaskhub.model.enums.RecurringPattern;
import com.sonic.sonictaskhub.model.request.EventCreateRequest;
import com.sonic.sonictaskhub.repository.CategoryRepository;
import com.sonic.sonictaskhub.repository.EventRepository;
import com.sonic.sonictaskhub.repository.UserRepository;

@Service
@Transactional
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    /**
     * Generate next event number for user
     */
    private Long generateEventNumber(Long userId) {
        Long maxNumber = eventRepository.getMaxEventNumberForUser(userId);
        return (maxNumber != null ? maxNumber : 0L) + 1;
    }
    
    /**
     * Create a new event
     */
    public EventDto createEvent(Long userId, EventCreateRequest request) {
        // Validate
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new RuntimeException("Event title is required");
        }
        if (request.getEventDateTime() == null) {
            throw new RuntimeException("Event date and time is required");
        }

        // Get user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Create master event
        Event event = new Event();
        event.setEventNumber(generateEventNumber(userId));
        event.setTitle(request.getTitle().trim());
        event.setDescription(request.getDescription());
        event.setEventDateTime(request.getEventDateTime());
        event.setLocation(request.getLocation());
        event.setReminderMinutes(request.getReminderMinutes());
        event.setIsRecurring(request.getIsRecurring() != null && request.getIsRecurring());
        event.setUser(user);

        // Set category
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            event.setCategory(category);
        }

        // Handle recurring
        if (event.getIsRecurring() && request.getRecurringPattern() != null) {
            RecurringPattern pattern = RecurringPattern.valueOf(request.getRecurringPattern().toUpperCase());
            event.setRecurringPattern(pattern);
            event.setRecurringInterval(request.getRecurringInterval());
            event.setRecurringEndDate(request.getRecurringEndDate());
        }

        Event savedEvent = eventRepository.save(event);
        
        // Generate recurring instances if needed
        if (savedEvent.getIsRecurring()) {
            generateRecurringInstances(savedEvent);
        }
        
        return convertToDto(savedEvent);
    }

    /**
     * Generate recurring event instances
     */
    private void generateRecurringInstances(Event masterEvent) {
        if (!masterEvent.getIsRecurring() || masterEvent.getRecurringPattern() == null) {
            return;
        }

        List<Event> instances = new ArrayList<>();
        LocalDateTime currentDate = masterEvent.getEventDateTime();
        LocalDateTime endDate = masterEvent.getRecurringEndDate() != null ? 
            masterEvent.getRecurringEndDate() : currentDate.plusYears(2); // Default 2 years

        int generatedCount = 0;
        int maxInstances = 100; // Prevent infinite generation

        while (currentDate.isBefore(endDate) && generatedCount < maxInstances) {
            currentDate = getNextOccurrence(currentDate, masterEvent.getRecurringPattern(), 
                                          masterEvent.getRecurringInterval());
            
            if (currentDate.isBefore(endDate)) {
                Event instance = createEventInstance(masterEvent, currentDate);
                instances.add(instance);
                generatedCount++;
            }
        }

        if (!instances.isEmpty()) {
            eventRepository.saveAll(instances);
        }
    }

    /**
     * Calculate next occurrence based on pattern
     */
    private LocalDateTime getNextOccurrence(LocalDateTime current, RecurringPattern pattern, Integer interval) {
        if (interval == null) interval = 1;

        switch (pattern) {
            case DAILY:
                return current.plusDays(1);
            case WEEKLY:
                return current.plusWeeks(1);
            case MONTHLY:
                return current.plusMonths(1);
            case YEARLY:
                return current.plusYears(1);
            case EVERY_N_DAYS:
                return current.plusDays(interval);
            case EVERY_N_WEEKS:
                return current.plusWeeks(interval);
            default:
                return current.plusDays(1);
        }
    }

    /**
     * Create an event instance from master event
     */
    private Event createEventInstance(Event masterEvent, LocalDateTime dateTime) {
        Event instance = new Event();
        instance.setEventNumber(generateEventNumber(masterEvent.getUser().getId()));
        instance.setTitle(masterEvent.getTitle());
        instance.setDescription(masterEvent.getDescription());
        instance.setEventDateTime(dateTime);
        instance.setLocation(masterEvent.getLocation());
        instance.setReminderMinutes(masterEvent.getReminderMinutes());
        instance.setIsRecurring(false); // Instances are not recurring
        instance.setUser(masterEvent.getUser());
        instance.setCategory(masterEvent.getCategory());
        instance.setMasterEvent(masterEvent);
        return instance;
    }

    /**
     * Get events with filters and pagination
     */
    public Page<EventDto> getEventsWithFilters(Long userId, Long categoryId, String search, 
                                             int page, int size, String sortBy, String sortDirection) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Event> events = eventRepository.findWithFilters(userId, categoryId, search, pageable);
        return events.map(this::convertToDto);
    }

    /**
     * Get event by ID
     */
    public EventDto getEventById(Long userId, Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        
        if (!event.getUser().getId().equals(userId)) {
            throw new RuntimeException("Event doesn't belong to this user");
        }
        
        return convertToDto(event);
    }

    /**
     * Get events in date range
     */
    public List<EventDto> getEventsInDateRange(Long userId, LocalDateTime startDate, LocalDateTime endDate) {
        List<Event> events = eventRepository.findEventsInDateRange(userId, startDate, endDate);
        return events.stream()
                .map(this::convertToDto)
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * Delete an event
     */
    public void deleteEvent(Long userId, Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (!event.getUser().getId().equals(userId)) {
            throw new RuntimeException("Event doesn't belong to this user");
        }

        // If it's a master event, delete all instances
        if (event.getIsRecurring()) {
            List<Event> instances = eventRepository.findInstancesByMasterEventId(eventId);
            eventRepository.deleteAll(instances);
        }

        eventRepository.delete(event);
    }

    /**
     * Convert Event entity to EventDto
     */
    private EventDto convertToDto(Event event) {
        EventDto dto = new EventDto();
        dto.setId(event.getId());
        dto.setEventNumber(event.getEventNumber());
        dto.setTitle(event.getTitle());
        dto.setDescription(event.getDescription());
        dto.setEventDateTime(event.getEventDateTime());
        dto.setLocation(event.getLocation());
        dto.setReminderMinutes(event.getReminderMinutes());
        dto.setIsRecurring(event.getIsRecurring());
        dto.setRecurringPattern(event.getRecurringPattern());
        dto.setRecurringInterval(event.getRecurringInterval());
        dto.setRecurringEndDate(event.getRecurringEndDate());
        dto.setSortOrder(event.getSortOrder());
        dto.setCreatedAt(event.getCreatedAt());
        dto.setUpdatedAt(event.getUpdatedAt());

        // User info
        if (event.getUser() != null) {
            dto.setUserId(event.getUser().getId());
            dto.setUserDisplayName(event.getUser().getDisplayName());
        }

        // Category info
        if (event.getCategory() != null) {
            dto.setCategoryId(event.getCategory().getId());
            dto.setCategoryName(event.getCategory().getName());
            dto.setCategoryColor(event.getCategory().getColor());
        }

        // Master event info
        if (event.getMasterEvent() != null) {
            dto.setMasterEventId(event.getMasterEvent().getId());
            dto.setMasterEventTitle(event.getMasterEvent().getTitle());
        }

        return dto;
    }
}