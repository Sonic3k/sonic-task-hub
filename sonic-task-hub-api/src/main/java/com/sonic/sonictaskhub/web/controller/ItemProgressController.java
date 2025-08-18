package com.sonic.sonictaskhub.web.controller;

import com.sonic.sonictaskhub.model.dto.ItemProgressDto;
import com.sonic.sonictaskhub.model.response.BaseResponse;
import com.sonic.sonictaskhub.service.ItemProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Controller for item progress management (habit tracking)
 */
@RestController
@RequestMapping("/api/progress")
@CrossOrigin(origins = "*")
public class ItemProgressController {

    @Autowired
    private ItemProgressService itemProgressService;

    /**
     * Log progress for an item
     * 
     * @param userId the ID of the user
     * @param itemId the ID of the item
     * @param request containing progress details
     * @return BaseResponse with created progress data
     */
    @PostMapping("/user/{userId}/item/{itemId}")
    public BaseResponse<ItemProgressDto> logProgress(@PathVariable(name = "userId") Long userId,
                                                    @PathVariable(name = "itemId") Long itemId,
                                                    @RequestBody Map<String, Object> request) {
        try {
            String sessionDateStr = (String) request.get("sessionDate");
            Object durationObj = request.get("duration");
            String notes = (String) request.get("notes");
            Object progressValueObj = request.get("progressValue");
            String progressUnit = (String) request.get("progressUnit");

            LocalDate sessionDate = null;
            if (sessionDateStr != null && !sessionDateStr.trim().isEmpty()) {
                sessionDate = LocalDate.parse(sessionDateStr);
            }

            Integer duration = durationObj != null ? Integer.valueOf(durationObj.toString()) : null;
            Double progressValue = progressValueObj != null ? Double.valueOf(progressValueObj.toString()) : null;

            ItemProgressDto progress = itemProgressService.logProgress(userId, itemId, sessionDate, 
                                                                      duration, notes, progressValue, progressUnit);
            return BaseResponse.success("Progress logged successfully", progress);
            
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Update existing progress entry
     * 
     * @param userId the ID of the user
     * @param progressId the ID of the progress entry
     * @param request containing updated progress details
     * @return BaseResponse with updated progress data
     */
    @PutMapping("/user/{userId}/progress/{progressId}")
    public BaseResponse<ItemProgressDto> updateProgress(@PathVariable(name = "userId") Long userId,
                                                       @PathVariable(name = "progressId") Long progressId,
                                                       @RequestBody Map<String, Object> request) {
        try {
            Object durationObj = request.get("duration");
            String notes = (String) request.get("notes");
            Object progressValueObj = request.get("progressValue");
            String progressUnit = (String) request.get("progressUnit");

            Integer duration = durationObj != null ? Integer.valueOf(durationObj.toString()) : null;
            Double progressValue = progressValueObj != null ? Double.valueOf(progressValueObj.toString()) : null;

            ItemProgressDto progress = itemProgressService.updateProgress(userId, progressId, duration, 
                                                                         notes, progressValue, progressUnit);
            return BaseResponse.success("Progress updated successfully", progress);
            
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
            itemProgressService.deleteProgress(userId, progressId);
            return BaseResponse.success("Progress entry deleted successfully", "Progress entry has been deleted");
            
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Get all progress entries for an item
     * 
     * @param userId the ID of the user
     * @param itemId the ID of the item
     * @return BaseResponse with list of progress entries
     */
    @GetMapping("/user/{userId}/item/{itemId}")
    public BaseResponse<List<ItemProgressDto>> getItemProgress(@PathVariable(name = "userId") Long userId,
                                                              @PathVariable(name = "itemId") Long itemId) {
        try {
            List<ItemProgressDto> progressList = itemProgressService.getItemProgress(userId, itemId);
            return BaseResponse.success(progressList);
            
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Get progress entries for an item within a date range
     * 
     * @param userId the ID of the user
     * @param itemId the ID of the item
     * @param startDate start date of the range
     * @param endDate end date of the range
     * @return BaseResponse with list of progress entries in date range
     */
    @GetMapping("/user/{userId}/item/{itemId}/range")
    public BaseResponse<List<ItemProgressDto>> getItemProgressInDateRange(
            @PathVariable(name = "userId") Long userId,
            @PathVariable(name = "itemId") Long itemId,
            @RequestParam(name = "startDate", required = true) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(name = "endDate", required = true) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            List<ItemProgressDto> progressList = itemProgressService.getItemProgressInDateRange(userId, itemId, startDate, endDate);
            return BaseResponse.success(progressList);
            
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Get progress entry by ID
     * 
     * @param userId the ID of the user
     * @param progressId the ID of the progress entry
     * @return BaseResponse with progress data
     */
    @GetMapping("/user/{userId}/progress/{progressId}")
    public BaseResponse<ItemProgressDto> getProgressById(@PathVariable(name = "userId") Long userId,
                                                        @PathVariable(name = "progressId") Long progressId) {
        try {
            ItemProgressDto progress = itemProgressService.getProgressById(userId, progressId);
            return BaseResponse.success(progress);
            
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Check if there's already a progress entry for an item on a specific date
     * 
     * @param userId the ID of the user
     * @param itemId the ID of the item
     * @param date the date to check
     * @return BaseResponse with boolean indicating if progress exists
     */
    @GetMapping("/user/{userId}/item/{itemId}/check")
    public BaseResponse<Boolean> hasProgressForDate(@PathVariable(name = "userId") Long userId,
                                                   @PathVariable(name = "itemId") Long itemId,
                                                   @RequestParam(name = "date", required = true) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            boolean hasProgress = itemProgressService.hasProgressForDate(userId, itemId, date);
            return BaseResponse.success("Progress check completed", hasProgress);
            
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Get total duration for an item
     * 
     * @param userId the ID of the user
     * @param itemId the ID of the item
     * @return BaseResponse with total duration
     */
    @GetMapping("/user/{userId}/item/{itemId}/total-duration")
    public BaseResponse<Integer> getTotalDurationForItem(@PathVariable(name = "userId") Long userId,
                                                        @PathVariable(name = "itemId") Long itemId) {
        try {
            Integer totalDuration = itemProgressService.getTotalDurationForItem(userId, itemId);
            return BaseResponse.success("Total duration calculated", totalDuration);
            
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Get total progress value for an item
     * 
     * @param userId the ID of the user
     * @param itemId the ID of the item
     * @return BaseResponse with total progress value
     */
    @GetMapping("/user/{userId}/item/{itemId}/total-progress")
    public BaseResponse<Double> getTotalProgressValueForItem(@PathVariable(name = "userId") Long userId,
                                                            @PathVariable(name = "itemId") Long itemId) {
        try {
            Double totalProgressValue = itemProgressService.getTotalProgressValueForItem(userId, itemId);
            return BaseResponse.success("Total progress value calculated", totalProgressValue);
            
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Get progress statistics for an item
     * 
     * @param userId the ID of the user
     * @param itemId the ID of the item
     * @return BaseResponse with progress statistics
     */
    @GetMapping("/user/{userId}/item/{itemId}/statistics")
    public BaseResponse<ItemProgressService.ProgressStatistics> getProgressStatistics(@PathVariable(name = "userId") Long userId,
                                                                                      @PathVariable(name = "itemId") Long itemId) {
        try {
            ItemProgressService.ProgressStatistics statistics = itemProgressService.getProgressStatistics(userId, itemId);
            return BaseResponse.success("Progress statistics calculated", statistics);
            
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }
}