package com.sonic.sonictaskhub.web.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sonic.sonictaskhub.model.dto.HabitProgressDto;
import com.sonic.sonictaskhub.model.response.BaseResponse;
import com.sonic.sonictaskhub.service.HabitProgressService;

/**
 * Controller for habit progress tracking operations
 */
@RestController
@RequestMapping("/api/habit-progress")
@CrossOrigin(origins = "*")
public class HabitProgressController {

    @Autowired
    private HabitProgressService habitProgressService;

    /**
     * Log habit progress
     * 
     * @param userId the ID of the user
     * @param habitId the ID of the habit
     * @param request containing progress details
     * @return BaseResponse with logged progress data
     */
    @PostMapping("/user/{userId}/habit/{habitId}")
    public BaseResponse<HabitProgressDto> logProgress(@PathVariable(name = "userId") Long userId,
                                                    @PathVariable(name = "habitId") Long habitId,
                                                    @RequestBody Map<String, Object> request) {
        try {
            String sessionDateStr = (String) request.get("sessionDate");
            LocalDate sessionDate = sessionDateStr != null ? LocalDate.parse(sessionDateStr) : LocalDate.now();
            
            Integer duration = request.containsKey("duration") ? (Integer) request.get("duration") : null;
            String notes = (String) request.get("notes");
            Double progressValue = request.containsKey("progressValue") ? 
                ((Number) request.get("progressValue")).doubleValue() : null;
            String progressUnit = (String) request.get("progressUnit");

            HabitProgressDto progress = habitProgressService.logProgress(userId, habitId, sessionDate, 
                                                                        duration, notes, progressValue, progressUnit);
            return BaseResponse.success("Progress logged successfully", progress);
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Get progress for a habit
     * 
     * @param userId the ID of the user
     * @param habitId the ID of the habit
     * @return BaseResponse with list of progress entries
     */
    @GetMapping("/user/{userId}/habit/{habitId}")
    public BaseResponse<List<HabitProgressDto>> getProgressForHabit(@PathVariable(name = "userId") Long userId,
                                                                  @PathVariable(name = "habitId") Long habitId) {
        try {
            List<HabitProgressDto> progress = habitProgressService.getProgressForHabit(userId, habitId);
            return BaseResponse.success(progress);
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Get progress in date range
     * 
     * @param userId the ID of the user
     * @param habitId the ID of the habit
     * @param startDate start date for range
     * @param endDate end date for range
     * @return BaseResponse with list of progress entries in range
     */
    @GetMapping("/user/{userId}/habit/{habitId}/range")
    public BaseResponse<List<HabitProgressDto>> getProgressInDateRange(
            @PathVariable(name = "userId") Long userId,
            @PathVariable(name = "habitId") Long habitId,
            @RequestParam(name = "startDate", required = true) String startDate,
            @RequestParam(name = "endDate", required = true) String endDate) {
        try {
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);
            
            List<HabitProgressDto> progress = habitProgressService.getProgressInDateRange(userId, habitId, start, end);
            return BaseResponse.success(progress);
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Delete progress entry
     * 
     * @param userId the ID of the user
     * @param progressId the ID of the progress entry to delete
     * @return BaseResponse with success message
     */
    @DeleteMapping("/user/{userId}/progress/{progressId}")
    public BaseResponse<String> deleteProgress(@PathVariable(name = "userId") Long userId,
                                             @PathVariable(name = "progressId") Long progressId) {
        try {
            habitProgressService.deleteProgress(userId, progressId);
            return BaseResponse.success("Progress entry deleted successfully", "Progress entry has been deleted");
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }
}