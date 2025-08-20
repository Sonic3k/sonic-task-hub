package com.sonic.sonictaskhub.web.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sonic.sonictaskhub.model.dto.UserDto;
import com.sonic.sonictaskhub.model.request.UserLoginRequest;
import com.sonic.sonictaskhub.model.request.UserRegisterRequest;
import com.sonic.sonictaskhub.model.response.BaseResponse;
import com.sonic.sonictaskhub.service.UserService;

/**
 * Controller for user management and authentication operations
 */
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    /**
     * Register a new user
     * 
     * @param request containing username, password, email, displayName
     * @return BaseResponse with created user data
     */
    @PostMapping("/register")
    public BaseResponse<UserDto> registerUser(@RequestBody UserRegisterRequest request) {
        try {
            UserDto user = userService.registerUser(request);
            return BaseResponse.success("User registered successfully", user);
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Authenticate user login
     * 
     * @param request containing username and password
     * @return BaseResponse with user data if authentication succeeds
     */
    @PostMapping("/login")
    public BaseResponse<UserDto> loginUser(@RequestBody UserLoginRequest request) {
        try {
            UserDto user = userService.authenticateUser(request);
            return BaseResponse.success("Login successful", user);
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Get user profile by ID
     * 
     * @param userId the ID of the user
     * @return BaseResponse with user data
     */
    @GetMapping("/{userId}")
    public BaseResponse<UserDto> getUserProfile(@PathVariable(name = "userId") Long userId) {
        try {
            UserDto user = userService.getUserById(userId);
            return BaseResponse.success(user);
            
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Update user profile
     * 
     * @param userId the ID of the user
     * @param request containing email and displayName
     * @return BaseResponse with updated user data
     */
    @PutMapping("/{userId}/profile")
    public BaseResponse<UserDto> updateUserProfile(@PathVariable(name = "userId") Long userId,
                                                   @RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String displayName = request.get("displayName");

            UserDto user = userService.updateUserProfile(userId, email, displayName);
            return BaseResponse.success("Profile updated successfully", user);
            
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Change user password
     * 
     * @param userId the ID of the user
     * @param request containing currentPassword and newPassword
     * @return BaseResponse with success message
     */
    @PutMapping("/{userId}/password")
    public BaseResponse<String> changePassword(@PathVariable(name = "userId") Long userId,
                                              @RequestBody Map<String, String> request) {
        try {
            String currentPassword = request.get("currentPassword");
            String newPassword = request.get("newPassword");

            if (currentPassword == null || currentPassword.trim().isEmpty()) {
                return BaseResponse.error("Current password is required");
            }
            if (newPassword == null || newPassword.trim().isEmpty()) {
                return BaseResponse.error("New password is required");
            }
            if (newPassword.length() < 6) {
                return BaseResponse.error("New password must be at least 6 characters long");
            }

            userService.changePassword(userId, currentPassword, newPassword);
            return BaseResponse.success("Password changed successfully", "Password updated");
            
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Get all users (admin function)
     * 
     * @return BaseResponse with list of all users
     */
    @GetMapping("/all")
    public BaseResponse<List<UserDto>> getAllUsers() {
        try {
            List<UserDto> users = userService.getAllUsers();
            return BaseResponse.success(users);
            
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Deactivate user account
     * 
     * @param userId the ID of the user to deactivate
     * @return BaseResponse with success message
     */
    @PutMapping("/{userId}/deactivate")
    public BaseResponse<String> deactivateUser(@PathVariable(name = "userId") Long userId) {
        try {
            userService.deactivateUser(userId);
            return BaseResponse.success("User deactivated successfully", "User account deactivated");
            
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Activate user account
     * 
     * @param userId the ID of the user to activate
     * @return BaseResponse with success message
     */
    @PutMapping("/{userId}/activate")
    public BaseResponse<String> activateUser(@PathVariable(name = "userId") Long userId) {
        try {
            userService.activateUser(userId);
            return BaseResponse.success("User activated successfully", "User account activated");
            
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Check if username is available
     * 
     * @param username the username to check
     * @return BaseResponse with availability status
     */
    @GetMapping("/check-username")
    public BaseResponse<Boolean> checkUsernameAvailability(@RequestParam(name = "username", required = true) String username) {
        try {
            UserDto user = userService.getUserByUsername(username);
            // If user exists, username is not available
            return BaseResponse.success("Username check completed", false);
            
        } catch (Exception e) {
            // If user not found, username is available
            return BaseResponse.success("Username check completed", true);
        }
    }
}