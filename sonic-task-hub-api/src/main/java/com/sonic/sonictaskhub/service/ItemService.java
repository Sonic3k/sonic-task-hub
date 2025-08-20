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

import com.sonic.sonictaskhub.model.dto.ItemDto;
import com.sonic.sonictaskhub.model.entity.Category;
import com.sonic.sonictaskhub.model.entity.Item;
import com.sonic.sonictaskhub.model.entity.User;
import com.sonic.sonictaskhub.model.enums.Complexity;
import com.sonic.sonictaskhub.model.enums.ItemStatus;
import com.sonic.sonictaskhub.model.enums.ItemType;
import com.sonic.sonictaskhub.model.enums.Priority;
import com.sonic.sonictaskhub.model.request.ItemCreateRequest;
import com.sonic.sonictaskhub.model.request.ItemUpdateRequest;
import com.sonic.sonictaskhub.repository.CategoryRepository;
import com.sonic.sonictaskhub.repository.ItemProgressRepository;
import com.sonic.sonictaskhub.repository.ItemRepository;
import com.sonic.sonictaskhub.repository.UserRepository;

@Service
@Transactional
public class ItemService {

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private ItemProgressRepository itemProgressRepository;

    /**
     * Generate next item number for user
     */
    private Long generateItemNumber(Long userId) {
        Long maxNumber = itemRepository.getMaxItemNumberForUser(userId);
        return (maxNumber != null ? maxNumber : 0L) + 1;
    }
    
    /**
     * Create a new item from request object
     */
    public ItemDto createItem(Long userId, ItemCreateRequest request) {
        // Validate
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new RuntimeException("Item title is required");
        }
        if (request.getType() == null) {
            throw new RuntimeException("Item type is required");
        }

        // Parse enums
        ItemType type = ItemType.valueOf(request.getType().toUpperCase());
        Priority priority = request.getPriority() != null ? 
            Priority.valueOf(request.getPriority().toUpperCase()) : Priority.MEDIUM;
        Complexity complexity = request.getComplexity() != null ? 
            Complexity.valueOf(request.getComplexity().toUpperCase()) : Complexity.MEDIUM;

