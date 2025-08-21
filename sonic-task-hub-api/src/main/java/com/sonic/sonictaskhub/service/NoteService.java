package com.sonic.sonictaskhub.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sonic.sonictaskhub.model.dto.NoteDto;
import com.sonic.sonictaskhub.model.entity.Category;
import com.sonic.sonictaskhub.model.entity.Note;
import com.sonic.sonictaskhub.model.entity.User;
import com.sonic.sonictaskhub.model.enums.NoteStatus;
import com.sonic.sonictaskhub.model.enums.Priority;
import com.sonic.sonictaskhub.model.request.NoteCreateRequest;
import com.sonic.sonictaskhub.repository.CategoryRepository;
import com.sonic.sonictaskhub.repository.NoteRepository;
import com.sonic.sonictaskhub.repository.UserRepository;

@Service
@Transactional
public class NoteService {

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    /**
     * Generate next note number for user
     */
    private Long generateNoteNumber(Long userId) {
        Long maxNumber = noteRepository.getMaxNoteNumberForUser(userId);
        return (maxNumber != null ? maxNumber : 0L) + 1;
    }
    
    /**
     * Create a new note
     */
    public NoteDto createNote(Long userId, NoteCreateRequest request) {
        // Validate
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new RuntimeException("Note title is required");
        }

        // Parse enums
        Priority priority = request.getPriority() != null ? 
            Priority.valueOf(request.getPriority().toUpperCase()) : Priority.MEDIUM;

        // Get user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Create note
        Note note = new Note();
        note.setNoteNumber(generateNoteNumber(userId));
        note.setTitle(request.getTitle().trim());
        note.setDescription(request.getDescription());
        note.setPriority(priority);
        note.setUser(user);

        // Set category
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            note.setCategory(category);
        }

        Note savedNote = noteRepository.save(note);
        return convertToDto(savedNote);
    }

    /**
     * Get notes with filters and pagination
     */
    public Page<NoteDto> getNotesWithFilters(Long userId, NoteStatus status, Priority priority, 
                                           Long categoryId, String search, int page, int size, 
                                           String sortBy, String sortDirection) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Note> notes = noteRepository.findWithFilters(userId, status, priority, categoryId, search, pageable);
        return notes.map(this::convertToDto);
    }

    /**
     * Get note by ID
     */
    public NoteDto getNoteById(Long userId, Long noteId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found"));
        
        if (!note.getUser().getId().equals(userId)) {
            throw new RuntimeException("Note doesn't belong to this user");
        }
        
        return convertToDto(note);
    }

    /**
     * Get note by number
     */
    public NoteDto getNoteByNumber(Long userId, Long noteNumber) {
        Note note = noteRepository.findByUserIdAndNoteNumber(userId, noteNumber)
                .orElseThrow(() -> new RuntimeException("Note not found"));
        return convertToDto(note);
    }

    /**
     * Archive a note
     */
    public NoteDto archiveNote(Long userId, Long noteId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found"));

        if (!note.getUser().getId().equals(userId)) {
            throw new RuntimeException("Note doesn't belong to this user");
        }

        note.setStatus(NoteStatus.ARCHIVED);
        Note archivedNote = noteRepository.save(note);
        return convertToDto(archivedNote);
    }

    /**
     * Delete a note
     */
    public void deleteNote(Long userId, Long noteId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found"));

        if (!note.getUser().getId().equals(userId)) {
            throw new RuntimeException("Note doesn't belong to this user");
        }

        noteRepository.delete(note);
    }

    /**
     * Convert Note entity to NoteDto
     */
    private NoteDto convertToDto(Note note) {
        NoteDto dto = new NoteDto();
        dto.setId(note.getId());
        dto.setNoteNumber(note.getNoteNumber());
        dto.setTitle(note.getTitle());
        dto.setDescription(note.getDescription());
        dto.setPriority(note.getPriority());
        dto.setStatus(note.getStatus());
        dto.setSortOrder(note.getSortOrder());
        dto.setCreatedAt(note.getCreatedAt());
        dto.setUpdatedAt(note.getUpdatedAt());

        // User info
        if (note.getUser() != null) {
            dto.setUserId(note.getUser().getId());
            dto.setUserDisplayName(note.getUser().getDisplayName());
        }

        // Category info
        if (note.getCategory() != null) {
            dto.setCategoryId(note.getCategory().getId());
            dto.setCategoryName(note.getCategory().getName());
            dto.setCategoryColor(note.getCategory().getColor());
        }

        return dto;
    }
}