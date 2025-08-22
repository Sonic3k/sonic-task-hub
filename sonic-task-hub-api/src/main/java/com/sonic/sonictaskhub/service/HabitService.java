package com.sonic.sonictaskhub.service;

import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sonic.sonictaskhub.model.dto.HabitDto;
import com.sonic.sonictaskhub.model.entity.Category;
import com.sonic.sonictaskhub.model.entity.Habit;
import com.sonic.sonictaskhub.model.entity.User;
import com.sonic.sonictaskhub.model.enums.HabitStatus;
import com.sonic.sonictaskhub.model.request.HabitCreateRequest;
import com.sonic.sonictaskhub.repository.CategoryRepository;
import com.sonic.sonictaskhub.repository.HabitProgressRepository;
import com.sonic.sonictaskhub.repository.HabitRepository;
import com.sonic.sonictaskhub.repository.UserRepository;

@Service
@Transactional
public class HabitService {

    @Autowired
    private HabitRepository habitRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private HabitProgressRepository habitProgressRepository;

    /**
     * Generate next habit number for user
     */
    private Long generateHabitNumber(Long userId) {
        Long maxNumber = habitRepository.getMaxHabitNumberForUser(userId);
        return (maxNumber != null ? maxNumber : 0L) + 1;
    }
    
    /**
     * Create a new habit
     */
    public HabitDto createHabit(Long userId, HabitCreateRequest request) {
        // Validate
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new RuntimeException("Habit title is required");
        }

        // Get user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Create habit
        Habit habit = new Habit();
        habit.setHabitNumber(generateHabitNumber(userId));
        habit.setTitle(request.getTitle().trim());
        habit.setDescription(request.getDescription());
        habit.setHabitStage(request.getHabitStage());
        habit.setTargetDays(request.getTargetDays());
        habit.setUser(user);

        // Set category
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            habit.setCategory(category);
        }

        Habit savedHabit = habitRepository.save(habit);
        return convertToDto(savedHabit);
    }

    /**
     * Get habits with filters and pagination
     */
    public Page<HabitDto> getHabitsWithFilters(Long userId, HabitStatus status, Long categoryId, 
                                             String search, int page, int size, String sortBy, String sortDirection) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Habit> habits = habitRepository.findWithFilters(userId, status, categoryId, search, pageable);
        return habits.map(this::convertToDto);
    }

    /**
     * Get habit by ID
     */
    public HabitDto getHabitById(Long userId, Long habitId) {
        Habit habit = habitRepository.findById(habitId)
                .orElseThrow(() -> new RuntimeException("Habit not found"));
        
        if (!habit.getUser().getId().equals(userId)) {
            throw new RuntimeException("Habit doesn't belong to this user");
        }
        
        return convertToDto(habit);
    }

    /**
     * Get habit by number
     */
    public HabitDto getHabitByNumber(Long userId, Long habitNumber) {
        Habit habit = habitRepository.findByUserIdAndHabitNumber(userId, habitNumber)
                .orElseThrow(() -> new RuntimeException("Habit not found"));
        return convertToDto(habit);
    }

    /**
     * Update habit status
     */
    public HabitDto updateHabitStatus(Long userId, Long habitId, HabitStatus status) {
        Habit habit = habitRepository.findById(habitId)
                .orElseThrow(() -> new RuntimeException("Habit not found"));

        if (!habit.getUser().getId().equals(userId)) {
            throw new RuntimeException("Habit doesn't belong to this user");
        }

        habit.setStatus(status);
        Habit updatedHabit = habitRepository.save(habit);
        return convertToDto(updatedHabit);
    }

    /**
     * Delete a habit
     */
    public void deleteHabit(Long userId, Long habitId) {
        Habit habit = habitRepository.findById(habitId)
                .orElseThrow(() -> new RuntimeException("Habit not found"));

        if (!habit.getUser().getId().equals(userId)) {
            throw new RuntimeException("Habit doesn't belong to this user");
        }

        habitRepository.delete(habit);
    }
    
    /**
     * Update an existing habit
     */
    public HabitDto updateHabit(Long userId, Long habitId, HabitCreateRequest request) {
        // Validate
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new RuntimeException("Habit title is required");
        }

        // Find existing habit
        Habit habit = habitRepository.findById(habitId)
                .orElseThrow(() -> new RuntimeException("Habit not found"));

        if (!habit.getUser().getId().equals(userId)) {
            throw new RuntimeException("Habit doesn't belong to this user");
        }

        // Update habit fields
        habit.setTitle(request.getTitle().trim());
        habit.setDescription(request.getDescription());
        habit.setHabitStage(request.getHabitStage());
        habit.setTargetDays(request.getTargetDays());

        // Update category
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            habit.setCategory(category);
        } else {
            habit.setCategory(null);
        }

        Habit updatedHabit = habitRepository.save(habit);
        return convertToDto(updatedHabit);
    }

    /**
     * Convert Habit entity to HabitDto
     */
    private HabitDto convertToDto(Habit habit) {
        HabitDto dto = new HabitDto();
        dto.setId(habit.getId());
        dto.setHabitNumber(habit.getHabitNumber());
        dto.setTitle(habit.getTitle());
        dto.setDescription(habit.getDescription());
        dto.setHabitStage(habit.getHabitStage());
        dto.setTargetDays(habit.getTargetDays());
        dto.setStatus(habit.getStatus());
        dto.setSortOrder(habit.getSortOrder());
        dto.setCreatedAt(habit.getCreatedAt());
        dto.setUpdatedAt(habit.getUpdatedAt());

        // User info
        if (habit.getUser() != null) {
            dto.setUserId(habit.getUser().getId());
            dto.setUserDisplayName(habit.getUser().getDisplayName());
        }

        // Category info
        if (habit.getCategory() != null) {
            dto.setCategoryId(habit.getCategory().getId());
            dto.setCategoryName(habit.getCategory().getName());
            dto.setCategoryColor(habit.getCategory().getColor());
        }
        
        // Calculate completed days
        Long completedDays = habitProgressRepository.countByHabitId(habit.getId());
        dto.setCompletedDays(completedDays != null ? completedDays.intValue() : 0);

        return dto;
    }
}