        // Call existing method - 10 parameters như hiện tại
        return createItem(userId, request.getTitle(), request.getDescription(), type,
                         priority, complexity, request.getDueDate(), request.getCategoryId(),
                         request.getParentItemId(), request.getEstimatedDuration());
    }

    /**
     * Update an existing item from request object
     */
    public ItemDto updateItem(Long userId, Long itemId, ItemUpdateRequest request) {
        // Parse enums
        ItemType type = request.getType() != null ? 
            ItemType.valueOf(request.getType().toUpperCase()) : null;
        Priority priority = request.getPriority() != null ? 
            Priority.valueOf(request.getPriority().toUpperCase()) : null;
        Complexity complexity = request.getComplexity() != null ? 
            Complexity.valueOf(request.getComplexity().toUpperCase()) : null;

        // Call existing method - 12 parameters như hiện tại
        return updateItem(userId, itemId, request.getTitle(), request.getDescription(),
                         type, priority, complexity, request.getDueDate(), 
                         request.getCategoryId(), request.getEstimatedDuration(),
                         request.getHabitStage(), request.getHabitTargetDays());
    }

    /**
     * Create a new item
     */
    public ItemDto createItem(Long userId, String title, String description, ItemType type, 
                             Priority priority, Complexity complexity, LocalDateTime dueDate,
                             Long categoryId, Long parentItemId, Integer estimatedDuration) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Item item = new Item();
        item.setItemNumber(generateItemNumber(userId)); // Generate unique item number
        item.setTitle(title);
        item.setDescription(description);
        item.setType(type);
        item.setPriority(priority != null ? priority : Priority.MEDIUM);
        item.setComplexity(complexity != null ? complexity : Complexity.MEDIUM);
        item.setStatus(ItemStatus.PENDING);
        item.setDueDate(dueDate);
        item.setEstimatedDuration(estimatedDuration);
        item.setUser(user);

        // Set category if provided
        if (categoryId != null) {
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            item.setCategory(category);
        }

        // Set parent item if provided (for subtasks)
        if (parentItemId != null) {
            Item parentItem = itemRepository.findById(parentItemId)
                    .orElseThrow(() -> new RuntimeException("Parent item not found"));
            
            // Verify parent item belongs to the same user
            if (!parentItem.getUser().getId().equals(userId)) {
                throw new RuntimeException("Parent item doesn't belong to this user");
            }
            
            item.setParentItem(parentItem);
        }

        Item savedItem = itemRepository.save(item);
        return convertToDto(savedItem, false);
    }

    /**
     * Get item by user and item number
     */
    public ItemDto getItemByNumber(Long userId, Long itemNumber) {
        Item item = itemRepository.findByUserIdAndItemNumber(userId, itemNumber)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        return convertToDto(item, true);
    }

    /**
     * Update an existing item
     */
    public ItemDto updateItem(Long userId, Long itemId, String title, String description, 
                             ItemType type, Priority priority, Complexity complexity, 
                             LocalDateTime dueDate, Long categoryId, Integer estimatedDuration,
                             String habitStage, Integer habitTargetDays) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        // Verify item belongs to the user
        if (!item.getUser().getId().equals(userId)) {
            throw new RuntimeException("Item doesn't belong to this user");
        }

        if (title != null) item.setTitle(title);
        if (description != null) item.setDescription(description);
        if (type != null) item.setType(type);
        if (priority != null) item.setPriority(priority);
        if (complexity != null) item.setComplexity(complexity);
        if (dueDate != null) item.setDueDate(dueDate);
        if (estimatedDuration != null) item.setEstimatedDuration(estimatedDuration);
        
        // Habit specific fields
        if (type == ItemType.HABIT) {
            if (habitStage != null) item.setHabitStage(habitStage);
            if (habitTargetDays != null) item.setHabitTargetDays(habitTargetDays);
        }

        // Update category
        if (categoryId != null) {
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            item.setCategory(category);
        }

        Item updatedItem = itemRepository.save(item);
        return convertToDto(updatedItem, false);
    }

    /**
     * Complete an item
     */
    public ItemDto completeItem(Long userId, Long itemId, Integer actualDuration) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        // Verify item belongs to the user
        if (!item.getUser().getId().equals(userId)) {
            throw new RuntimeException("Item doesn't belong to this user");
        }

        item.setStatus(ItemStatus.COMPLETED);
        item.setCompletedAt(LocalDateTime.now());
        if (actualDuration != null) {
            item.setActualDuration(actualDuration);
        }

        Item completedItem = itemRepository.save(item);
        return convertToDto(completedItem, false);
    }

    /**
     * Snooze an item
     */
    public ItemDto snoozeItem(Long userId, Long itemId, LocalDateTime snoozeUntil) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        // Verify item belongs to the user
        if (!item.getUser().getId().equals(userId)) {
            throw new RuntimeException("Item doesn't belong to this user");
        }

        item.setStatus(ItemStatus.SNOOZED);
        item.setSnoozedUntil(snoozeUntil);

        Item snoozedItem = itemRepository.save(item);
        return convertToDto(snoozedItem, false);
    }

    /**
     * Update item status
     */
    public ItemDto updateItemStatus(Long userId, Long itemId, ItemStatus status) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        // Verify item belongs to the user
        if (!item.getUser().getId().equals(userId)) {
            throw new RuntimeException("Item doesn't belong to this user");
        }

        item.setStatus(status);
        
        if (status == ItemStatus.COMPLETED) {
            item.setCompletedAt(LocalDateTime.now());
        } else if (status != ItemStatus.SNOOZED) {
            item.setSnoozedUntil(null);
        }

        Item updatedItem = itemRepository.save(item);
        return convertToDto(updatedItem, false);
    }

    /**
     * Delete an item
     */
    public void deleteItem(Long userId, Long itemId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        // Verify item belongs to the user
        if (!item.getUser().getId().equals(userId)) {
            throw new RuntimeException("Item doesn't belong to this user");
        }

        itemRepository.delete(item);
    }

    /**
     * Get item by ID
     */
    public ItemDto getItemById(Long userId, Long itemId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        // Verify item belongs to the user
        if (!item.getUser().getId().equals(userId)) {
            throw new RuntimeException("Item doesn't belong to this user");
        }

        return convertToDto(item, true);
    }

    /**
     * Get items with filters and pagination
     */
    public Page<ItemDto> getItemsWithFilters(Long userId, ItemType type, ItemStatus status, 
                                           Priority priority, Long categoryId, String searchTerm,
                                           int page, int size, String sortBy, String sortDirection) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Item> itemPage = itemRepository.findItemsWithFilters(userId, type, status, priority, 
                                                                 categoryId, searchTerm, pageable);

        return itemPage.map(item -> convertToDto(item, false));
    }

    /**
     * Get all items for a user
     */
    public Page<ItemDto> getAllUserItems(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Item> itemPage = itemRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return itemPage.map(item -> convertToDto(item, false));
    }

    /**
     * Get subtasks of an item
     */
    public List<ItemDto> getSubtasks(Long userId, Long parentItemId) {
        Item parentItem = itemRepository.findById(parentItemId)
                .orElseThrow(() -> new RuntimeException("Parent item not found"));

        // Verify parent item belongs to the user
        if (!parentItem.getUser().getId().equals(userId)) {
            throw new RuntimeException("Parent item doesn't belong to this user");
        }

        List<Item> subtasks = itemRepository.findByParentItemId(parentItemId);
        return subtasks.stream()
                .map(item -> convertToDto(item, false))
                .collect(Collectors.toList());
    }

    /**
     * Get top-level items (no parent)
     */
    public List<ItemDto> getTopLevelItems(Long userId) {
        List<Item> items = itemRepository.findByUserIdAndParentItemIsNull(userId);
        return items.stream()
                .map(item -> convertToDto(item, false))
                .collect(Collectors.toList());
    }

    /**
     * Get overdue items
     */
    public List<ItemDto> getOverdueItems(Long userId) {
        List<Item> overdueItems = itemRepository.findOverdueItems(userId, ItemStatus.PENDING, LocalDateTime.now());
        return overdueItems.stream()
                .map(item -> convertToDto(item, false))
                .collect(Collectors.toList());
    }

    /**
     * Unsnooze items that are ready
     */
    public List<ItemDto> unsnoozeReadyItems(Long userId) {
        List<Item> itemsToUnsnooze = itemRepository.findItemsToUnsnooze(userId, LocalDateTime.now());
        
        for (Item item : itemsToUnsnooze) {
            item.setStatus(ItemStatus.PENDING);
            item.setSnoozedUntil(null);
        }
        
        itemRepository.saveAll(itemsToUnsnooze);
        
        return itemsToUnsnooze.stream()
                .map(item -> convertToDto(item, false))
                .collect(Collectors.toList());
    }

    /**
     * Bulk complete items
     */
    public void bulkCompleteItems(Long userId, List<Long> itemIds) {
        for (Long itemId : itemIds) {
            completeItem(userId, itemId, null);
        }
    }

    /**
     * Bulk snooze items
     */
    public void bulkSnoozeItems(Long userId, List<Long> itemIds, LocalDateTime snoozeUntil) {
        for (Long itemId : itemIds) {
            snoozeItem(userId, itemId, snoozeUntil);
        }
    }

    /**
     * Bulk delete items
     */
    public void bulkDeleteItems(Long userId, List<Long> itemIds) {
        for (Long itemId : itemIds) {
            deleteItem(userId, itemId);
        }
    }

    /**
     * Convert Item entity to ItemDto
     */
    private ItemDto convertToDto(Item item, boolean includeSubtasks) {
        ItemDto dto = new ItemDto();
        dto.setId(item.getId());
        dto.setItemNumber(item.getItemNumber());
        dto.setTitle(item.getTitle());
        dto.setDescription(item.getDescription());
        dto.setType(item.getType());
        dto.setPriority(item.getPriority());
        dto.setComplexity(item.getComplexity());
        dto.setStatus(item.getStatus());
        dto.setDueDate(item.getDueDate());
        dto.setCompletedAt(item.getCompletedAt());
        dto.setSnoozedUntil(item.getSnoozedUntil());
        dto.setEstimatedDuration(item.getEstimatedDuration());
        dto.setActualDuration(item.getActualDuration());
        dto.setSortOrder(item.getSortOrder());
        dto.setCreatedAt(item.getCreatedAt());
        dto.setUpdatedAt(item.getUpdatedAt());
        dto.setHabitStage(item.getHabitStage());
        dto.setHabitTargetDays(item.getHabitTargetDays());

        // User info
        if (item.getUser() != null) {
            dto.setUserId(item.getUser().getId());
            dto.setUserDisplayName(item.getUser().getDisplayName());
        }

        // Category info
        if (item.getCategory() != null) {
            dto.setCategoryId(item.getCategory().getId());
            dto.setCategoryName(item.getCategory().getName());
            dto.setCategoryColor(item.getCategory().getColor());
        }

        // Parent item info
        if (item.getParentItem() != null) {
            dto.setParentItemId(item.getParentItem().getId());
            dto.setParentItemTitle(item.getParentItem().getTitle());
        }

        // Subtask counts
        dto.setSubtaskCount(item.getSubtasks().size());
        dto.setCompletedSubtaskCount((int) item.getSubtasks().stream()
                .filter(subtask -> subtask.getStatus() == ItemStatus.COMPLETED)
                .count());

        // Include subtasks if requested
        if (includeSubtasks && !item.getSubtasks().isEmpty()) {
            dto.setSubtasks(item.getSubtasks().stream()
                    .map(subtask -> convertToDto(subtask, false))
                    .collect(Collectors.toList()));
        }
        
        // Calculate habit completed days
        if (item.getType() == ItemType.HABIT) {
            Long completedDays = itemProgressRepository.countByItemId(item.getId());
            dto.setHabitCompletedDays(completedDays != null ? completedDays.intValue() : 0);
        }

        return dto;
    }
}