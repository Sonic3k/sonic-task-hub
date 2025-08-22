package com.sonic.sonictaskhub.web.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sonic.sonictaskhub.model.dto.EventDto;
import com.sonic.sonictaskhub.model.request.EventCreateRequest;
import com.sonic.sonictaskhub.model.response.BaseResponse;
import com.sonic.sonictaskhub.service.EventService;

/**
 * Controller for event management operations
 */
@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*")
public class EventController {

    @Autowired
    private EventService eventService;

    /**
     * Create a new event
     * 
     * @param userId the ID of the user
     * @param request containing event details
     * @return BaseResponse with created event data
     */
    @PostMapping("/user/{userId}")
    public BaseResponse<EventDto> createEvent(@PathVariable(name = "userId") Long userId,
                                            @RequestBody EventCreateRequest request) {
        try {
            EventDto event = eventService.createEvent(userId, request);
            return BaseResponse.success("Event created successfully", event);
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Get events with filters and pagination
     * 
     * @param userId the ID of the user
     * @param categoryId filter by category ID
     * @param search search term for title/description
     * @param page page number (0-based)
     * @param size page size
     * @param sortBy field to sort by
     * @param sortDirection sort direction (asc/desc)
     * @return BaseResponse with paginated event data
     */
    @GetMapping("/user/{userId}")
    public BaseResponse<Page<EventDto>> getEventsWithFilters(
            @PathVariable(name = "userId") Long userId,
            @RequestParam(name = "categoryId", required = false) Long categoryId,
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "page", required = false, defaultValue = "0") int page,
            @RequestParam(name = "size", required = false, defaultValue = "20") int size,
            @RequestParam(name = "sortBy", required = false, defaultValue = "eventDateTime") String sortBy,
            @RequestParam(name = "sortDirection", required = false, defaultValue = "asc") String sortDirection) {
        try {
            Page<EventDto> events = eventService.getEventsWithFilters(userId, categoryId, search, 
                                                                     page, size, sortBy, sortDirection);
            return BaseResponse.success(events);
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Get event by ID
     * 
     * @param userId the ID of the user
     * @param eventId the ID of the event
     * @return BaseResponse with event data
     */
    @GetMapping("/user/{userId}/event/{eventId}")
    public BaseResponse<EventDto> getEventById(@PathVariable(name = "userId") Long userId,
                                             @PathVariable(name = "eventId") Long eventId) {
        try {
            EventDto event = eventService.getEventById(userId, eventId);
            return BaseResponse.success(event);
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Get events in date range
     * 
     * @param userId the ID of the user
     * @param startDate start date for range (ISO format)
     * @param endDate end date for range (ISO format)
     * @return BaseResponse with list of events
     */
    @GetMapping("/user/{userId}/range")
    public BaseResponse<List<EventDto>> getEventsInDateRange(
            @PathVariable(name = "userId") Long userId,
            @RequestParam(name = "startDate", required = true) String startDate,
            @RequestParam(name = "endDate", required = true) String endDate) {
        try {
            LocalDateTime start = LocalDateTime.parse(startDate);
            LocalDateTime end = LocalDateTime.parse(endDate);
            
            List<EventDto> events = eventService.getEventsInDateRange(userId, start, end);
            return BaseResponse.success(events);
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }
    
    /**
     * Update an existing event
     * 
     * @param userId the ID of the user
     * @param eventId the ID of the event to update
     * @param request containing updated event details
     * @return BaseResponse with updated event data
     */
    @PutMapping("/user/{userId}/event/{eventId}")
    public BaseResponse<EventDto> updateEvent(@PathVariable(name = "userId") Long userId,
                                             @PathVariable(name = "eventId") Long eventId,
                                             @RequestBody EventCreateRequest request) {
        try {
            EventDto event = eventService.updateEvent(userId, eventId, request);
            return BaseResponse.success("Event updated successfully", event);
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Delete an event
     * 
     * @param userId the ID of the user
     * @param eventId the ID of the event to delete
     * @return BaseResponse with success message
     */
    @DeleteMapping("/user/{userId}/event/{eventId}")
    public BaseResponse<String> deleteEvent(@PathVariable(name = "userId") Long userId,
                                          @PathVariable(name = "eventId") Long eventId) {
        try {
            eventService.deleteEvent(userId, eventId);
            return BaseResponse.success("Event deleted successfully", "Event has been deleted");
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }
    
    /**
     * Get event by event number
     * 
     * @param userId the ID of the user
     * @param eventNumber the event number
     * @return BaseResponse with event data
     */
    @GetMapping("/user/{userId}/number/{eventNumber}")
    public BaseResponse<EventDto> getEventByNumber(@PathVariable(name = "userId") Long userId,
                                                  @PathVariable(name = "eventNumber") Long eventNumber) {
        try {
            EventDto event = eventService.getEventByNumber(userId, eventNumber);
            return BaseResponse.success(event);
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }
}