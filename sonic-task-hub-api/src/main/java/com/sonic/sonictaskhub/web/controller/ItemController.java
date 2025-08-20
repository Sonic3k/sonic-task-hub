package com.sonic.sonictaskhub.web.controller;

import com.sonic.sonictaskhub.model.dto.ItemDto;
import com.sonic.sonictaskhub.model.enums.Complexity;
import com.sonic.sonictaskhub.model.enums.ItemStatus;
import com.sonic.sonictaskhub.model.enums.ItemType;
import com.sonic.sonictaskhub.model.enums.Priority;
import com.sonic.sonictaskhub.model.response.BaseResponse;
import com.sonic.sonictaskhub.service.ItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Controller for item management operations (Tasks, Habits, Reminders)
 */
@RestController
@RequestMapping("/api/items")
@CrossOrigin(origins = "*")
public class ItemController {

    @Autowired
    private ItemService itemService;

    /**
     * Create a new item
     * 
     * @param userId the ID of the user
     * @param request containing item details
     * @return BaseResponse with created item data
     */
    @PostMapping("/user/{userId}")
    public BaseResponse<ItemDto> createItem(@PathVariable(name = "userId") Long userId,
                                           @RequestBody Map<String, Object> request) {
        try {
            System.out.println("=== CREATE ITEM DEBUG ===");
            System.out.println("Raw request data: " + request);
            
            String title = (String) request.get("title");
            String description = (String) request.get("description");
            String typeStr = (String) request.get("type");
            String priorityStr = (String) request.get("priority");
            String complexityStr = (String) request.get("complexity");
            String dueDateStr = (String) request.get("dueDate");
            Object categoryIdObj = request.get("categoryId");
            Object parentItemIdObj = request.get("parentItemId");
            Object estimatedDurationObj = request.get("estimatedDuration");

            System.out.println("Parsed dueDate string: " + dueDateStr);

            if (title == null || title.trim().isEmpty()) {
                return BaseResponse.error("Item title is required");
            }
            if (typeStr == null) {
                return BaseResponse.error("Item type is required");
            }

            ItemType type = ItemType.valueOf(typeStr.toUpperCase());
            Priority priority = priorityStr != null ? Priority.valueOf(priorityStr.toUpperCase()) : Priority.MEDIUM;
            Complexity complexity = complexityStr != null ? Complexity.valueOf(complexityStr.toUpperCase()) : Complexity.MEDIUM;
            
            LocalDateTime dueDate = null;
            if (dueDateStr != null && !dueDateStr.trim().isEmpty() && !"null".equals(dueDateStr)) {
                try {
                    dueDate = LocalDateTime.parse(dueDateStr);
                    System.out.println("Parsed dueDate: " + dueDate);
                } catch (Exception e) {
                    System.out.println("Date parsing error: " + e.getMessage());
                    return BaseResponse.error("Invalid due date format: " + dueDateStr);
                }
            }

            Long categoryId = categoryIdObj != null && !"null".equals(categoryIdObj.toString()) ? Long.valueOf(categoryIdObj.toString()) : null;
            Long parentItemId = parentItemIdObj != null && !"null".equals(parentItemIdObj.toString()) ? Long.valueOf(parentItemIdObj.toString()) : null;
            Integer estimatedDuration = estimatedDurationObj != null && !"null".equals(estimatedDurationObj.toString()) ? Integer.valueOf(estimatedDurationObj.toString()) : null;

            System.out.println("Final parsed values:");
            System.out.println("- title: " + title);
            System.out.println("- dueDate: " + dueDate);
            System.out.println("- type: " + type);
            System.out.println("- categoryId: " + categoryId);

            ItemDto item = itemService.createItem(userId, title.trim(), description, type, priority, 
                                                 complexity, dueDate, categoryId, parentItemId, estimatedDuration);
            
            System.out.println("Created item: " + item.getId() + " - " + item.getTitle());
            System.out.println("=== END CREATE ITEM DEBUG ===");
            
            return BaseResponse.success("Item created successfully", item);
            
        } catch (Exception e) {
            System.out.println("Create item exception: " + e.getMessage());
            e.printStackTrace();
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Update an existing item
     * 
     * @param userId the ID of the user
     * @param itemId the ID of the item to update
     * @param request containing updated item details
     * @return BaseResponse with updated item data
     */
    @PutMapping("/user/{userId}/item/{itemId}")
    public BaseResponse<ItemDto> updateItem(@PathVariable(name = "userId") Long userId,
                                           @PathVariable(name = "itemId") Long itemId,
                                           @RequestBody Map<String, Object> request) {
        try {
            String title = (String) request.get("title");
            String description = (String) request.get("description");
            String typeStr = (String) request.get("type");
            String priorityStr = (String) request.get("priority");
            String complexityStr = (String) request.get("complexity");
            String dueDateStr = (String) request.get("dueDate");
            Object categoryIdObj = request.get("categoryId");
            Object estimatedDurationObj = request.get("estimatedDuration");
            String habitStage = (String) request.get("habitStage");
            Object habitTargetDaysObj = request.get("habitTargetDays");

            ItemType type = typeStr != null ? ItemType.valueOf(typeStr.toUpperCase()) : null;
            Priority priority = priorityStr != null ? Priority.valueOf(priorityStr.toUpperCase()) : null;
            Complexity complexity = complexityStr != null ? Complexity.valueOf(complexityStr.toUpperCase()) : null;
            
            LocalDateTime dueDate = null;
            if (dueDateStr != null && !dueDateStr.trim().isEmpty()) {
                dueDate = LocalDateTime.parse(dueDateStr);
            }

            Long categoryId = categoryIdObj != null ? Long.valueOf(categoryIdObj.toString()) : null;
            Integer estimatedDuration = estimatedDurationObj != null ? Integer.valueOf(estimatedDurationObj.toString()) : null;
            Integer habitTargetDays = habitTargetDaysObj != null ? Integer.valueOf(habitTargetDaysObj.toString()) : null;

            ItemDto item = itemService.updateItem(userId, itemId, title, description, type, priority, 
                                                 complexity, dueDate, categoryId, estimatedDuration,
                                                 habitStage, habitTargetDays);
            return BaseResponse.success("Item updated successfully", item);
            
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Get items with filters and pagination (Main Task Studio API)
     * 
     * @param userId the ID of the user
     * @param type filter by item type
     * @param status filter by item status
     * @param priority filter by priority
     * @param categoryId filter by category ID
     * @param search search term for title/description
     * @param page page number (0-based)
     * @param size page size
     * @param sortBy field to sort by
     * @param sortDirection sort direction (asc/desc)
     * @return BaseResponse with paginated item data
     */
    @GetMapping("/user/{userId}")
    public BaseResponse<Page<ItemDto>> getItemsWithFilters(
            @PathVariable(name = "userId") Long userId,
            @RequestParam(name = "type", required = false) String type,
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "priority", required = false) String priority,
            @RequestParam(name = "categoryId", required = false) Long categoryId,
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "page", required = false, defaultValue = "0") int page,
            @RequestParam(name = "size", required = false, defaultValue = "20") int size,
            @RequestParam(name = "sortBy", required = false, defaultValue = "createdAt") String sortBy,
            @RequestParam(name = "sortDirection", required = false, defaultValue = "desc") String sortDirection) {
        try {
            ItemType itemType = type != null ? ItemType.valueOf(type.toUpperCase()) : null;
            ItemStatus itemStatus = status != null ? ItemStatus.valueOf(status.toUpperCase()) : null;
            Priority itemPriority = priority != null ? Priority.valueOf(priority.toUpperCase()) : null;

            Page<ItemDto> items = itemService.getItemsWithFilters(userId, itemType, itemStatus, itemPriority, 
                                                                 categoryId, search, page, size, sortBy, sortDirection);
            return BaseResponse.success(items);
            
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Get item by ID
     * 
     * @param userId the ID of the user
     * @param itemId the ID of the item
     * @return BaseResponse with item data
     */
    @GetMapping("/user/{userId}/item/{itemId}")
    public BaseResponse<ItemDto> getItemById(@PathVariable(name = "userId") Long userId,
                                            @PathVariable(name = "itemId") Long itemId) {
        try {
            ItemDto item = itemService.getItemById(userId, itemId);
            return BaseResponse.success(item);
            
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Get item by item number
     * 
     * @param userId the ID of the user
     * @param itemNumber the item number
     * @return BaseResponse with item data
     */
    @GetMapping("/user/{userId}/number/{itemNumber}")
    public BaseResponse<ItemDto> getItemByNumber(@PathVariable(name = "userId") Long userId,
                                                  @PathVariable(name = "itemNumber") Long itemNumber) {
        try {
            ItemDto item = itemService.getItemByNumber(userId, itemNumber);
            return BaseResponse.success(item);
            
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Complete an item
     * 
     * @param userId the ID of the user
     * @param itemId the ID of the item to complete
     * @param request containing optional actualDuration
     * @return BaseResponse with completed item data
     */
    @PutMapping("/user/{userId}/item/{itemId}/complete")
    public BaseResponse<ItemDto> completeItem(@PathVariable(name = "userId") Long userId,
                                             @PathVariable(name = "itemId") Long itemId,
                                             @RequestBody(required = false) Map<String, Object> request) {
        try {
            Integer actualDuration = null;
            if (request != null && request.get("actualDuration") != null) {
                actualDuration = Integer.valueOf(request.get("actualDuration").toString());
            }

            ItemDto item = itemService.completeItem(userId, itemId, actualDuration);
            return BaseResponse.success("Item completed successfully", item);
            
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Snooze an item
     * 
     * @param userId the ID of the user
     * @param itemId the ID of the item to snooze
     * @param request containing snoozeUntil datetime
     * @return BaseResponse with snoozed item data
     */
    @PutMapping("/user/{userId}/item/{itemId}/snooze")
    public BaseResponse<ItemDto> snoozeItem(@PathVariable(name = "userId") Long userId,
                                           @PathVariable(name = "itemId") Long itemId,
                                           @RequestBody Map<String, String> request) {
        try {
            String snoozeUntilStr = request.get("snoozeUntil");
            if (snoozeUntilStr == null || snoozeUntilStr.trim().isEmpty()) {
                return BaseResponse.error("Snooze until date is required");
            }

            LocalDateTime snoozeUntil = LocalDateTime.parse(snoozeUntilStr);
            ItemDto item = itemService.snoozeItem(userId, itemId, snoozeUntil);
            return BaseResponse.success("Item snoozed successfully", item);
            
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Update item status
     * 
     * @param userId the ID of the user
     * @param itemId the ID of the item
     * @param request containing new status
     * @return BaseResponse with updated item data
     */
    @PutMapping("/user/{userId}/item/{itemId}/status")
    public BaseResponse<ItemDto> updateItemStatus(@PathVariable(name = "userId") Long userId,
                                                 @PathVariable(name = "itemId") Long itemId,
                                                 @RequestBody Map<String, String> request) {
        try {
            String statusStr = request.get("status");
            if (statusStr == null) {
                return BaseResponse.error("Status is required");
            }

            ItemStatus status = ItemStatus.valueOf(statusStr.toUpperCase());
            ItemDto item = itemService.updateItemStatus(userId, itemId, status);
            return BaseResponse.success("Item status updated successfully", item);
            
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Delete an item
     * 
     * @param userId the ID of the user
     * @param itemId the ID of the item to delete
     * @return BaseResponse with success message
     */
    @DeleteMapping("/user/{userId}/item/{itemId}")
    public BaseResponse<String> deleteItem(@PathVariable(name = "userId") Long userId,
                                          @PathVariable(name = "itemId") Long itemId) {
        try {
            itemService.deleteItem(userId, itemId);
            return BaseResponse.success("Item deleted successfully", "Item has been deleted");
            
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Get subtasks of an item
     * 
     * @param userId the ID of the user
     * @param parentItemId the ID of the parent item
     * @return BaseResponse with list of subtasks
     */
    @GetMapping("/user/{userId}/item/{parentItemId}/subtasks")
    public BaseResponse<List<ItemDto>> getSubtasks(@PathVariable(name = "userId") Long userId,
                                                  @PathVariable(name = "parentItemId") Long parentItemId) {
        try {
            List<ItemDto> subtasks = itemService.getSubtasks(userId, parentItemId);
            return BaseResponse.success(subtasks);
            
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Get top-level items (no parent)
     * 
     * @param userId the ID of the user
     * @return BaseResponse with list of top-level items
     */
    @GetMapping("/user/{userId}/top-level")
    public BaseResponse<List<ItemDto>> getTopLevelItems(@PathVariable(name = "userId") Long userId) {
        try {
            List<ItemDto> items = itemService.getTopLevelItems(userId);
            return BaseResponse.success(items);
            
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Get overdue items
     * 
     * @param userId the ID of the user
     * @return BaseResponse with list of overdue items
     */
    @GetMapping("/user/{userId}/overdue")
    public BaseResponse<List<ItemDto>> getOverdueItems(@PathVariable(name = "userId") Long userId) {
        try {
            List<ItemDto> items = itemService.getOverdueItems(userId);
            return BaseResponse.success(items);
            
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Unsnooze items that are ready
     * 
     * @param userId the ID of the user
     * @return BaseResponse with list of unsnoozed items
     */
    @PutMapping("/user/{userId}/unsnooze")
    public BaseResponse<List<ItemDto>> unsnoozeReadyItems(@PathVariable(name = "userId") Long userId) {
        try {
            List<ItemDto> items = itemService.unsnoozeReadyItems(userId);
            return BaseResponse.success("Items unsnoozed successfully", items);
            
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Bulk complete items
     * 
     * @param userId the ID of the user
     * @param request containing list of item IDs
     * @return BaseResponse with success message
     */
    @PutMapping("/user/{userId}/bulk/complete")
    public BaseResponse<String> bulkCompleteItems(@PathVariable(name = "userId") Long userId,
                                                 @RequestBody Map<String, List<Long>> request) {
        try {
            List<Long> itemIds = request.get("itemIds");
            if (itemIds == null || itemIds.isEmpty()) {
                return BaseResponse.error("Item IDs are required");
            }

            itemService.bulkCompleteItems(userId, itemIds);
            return BaseResponse.success("Items completed successfully", itemIds.size() + " items completed");
            
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Bulk snooze items
     * 
     * @param userId the ID of the user
     * @param request containing list of item IDs and snoozeUntil datetime
     * @return BaseResponse with success message
     */
    @PutMapping("/user/{userId}/bulk/snooze")
    public BaseResponse<String> bulkSnoozeItems(@PathVariable(name = "userId") Long userId,
                                               @RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            List<Long> itemIds = (List<Long>) request.get("itemIds");
            String snoozeUntilStr = (String) request.get("snoozeUntil");

            if (itemIds == null || itemIds.isEmpty()) {
                return BaseResponse.error("Item IDs are required");
            }
            if (snoozeUntilStr == null || snoozeUntilStr.trim().isEmpty()) {
                return BaseResponse.error("Snooze until date is required");
            }

            LocalDateTime snoozeUntil = LocalDateTime.parse(snoozeUntilStr);
            itemService.bulkSnoozeItems(userId, itemIds, snoozeUntil);
            return BaseResponse.success("Items snoozed successfully", itemIds.size() + " items snoozed");
            
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Bulk delete items
     * 
     * @param userId the ID of the user
     * @param request containing list of item IDs
     * @return BaseResponse with success message
     */
    @DeleteMapping("/user/{userId}/bulk")
    public BaseResponse<String> bulkDeleteItems(@PathVariable(name = "userId") Long userId,
                                               @RequestBody Map<String, List<Long>> request) {
        try {
            List<Long> itemIds = request.get("itemIds");
            if (itemIds == null || itemIds.isEmpty()) {
                return BaseResponse.error("Item IDs are required");
            }

            itemService.bulkDeleteItems(userId, itemIds);
            return BaseResponse.success("Items deleted successfully", itemIds.size() + " items deleted");
            
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }
}