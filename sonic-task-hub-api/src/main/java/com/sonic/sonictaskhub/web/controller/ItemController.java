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

import com.sonic.sonictaskhub.model.dto.ItemDto;
import com.sonic.sonictaskhub.model.enums.ItemStatus;
import com.sonic.sonictaskhub.model.enums.ItemType;
import com.sonic.sonictaskhub.model.enums.Priority;
import com.sonic.sonictaskhub.model.request.ItemCreateRequest;
import com.sonic.sonictaskhub.model.request.ItemUpdateRequest;
import com.sonic.sonictaskhub.model.response.BaseResponse;
import com.sonic.sonictaskhub.service.ItemService;

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
                                           @RequestBody ItemCreateRequest request) {
        try {
            ItemDto item = itemService.createItem(userId, request);
            return BaseResponse.success("Item created successfully", item);
        } catch (Exception e) {
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
                                           @RequestBody ItemUpdateRequest request) {
        try {
            ItemDto item = itemService.updateItem(userId, itemId, request);
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