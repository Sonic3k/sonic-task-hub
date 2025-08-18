package com.sonic.sonictaskhub.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sonic.sonictaskhub.model.dto.CategoryDto;
import com.sonic.sonictaskhub.model.entity.Category;
import com.sonic.sonictaskhub.model.entity.User;
import com.sonic.sonictaskhub.repository.CategoryRepository;
import com.sonic.sonictaskhub.repository.UserRepository;

import jakarta.annotation.PostConstruct;

@Service
@Transactional
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Initialize default categories
     */
    @PostConstruct
    public void initializeDefaultCategories() {
        List<Category> existingDefaults = categoryRepository.findByIsDefaultTrueAndIsActiveTrue();
        if (existingDefaults.isEmpty()) {
            createDefaultCategories();
        }
    }

    private void createDefaultCategories() {
        String[] defaultCategories = {
            "Work", "Personal", "Health", "Learning", "Creative", "Finance", "Home", "Travel"
        };
        
        String[] defaultColors = {
            "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444", "#06B6D4", "#84CC16", "#F97316"
        };

        for (int i = 0; i < defaultCategories.length; i++) {
            Category category = new Category();
            category.setName(defaultCategories[i]);
            category.setDescription("Default " + defaultCategories[i] + " category");
            category.setColor(defaultColors[i]);
            category.setIsDefault(true);
            category.setIsActive(true);
            categoryRepository.save(category);
        }
    }

    /**
     * Get all available categories for a user (default + user-created)
     */
    public List<CategoryDto> getAvailableCategoriesForUser(Long userId) {
        List<Category> categories = categoryRepository.findAvailableCategoriesForUser(userId);
        return categories.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Create a new user category
     */
    public CategoryDto createUserCategory(Long userId, String name, String description, String color) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user already has a category with this name
        List<Category> existingCategories = categoryRepository.findByUserIdAndName(userId, name);
        if (!existingCategories.isEmpty()) {
            throw new RuntimeException("Category with this name already exists");
        }

        Category category = new Category();
        category.setName(name);
        category.setDescription(description);
        category.setColor(color != null ? color : "#6B7280"); // Default gray color
        category.setIsDefault(false);
        category.setUser(user);
        category.setIsActive(true);

        Category savedCategory = categoryRepository.save(category);
        return convertToDto(savedCategory);
    }

    /**
     * Update user category
     */
    public CategoryDto updateUserCategory(Long userId, Long categoryId, String name, String description, String color) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        // Check if it's a default category
        if (category.getIsDefault()) {
            throw new RuntimeException("Cannot modify default categories");
        }

        // Check if user owns this category
        if (category.getUser() == null || !category.getUser().getId().equals(userId)) {
            throw new RuntimeException("You don't have permission to modify this category");
        }

        // Check if name is being changed and conflicts with existing
        if (name != null && !name.equals(category.getName())) {
            List<Category> existingCategories = categoryRepository.findByUserIdAndName(userId, name);
            if (!existingCategories.isEmpty()) {
                throw new RuntimeException("Category with this name already exists");
            }
            category.setName(name);
        }

        if (description != null) {
            category.setDescription(description);
        }

        if (color != null) {
            category.setColor(color);
        }

        Category updatedCategory = categoryRepository.save(category);
        return convertToDto(updatedCategory);
    }

    /**
     * Delete user category
     */
    public void deleteUserCategory(Long userId, Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        // Check if it's a default category
        if (category.getIsDefault()) {
            throw new RuntimeException("Cannot delete default categories");
        }

        // Check if user owns this category
        if (category.getUser() == null || !category.getUser().getId().equals(userId)) {
            throw new RuntimeException("You don't have permission to delete this category");
        }

        // Soft delete by setting isActive to false
        category.setIsActive(false);
        categoryRepository.save(category);
    }

    /**
     * Get category by ID
     */
    public CategoryDto getCategoryById(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        return convertToDto(category);
    }

    /**
     * Get user's custom categories
     */
    public List<CategoryDto> getUserCategories(Long userId) {
        List<Category> categories = categoryRepository.findByUserIdAndIsActiveTrue(userId);
        return categories.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Convert Category entity to CategoryDto
     */
    private CategoryDto convertToDto(Category category) {
        CategoryDto dto = new CategoryDto();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());
        dto.setColor(category.getColor());
        dto.setIsDefault(category.getIsDefault());
        dto.setIsActive(category.getIsActive());
        dto.setCreatedAt(category.getCreatedAt());
        dto.setUpdatedAt(category.getUpdatedAt());
        
        if (category.getUser() != null) {
            dto.setUserId(category.getUser().getId());
            dto.setUserDisplayName(category.getUser().getDisplayName());
        }
        
        return dto;
    }
}