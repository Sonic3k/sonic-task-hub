package com.sonic.sonictaskhub.web.controller;

import com.sonic.sonictaskhub.model.dto.CategoryDto;
import com.sonic.sonictaskhub.model.response.BaseResponse;
import com.sonic.sonictaskhub.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller for category management operations
 */
@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    /**
     * Get all available categories for a user (default + user-created)
     * 
     * @param userId the ID of the user
     * @return BaseResponse with list of available categories
     */
    @GetMapping("/user/{userId}")
    public BaseResponse<List<CategoryDto>> getAvailableCategoriesForUser(@PathVariable(name = "userId") Long userId) {
        try {
            List<CategoryDto> categories = categoryService.getAvailableCategoriesForUser(userId);
            return BaseResponse.success(categories);
            
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Get user's custom categories only
     * 
     * @param userId the ID of the user
     * @return BaseResponse with list of user's custom categories
     */
    @GetMapping("/user/{userId}/custom")
    public BaseResponse<List<CategoryDto>> getUserCustomCategories(@PathVariable(name = "userId") Long userId) {
        try {
            List<CategoryDto> categories = categoryService.getUserCategories(userId);
            return BaseResponse.success(categories);
            
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Create a new user category
     * 
     * @param userId the ID of the user
     * @param request containing name, description, and color
     * @return BaseResponse with created category data
     */
    @PostMapping("/user/{userId}")
    public BaseResponse<CategoryDto> createUserCategory(@PathVariable(name = "userId") Long userId,
                                                       @RequestBody Map<String, String> request) {
        try {
            String name = request.get("name");
            String description = request.get("description");
            String color = request.get("color");

            if (name == null || name.trim().isEmpty()) {
                return BaseResponse.error("Category name is required");
            }

            CategoryDto category = categoryService.createUserCategory(userId, name.trim(), description, color);
            return BaseResponse.success("Category created successfully", category);
            
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Update a user category
     * 
     * @param userId the ID of the user
     * @param categoryId the ID of the category to update
     * @param request containing name, description, and color
     * @return BaseResponse with updated category data
     */
    @PutMapping("/user/{userId}/category/{categoryId}")
    public BaseResponse<CategoryDto> updateUserCategory(@PathVariable(name = "userId") Long userId,
                                                       @PathVariable(name = "categoryId") Long categoryId,
                                                       @RequestBody Map<String, String> request) {
        try {
            String name = request.get("name");
            String description = request.get("description");
            String color = request.get("color");

            CategoryDto category = categoryService.updateUserCategory(userId, categoryId, name, description, color);
            return BaseResponse.success("Category updated successfully", category);
            
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Delete a user category
     * 
     * @param userId the ID of the user
     * @param categoryId the ID of the category to delete
     * @return BaseResponse with success message
     */
    @DeleteMapping("/user/{userId}/category/{categoryId}")
    public BaseResponse<String> deleteUserCategory(@PathVariable(name = "userId") Long userId,
                                                  @PathVariable(name = "categoryId") Long categoryId) {
        try {
            categoryService.deleteUserCategory(userId, categoryId);
            return BaseResponse.success("Category deleted successfully", "Category has been deleted");
            
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Get category by ID
     * 
     * @param categoryId the ID of the category
     * @return BaseResponse with category data
     */
    @GetMapping("/{categoryId}")
    public BaseResponse<CategoryDto> getCategoryById(@PathVariable(name = "categoryId") Long categoryId) {
        try {
            CategoryDto category = categoryService.getCategoryById(categoryId);
            return BaseResponse.success(category);
            
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }
}