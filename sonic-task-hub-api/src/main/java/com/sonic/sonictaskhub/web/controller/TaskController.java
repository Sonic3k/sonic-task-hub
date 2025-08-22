package com.sonic.sonictaskhub.web.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

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

import com.sonic.sonictaskhub.model.dto.TaskDto;
import com.sonic.sonictaskhub.model.enums.Priority;
import com.sonic.sonictaskhub.model.enums.TaskStatus;
import com.sonic.sonictaskhub.model.request.TaskCreateRequest;
import com.sonic.sonictaskhub.model.response.BaseResponse;
import com.sonic.sonictaskhub.service.TaskService;

/**
 * Controller for task management operations
 */
@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
public class TaskController {

    @Autowired
    private TaskService taskService;

    /**
     * Create a new task
     * 
     * @param userId the ID of the user
     * @param request containing task details
     * @return BaseResponse with created task data
     */
    @PostMapping("/user/{userId}")
    public BaseResponse<TaskDto> createTask(@PathVariable(name = "userId") Long userId,
                                           @RequestBody TaskCreateRequest request) {
        try {
            TaskDto task = taskService.createTask(userId, request);
            return BaseResponse.success("Task created successfully", task);
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Get tasks with filters and pagination
     * 
     * @param userId the ID of the user
     * @param status filter by task status
     * @param priority filter by priority
     * @param categoryId filter by category ID
     * @param search search term for title/description
     * @param page page number (0-based)
     * @param size page size
     * @param sortBy field to sort by
     * @param sortDirection sort direction (asc/desc)
     * @return BaseResponse with paginated task data
     */
    @GetMapping("/user/{userId}")
    public BaseResponse<Page<TaskDto>> getTasksWithFilters(
            @PathVariable(name = "userId") Long userId,
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "priority", required = false) String priority,
            @RequestParam(name = "categoryId", required = false) Long categoryId,
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "page", required = false, defaultValue = "0") int page,
            @RequestParam(name = "size", required = false, defaultValue = "20") int size,
            @RequestParam(name = "sortBy", required = false, defaultValue = "createdAt") String sortBy,
            @RequestParam(name = "sortDirection", required = false, defaultValue = "desc") String sortDirection) {
        try {
            TaskStatus taskStatus = status != null ? TaskStatus.valueOf(status.toUpperCase()) : null;
            Priority taskPriority = priority != null ? Priority.valueOf(priority.toUpperCase()) : null;

            Page<TaskDto> tasks = taskService.getTasksWithFilters(userId, taskStatus, taskPriority, 
                                                                 categoryId, search, page, size, sortBy, sortDirection);
            return BaseResponse.success(tasks);
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Get task by ID
     * 
     * @param userId the ID of the user
     * @param taskId the ID of the task
     * @return BaseResponse with task data
     */
    @GetMapping("/user/{userId}/task/{taskId}")
    public BaseResponse<TaskDto> getTaskById(@PathVariable(name = "userId") Long userId,
                                           @PathVariable(name = "taskId") Long taskId) {
        try {
            TaskDto task = taskService.getTaskById(userId, taskId);
            return BaseResponse.success(task);
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Get task by task number
     * 
     * @param userId the ID of the user
     * @param taskNumber the task number
     * @return BaseResponse with task data
     */
    @GetMapping("/user/{userId}/number/{taskNumber}")
    public BaseResponse<TaskDto> getTaskByNumber(@PathVariable(name = "userId") Long userId,
                                                @PathVariable(name = "taskNumber") Long taskNumber) {
        try {
            TaskDto task = taskService.getTaskByNumber(userId, taskNumber);
            return BaseResponse.success(task);
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Complete a task
     * 
     * @param userId the ID of the user
     * @param taskId the ID of the task to complete
     * @param request containing optional actualDuration
     * @return BaseResponse with completed task data
     */
    @PutMapping("/user/{userId}/task/{taskId}/complete")
    public BaseResponse<TaskDto> completeTask(@PathVariable(name = "userId") Long userId,
                                            @PathVariable(name = "taskId") Long taskId,
                                            @RequestBody(required = false) Map<String, Object> request) {
        try {
            Integer actualDuration = null;
            if (request != null && request.containsKey("actualDuration")) {
                actualDuration = (Integer) request.get("actualDuration");
            }

            TaskDto task = taskService.completeTask(userId, taskId, actualDuration);
            return BaseResponse.success("Task completed successfully", task);
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Snooze a task
     * 
     * @param userId the ID of the user
     * @param taskId the ID of the task to snooze
     * @param request containing snoozeUntil datetime
     * @return BaseResponse with snoozed task data
     */
    @PutMapping("/user/{userId}/task/{taskId}/snooze")
    public BaseResponse<TaskDto> snoozeTask(@PathVariable(name = "userId") Long userId,
                                          @PathVariable(name = "taskId") Long taskId,
                                          @RequestBody Map<String, String> request) {
        try {
            String snoozeUntilStr = request.get("snoozeUntil");
            if (snoozeUntilStr == null) {
                return BaseResponse.error("snoozeUntil is required");
            }

            LocalDateTime snoozeUntil = LocalDateTime.parse(snoozeUntilStr);
            TaskDto task = taskService.snoozeTask(userId, taskId, snoozeUntil);
            return BaseResponse.success("Task snoozed successfully", task);
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Get subtasks for a parent task
     * 
     * @param userId the ID of the user
     * @param parentTaskId the ID of the parent task
     * @return BaseResponse with list of subtasks
     */
    @GetMapping("/user/{userId}/task/{parentTaskId}/subtasks")
    public BaseResponse<List<TaskDto>> getSubtasks(@PathVariable(name = "userId") Long userId,
                                                  @PathVariable(name = "parentTaskId") Long parentTaskId) {
        try {
            List<TaskDto> subtasks = taskService.getSubtasks(userId, parentTaskId);
            return BaseResponse.success(subtasks);
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Update an existing task
     * 
     * @param userId the ID of the user
     * @param taskId the ID of the task to update
     * @param request containing updated task details
     * @return BaseResponse with updated task data
     */
    @PutMapping("/user/{userId}/task/{taskId}")
    public BaseResponse<TaskDto> updateTask(@PathVariable(name = "userId") Long userId,
                                           @PathVariable(name = "taskId") Long taskId,
                                           @RequestBody TaskCreateRequest request) {
        try {
            TaskDto task = taskService.updateTask(userId, taskId, request);
            return BaseResponse.success("Task updated successfully", task);
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }
    
    /**
     * Delete a task
     * 
     * @param userId the ID of the user
     * @param taskId the ID of the task to delete
     * @return BaseResponse with success message
     */
    @DeleteMapping("/user/{userId}/task/{taskId}")
    public BaseResponse<String> deleteTask(@PathVariable(name = "userId") Long userId,
                                         @PathVariable(name = "taskId") Long taskId) {
        try {
            taskService.deleteTask(userId, taskId);
            return BaseResponse.success("Task deleted successfully", "Task has been deleted");
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }
}