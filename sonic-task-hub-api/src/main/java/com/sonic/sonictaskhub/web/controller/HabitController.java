package com.sonic.sonictaskhub.web.controller;

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

import com.sonic.sonictaskhub.model.dto.HabitDto;
import com.sonic.sonictaskhub.model.enums.HabitStatus;
import com.sonic.sonictaskhub.model.request.HabitCreateRequest;
import com.sonic.sonictaskhub.model.response.BaseResponse;
import com.sonic.sonictaskhub.service.HabitService;

import java.util.Map;

/**
 * Controller for habit management operations
 */
@RestController
@RequestMapping("/api/habits")
@CrossOrigin(origins = "*")
public class HabitController {

    @Autowired
    private HabitService habitService;

    /**
     * Create a new habit
     * 
     * @param userId the ID of the user
     * @param request containing habit details
     * @return BaseResponse with created habit data
     */
    @PostMapping("/user/{userId}")
    public BaseResponse<HabitDto> createHabit(@PathVariable(name = "userId") Long userId,
                                            @RequestBody HabitCreateRequest request) {
        try {
            HabitDto habit = habitService.createHabit(userId, request);
            return BaseResponse.success("Habit created successfully", habit);
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Get habits with filters and pagination
     * 
     * @param userId the ID of the user
     * @param status filter by habit status
     * @param categoryId filter by category ID
     * @param search search term for title/description
     * @param page page number (0-based)
     * @param size page size
     * @param sortBy field to sort by
     * @param sortDirection sort direction (asc/desc)
     * @return BaseResponse with paginated habit data
     */
    @GetMapping("/user/{userId}")
    public BaseResponse<Page<HabitDto>> getHabitsWithFilters(
            @PathVariable(name = "userId") Long userId,
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "categoryId", required = false) Long categoryId,
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "page", required = false, defaultValue = "0") int page,
            @RequestParam(name = "size", required = false, defaultValue = "20") int size,
            @RequestParam(name = "sortBy", required = false, defaultValue = "createdAt") String sortBy,
            @RequestParam(name = "sortDirection", required = false, defaultValue = "desc") String sortDirection) {
        try {
            HabitStatus habitStatus = status != null ? HabitStatus.valueOf(status.toUpperCase()) : null;

            Page<HabitDto> habits = habitService.getHabitsWithFilters(userId, habitStatus, categoryId, 
                                                                    search, page, size, sortBy, sortDirection);
            return BaseResponse.success(habits);
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Get habit by ID
     * 
     * @param userId the ID of the user
     * @param habitId the ID of the habit
     * @return BaseResponse with habit data
     */
    @GetMapping("/user/{userId}/habit/{habitId}")
    public BaseResponse<HabitDto> getHabitById(@PathVariable(name = "userId") Long userId,
                                             @PathVariable(name = "habitId") Long habitId) {
        try {
            HabitDto habit = habitService.getHabitById(userId, habitId);
            return BaseResponse.success(habit);
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Get habit by habit number
     * 
     * @param userId the ID of the user
     * @param habitNumber the habit number
     * @return BaseResponse with habit data
     */
    @GetMapping("/user/{userId}/number/{habitNumber}")
    public BaseResponse<HabitDto> getHabitByNumber(@PathVariable(name = "userId") Long userId,
                                                 @PathVariable(name = "habitNumber") Long habitNumber) {
        try {
            HabitDto habit = habitService.getHabitByNumber(userId, habitNumber);
            return BaseResponse.success(habit);
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Update habit status
     * 
     * @param userId the ID of the user
     * @param habitId the ID of the habit
     * @param request containing new status
     * @return BaseResponse with updated habit data
     */
    @PutMapping("/user/{userId}/habit/{habitId}/status")
    public BaseResponse<HabitDto> updateHabitStatus(@PathVariable(name = "userId") Long userId,
                                                  @PathVariable(name = "habitId") Long habitId,
                                                  @RequestBody Map<String, String> request) {
        try {
            String statusStr = request.get("status");
            if (statusStr == null) {
                return BaseResponse.error("Status is required");
            }

            HabitStatus status = HabitStatus.valueOf(statusStr.toUpperCase());
            HabitDto habit = habitService.updateHabitStatus(userId, habitId, status);
            return BaseResponse.success("Habit status updated successfully", habit);
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }
    
    /**
     * Update an existing habit
     * 
     * @param userId the ID of the user
     * @param habitId the ID of the habit to update
     * @param request containing updated habit details
     * @return BaseResponse with updated habit data
     */
    @PutMapping("/user/{userId}/habit/{habitId}")
    public BaseResponse<HabitDto> updateHabit(@PathVariable(name = "userId") Long userId,
                                             @PathVariable(name = "habitId") Long habitId,
                                             @RequestBody HabitCreateRequest request) {
        try {
            HabitDto habit = habitService.updateHabit(userId, habitId, request);
            return BaseResponse.success("Habit updated successfully", habit);
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Delete a habit
     * 
     * @param userId the ID of the user
     * @param habitId the ID of the habit to delete
     * @return BaseResponse with success message
     */
    @DeleteMapping("/user/{userId}/habit/{habitId}")
    public BaseResponse<String> deleteHabit(@PathVariable(name = "userId") Long userId,
                                          @PathVariable(name = "habitId") Long habitId) {
        try {
            habitService.deleteHabit(userId, habitId);
            return BaseResponse.success("Habit deleted successfully", "Habit has been deleted");
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }
}