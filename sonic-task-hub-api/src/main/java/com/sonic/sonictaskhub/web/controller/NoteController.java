package com.sonic.sonictaskhub.web.controller;

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

import com.sonic.sonictaskhub.model.dto.NoteDto;
import com.sonic.sonictaskhub.model.enums.NoteStatus;
import com.sonic.sonictaskhub.model.enums.Priority;
import com.sonic.sonictaskhub.model.request.NoteCreateRequest;
import com.sonic.sonictaskhub.model.response.BaseResponse;
import com.sonic.sonictaskhub.service.NoteService;

/**
 * Controller for note management operations
 */
@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = "*")
public class NoteController {

    @Autowired
    private NoteService noteService;

    /**
     * Create a new note
     * 
     * @param userId the ID of the user
     * @param request containing note details
     * @return BaseResponse with created note data
     */
    @PostMapping("/user/{userId}")
    public BaseResponse<NoteDto> createNote(@PathVariable(name = "userId") Long userId,
                                          @RequestBody NoteCreateRequest request) {
        try {
            NoteDto note = noteService.createNote(userId, request);
            return BaseResponse.success("Note created successfully", note);
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Get notes with filters and pagination
     * 
     * @param userId the ID of the user
     * @param status filter by note status
     * @param priority filter by priority
     * @param categoryId filter by category ID
     * @param search search term for title/description
     * @param page page number (0-based)
     * @param size page size
     * @param sortBy field to sort by
     * @param sortDirection sort direction (asc/desc)
     * @return BaseResponse with paginated note data
     */
    @GetMapping("/user/{userId}")
    public BaseResponse<Page<NoteDto>> getNotesWithFilters(
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
            NoteStatus noteStatus = status != null ? NoteStatus.valueOf(status.toUpperCase()) : null;
            Priority notePriority = priority != null ? Priority.valueOf(priority.toUpperCase()) : null;

            Page<NoteDto> notes = noteService.getNotesWithFilters(userId, noteStatus, notePriority, 
                                                                categoryId, search, page, size, sortBy, sortDirection);
            return BaseResponse.success(notes);
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Get note by ID
     * 
     * @param userId the ID of the user
     * @param noteId the ID of the note
     * @return BaseResponse with note data
     */
    @GetMapping("/user/{userId}/note/{noteId}")
    public BaseResponse<NoteDto> getNoteById(@PathVariable(name = "userId") Long userId,
                                           @PathVariable(name = "noteId") Long noteId) {
        try {
            NoteDto note = noteService.getNoteById(userId, noteId);
            return BaseResponse.success(note);
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Get note by note number
     * 
     * @param userId the ID of the user
     * @param noteNumber the note number
     * @return BaseResponse with note data
     */
    @GetMapping("/user/{userId}/number/{noteNumber}")
    public BaseResponse<NoteDto> getNoteByNumber(@PathVariable(name = "userId") Long userId,
                                               @PathVariable(name = "noteNumber") Long noteNumber) {
        try {
            NoteDto note = noteService.getNoteByNumber(userId, noteNumber);
            return BaseResponse.success(note);
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Archive a note
     * 
     * @param userId the ID of the user
     * @param noteId the ID of the note to archive
     * @return BaseResponse with archived note data
     */
    @PutMapping("/user/{userId}/note/{noteId}/archive")
    public BaseResponse<NoteDto> archiveNote(@PathVariable(name = "userId") Long userId,
                                           @PathVariable(name = "noteId") Long noteId) {
        try {
            NoteDto note = noteService.archiveNote(userId, noteId);
            return BaseResponse.success("Note archived successfully", note);
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }
    
    /**
     * Update an existing note
     * 
     * @param userId the ID of the user
     * @param noteId the ID of the note to update
     * @param request containing updated note details
     * @return BaseResponse with updated note data
     */
    @PutMapping("/user/{userId}/note/{noteId}")
    public BaseResponse<NoteDto> updateNote(@PathVariable(name = "userId") Long userId,
                                           @PathVariable(name = "noteId") Long noteId,
                                           @RequestBody NoteCreateRequest request) {
        try {
            NoteDto note = noteService.updateNote(userId, noteId, request);
            return BaseResponse.success("Note updated successfully", note);
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }

    /**
     * Delete a note
     * 
     * @param userId the ID of the user
     * @param noteId the ID of the note to delete
     * @return BaseResponse with success message
     */
    @DeleteMapping("/user/{userId}/note/{noteId}")
    public BaseResponse<String> deleteNote(@PathVariable(name = "userId") Long userId,
                                         @PathVariable(name = "noteId") Long noteId) {
        try {
            noteService.deleteNote(userId, noteId);
            return BaseResponse.success("Note deleted successfully", "Note has been deleted");
        } catch (Exception e) {
            return BaseResponse.error(e.getMessage());
        }
    }
}