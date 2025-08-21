package com.sonic.sonictaskhub.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sonic.sonictaskhub.model.dto.TaskDto;
import com.sonic.sonictaskhub.model.entity.Category;
import com.sonic.sonictaskhub.model.entity.Task;
import com.sonic.sonictaskhub.model.entity.User;
import com.sonic.sonictaskhub.model.enums.Complexity;
import com.sonic.sonictaskhub.model.enums.Priority;
import com.sonic.sonictaskhub.model.enums.TaskStatus;
import com.sonic.sonictaskhub.model.request.TaskCreateRequest;
import com.sonic.sonictaskhub.repository.CategoryRepository;
import com.sonic.sonictaskhub.repository.TaskRepository;
import com.sonic.sonictaskhub.repository.UserRepository;

@Service
@Transactional
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    /**
     * Generate next task number for user
     */
    private Long generateTaskNumber(Long userId) {
        Long maxNumber = taskRepository.getMaxTaskNumberForUser(userId);
        return (maxNumber != null ? maxNumber : 0L) + 1;
    }
    
    /**
     * Create a new task
     */
    public TaskDto createTask(Long userId, TaskCreateRequest request) {
        // Validate
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new RuntimeException("Task title is required");
        }

        // Parse enums
        Priority priority = request.getPriority() != null ? 
            Priority.valueOf(request.getPriority().toUpperCase()) : Priority.MEDIUM;
        Complexity complexity = request.getComplexity() != null ?
            Complexity.valueOf(request.getComplexity().toUpperCase()) : Complexity.MEDIUM;

        // Get user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Create task
        Task task = new Task();
        task.setTaskNumber(generateTaskNumber(userId));
        task.setTitle(request.getTitle().trim());
        task.setDescription(request.getDescription());
        task.setPriority(priority);
        task.setComplexity(complexity);
        task.setDueDate(request.getDueDate());
        task.setEstimatedDuration(request.getEstimatedDuration());
        task.setUser(user);

        // Set category
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            task.setCategory(category);
        }

        // Set parent task for subtasks
        if (request.getParentTaskId() != null) {
            Task parentTask = taskRepository.findById(request.getParentTaskId())
                    .orElseThrow(() -> new RuntimeException("Parent task not found"));
            
            if (!parentTask.getUser().getId().equals(userId)) {
                throw new RuntimeException("Parent task doesn't belong to this user");
            }
            task.setParentTask(parentTask);
        }

        Task savedTask = taskRepository.save(task);
        return convertToDto(savedTask, false);
    }

    /**
     * Get tasks with filters and pagination
     */
    public Page<TaskDto> getTasksWithFilters(Long userId, TaskStatus status, Priority priority, 
                                           Long categoryId, String search, int page, int size, 
                                           String sortBy, String sortDirection) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Task> tasks = taskRepository.findWithFilters(userId, status, priority, categoryId, search, pageable);
        return tasks.map(task -> convertToDto(task, false));
    }

    /**
     * Get task by ID
     */
    public TaskDto getTaskById(Long userId, Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        
        if (!task.getUser().getId().equals(userId)) {
            throw new RuntimeException("Task doesn't belong to this user");
        }
        
        return convertToDto(task, true);
    }

    /**
     * Get task by number
     */
    public TaskDto getTaskByNumber(Long userId, Long taskNumber) {
        Task task = taskRepository.findByUserIdAndTaskNumber(userId, taskNumber)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        return convertToDto(task, true);
    }

    /**
     * Complete a task
     */
    public TaskDto completeTask(Long userId, Long taskId, Integer actualDuration) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (!task.getUser().getId().equals(userId)) {
            throw new RuntimeException("Task doesn't belong to this user");
        }

        task.setStatus(TaskStatus.COMPLETED);
        task.setCompletedAt(LocalDateTime.now());
        if (actualDuration != null) {
            task.setActualDuration(actualDuration);
        }

        Task completedTask = taskRepository.save(task);
        return convertToDto(completedTask, false);
    }

    /**
     * Snooze a task
     */
    public TaskDto snoozeTask(Long userId, Long taskId, LocalDateTime snoozeUntil) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (!task.getUser().getId().equals(userId)) {
            throw new RuntimeException("Task doesn't belong to this user");
        }

        task.setStatus(TaskStatus.SNOOZED);
        task.setSnoozedUntil(snoozeUntil);

        Task snoozedTask = taskRepository.save(task);
        return convertToDto(snoozedTask, false);
    }

    /**
     * Delete a task
     */
    public void deleteTask(Long userId, Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (!task.getUser().getId().equals(userId)) {
            throw new RuntimeException("Task doesn't belong to this user");
        }

        taskRepository.delete(task);
    }

    /**
     * Get subtasks for a parent task
     */
    public List<TaskDto> getSubtasks(Long userId, Long parentTaskId) {
        Task parentTask = taskRepository.findById(parentTaskId)
                .orElseThrow(() -> new RuntimeException("Parent task not found"));

        if (!parentTask.getUser().getId().equals(userId)) {
            throw new RuntimeException("Parent task doesn't belong to this user");
        }

        List<Task> subtasks = taskRepository.findByParentTaskId(parentTaskId);
        return subtasks.stream()
                .map(task -> convertToDto(task, false))
                .collect(Collectors.toList());
    }

    /**
     * Convert Task entity to TaskDto
     */
    private TaskDto convertToDto(Task task, boolean includeSubtasks) {
        TaskDto dto = new TaskDto();
        dto.setId(task.getId());
        dto.setTaskNumber(task.getTaskNumber());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setPriority(task.getPriority());
        dto.setComplexity(task.getComplexity());
        dto.setStatus(task.getStatus());
        dto.setDueDate(task.getDueDate());
        dto.setCompletedAt(task.getCompletedAt());
        dto.setSnoozedUntil(task.getSnoozedUntil());
        dto.setEstimatedDuration(task.getEstimatedDuration());
        dto.setActualDuration(task.getActualDuration());
        dto.setSortOrder(task.getSortOrder());
        dto.setCreatedAt(task.getCreatedAt());
        dto.setUpdatedAt(task.getUpdatedAt());

        // User info
        if (task.getUser() != null) {
            dto.setUserId(task.getUser().getId());
            dto.setUserDisplayName(task.getUser().getDisplayName());
        }

        // Category info
        if (task.getCategory() != null) {
            dto.setCategoryId(task.getCategory().getId());
            dto.setCategoryName(task.getCategory().getName());
            dto.setCategoryColor(task.getCategory().getColor());
        }

        // Parent task info
        if (task.getParentTask() != null) {
            dto.setParentTaskId(task.getParentTask().getId());
            dto.setParentTaskTitle(task.getParentTask().getTitle());
        }

        // Subtask counts
        dto.setSubtaskCount(task.getSubtasks().size());
        dto.setCompletedSubtaskCount((int) task.getSubtasks().stream()
                .filter(subtask -> subtask.getStatus() == TaskStatus.COMPLETED)
                .count());

        // Include subtasks if requested
        if (includeSubtasks && !task.getSubtasks().isEmpty()) {
            dto.setSubtasks(task.getSubtasks().stream()
                    .map(subtask -> convertToDto(subtask, false))
                    .collect(Collectors.toList()));
        }

        return dto;
    }
}