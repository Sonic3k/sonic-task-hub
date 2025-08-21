package com.sonic.sonictaskhub.service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sonic.sonictaskhub.model.dto.HabitProgressDto;
import com.sonic.sonictaskhub.model.entity.Habit;
import com.sonic.sonictaskhub.model.entity.HabitProgress;
import com.sonic.sonictaskhub.repository.HabitProgressRepository;
import com.sonic.sonictaskhub.repository.HabitRepository;

@Service
@Transactional
public class HabitProgressService {

    @Autowired
    private HabitProgressRepository habitProgressRepository;

    @Autowired
    private HabitRepository habitRepository;

    /**
     * Log habit progress
     */
    public HabitProgressDto logProgress(Long userId, Long habitId, LocalDate sessionDate, 
                                      Integer duration, String notes, Double progressValue, String progressUnit) {
        Habit habit = habitRepository.findById(habitId)
                .orElseThrow(() -> new RuntimeException("Habit not found"));

        if (!habit.getUser().getId().equals(userId)) {
            throw new RuntimeException("Habit doesn't belong to this user");
        }

        // Check if progress already exists for this date
        habitProgressRepository.findByHabitIdAndSessionDate(habitId, sessionDate)
                .ifPresent(existing -> {
                    throw new RuntimeException("Progress already logged for this date");
                });

        HabitProgress progress = new HabitProgress();
        progress.setHabit(habit);
        progress.setSessionDate(sessionDate);
        progress.setDuration(duration);
        progress.setNotes(notes);
        progress.setProgressValue(progressValue);
        progress.setProgressUnit(progressUnit);

        HabitProgress savedProgress = habitProgressRepository.save(progress);
        return convertToDto(savedProgress);
    }

    /**
     * Get progress for habit
     */
    public List<HabitProgressDto> getProgressForHabit(Long userId, Long habitId) {
        Habit habit = habitRepository.findById(habitId)
                .orElseThrow(() -> new RuntimeException("Habit not found"));

        if (!habit.getUser().getId().equals(userId)) {
            throw new RuntimeException("Habit doesn't belong to this user");
        }

        List<HabitProgress> progressList = habitProgressRepository.findByHabitIdOrderBySessionDateDesc(habitId);
        return progressList.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get progress in date range
     */
    public List<HabitProgressDto> getProgressInDateRange(Long userId, Long habitId, 
                                                       LocalDate startDate, LocalDate endDate) {
        Habit habit = habitRepository.findById(habitId)
                .orElseThrow(() -> new RuntimeException("Habit not found"));

        if (!habit.getUser().getId().equals(userId)) {
            throw new RuntimeException("Habit doesn't belong to this user");
        }

        List<HabitProgress> progressList = habitProgressRepository.findByHabitIdAndDateRange(habitId, startDate, endDate);
        return progressList.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Delete progress entry
     */
    public void deleteProgress(Long userId, Long progressId) {
        HabitProgress progress = habitProgressRepository.findById(progressId)
                .orElseThrow(() -> new RuntimeException("Progress entry not found"));

        if (!progress.getHabit().getUser().getId().equals(userId)) {
            throw new RuntimeException("Progress entry doesn't belong to this user");
        }

        habitProgressRepository.delete(progress);
    }

    /**
     * Convert HabitProgress entity to HabitProgressDto
     */
    private HabitProgressDto convertToDto(HabitProgress progress) {
        HabitProgressDto dto = new HabitProgressDto();
        dto.setId(progress.getId());
        dto.setHabitId(progress.getHabit().getId());
        dto.setHabitTitle(progress.getHabit().getTitle());
        dto.setSessionDate(progress.getSessionDate());
        dto.setDuration(progress.getDuration());
        dto.setNotes(progress.getNotes());
        dto.setProgressValue(progress.getProgressValue());
        dto.setProgressUnit(progress.getProgressUnit());
        dto.setCreatedAt(progress.getCreatedAt());
        dto.setUpdatedAt(progress.getUpdatedAt());
        return dto;
    }
}