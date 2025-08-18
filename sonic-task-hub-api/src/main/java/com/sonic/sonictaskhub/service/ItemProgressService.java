package com.sonic.sonictaskhub.service;

import com.sonic.sonictaskhub.model.dto.ItemProgressDto;
import com.sonic.sonictaskhub.model.entity.Item;
import com.sonic.sonictaskhub.model.entity.ItemProgress;
import com.sonic.sonictaskhub.repository.ItemProgressRepository;
import com.sonic.sonictaskhub.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ItemProgressService {

    @Autowired
    private ItemProgressRepository itemProgressRepository;

    @Autowired
    private ItemRepository itemRepository;

    /**
     * Log progress for an item (typically for habits)
     */
    public ItemProgressDto logProgress(Long userId, Long itemId, LocalDate sessionDate, 
                                     Integer duration, String notes, Double progressValue, 
                                     String progressUnit) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        // Verify item belongs to the user
        if (!item.getUser().getId().equals(userId)) {
            throw new RuntimeException("Item doesn't belong to this user");
        }

        ItemProgress progress = new ItemProgress();
        progress.setItem(item);
        progress.setSessionDate(sessionDate != null ? sessionDate : LocalDate.now());
        progress.setDuration(duration);
        progress.setNotes(notes);
        progress.setProgressValue(progressValue);
        progress.setProgressUnit(progressUnit);

        ItemProgress savedProgress = itemProgressRepository.save(progress);
        return convertToDto(savedProgress);
    }

    /**
     * Update existing progress entry
     */
    public ItemProgressDto updateProgress(Long userId, Long progressId, Integer duration, 
                                        String notes, Double progressValue, String progressUnit) {
        ItemProgress progress = itemProgressRepository.findById(progressId)
                .orElseThrow(() -> new RuntimeException("Progress entry not found"));

        // Verify progress belongs to user's item
        if (!progress.getItem().getUser().getId().equals(userId)) {
            throw new RuntimeException("Progress entry doesn't belong to this user");
        }

        if (duration != null) progress.setDuration(duration);
        if (notes != null) progress.setNotes(notes);
        if (progressValue != null) progress.setProgressValue(progressValue);
        if (progressUnit != null) progress.setProgressUnit(progressUnit);

        ItemProgress updatedProgress = itemProgressRepository.save(progress);
        return convertToDto(updatedProgress);
    }

    /**
     * Delete progress entry
     */
    public void deleteProgress(Long userId, Long progressId) {
        ItemProgress progress = itemProgressRepository.findById(progressId)
                .orElseThrow(() -> new RuntimeException("Progress entry not found"));

        // Verify progress belongs to user's item
        if (!progress.getItem().getUser().getId().equals(userId)) {
            throw new RuntimeException("Progress entry doesn't belong to this user");
        }

        itemProgressRepository.delete(progress);
    }

    /**
     * Get all progress entries for an item
     */
    public List<ItemProgressDto> getItemProgress(Long userId, Long itemId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        // Verify item belongs to the user
        if (!item.getUser().getId().equals(userId)) {
            throw new RuntimeException("Item doesn't belong to this user");
        }

        List<ItemProgress> progressList = itemProgressRepository.findByItemIdOrderBySessionDateDesc(itemId);
        return progressList.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get progress entries for an item within a date range
     */
    public List<ItemProgressDto> getItemProgressInDateRange(Long userId, Long itemId, 
                                                          LocalDate startDate, LocalDate endDate) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        // Verify item belongs to the user
        if (!item.getUser().getId().equals(userId)) {
            throw new RuntimeException("Item doesn't belong to this user");
        }

        List<ItemProgress> progressList = itemProgressRepository.findProgressInDateRange(itemId, startDate, endDate);
        return progressList.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get progress entry by ID
     */
    public ItemProgressDto getProgressById(Long userId, Long progressId) {
        ItemProgress progress = itemProgressRepository.findById(progressId)
                .orElseThrow(() -> new RuntimeException("Progress entry not found"));

        // Verify progress belongs to user's item
        if (!progress.getItem().getUser().getId().equals(userId)) {
            throw new RuntimeException("Progress entry doesn't belong to this user");
        }

        return convertToDto(progress);
    }

    /**
     * Check if there's already a progress entry for an item on a specific date
     */
    public boolean hasProgressForDate(Long userId, Long itemId, LocalDate date) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        // Verify item belongs to the user
        if (!item.getUser().getId().equals(userId)) {
            throw new RuntimeException("Item doesn't belong to this user");
        }

        Long count = itemProgressRepository.countProgressByItemAndDate(itemId, date);
        return count > 0;
    }

    /**
     * Get total duration for an item
     */
    public Integer getTotalDurationForItem(Long userId, Long itemId) {
        List<ItemProgressDto> progressList = getItemProgress(userId, itemId);
        return progressList.stream()
                .filter(progress -> progress.getDuration() != null)
                .mapToInt(ItemProgressDto::getDuration)
                .sum();
    }

    /**
     * Get total progress value for an item
     */
    public Double getTotalProgressValueForItem(Long userId, Long itemId) {
        List<ItemProgressDto> progressList = getItemProgress(userId, itemId);
        return progressList.stream()
                .filter(progress -> progress.getProgressValue() != null)
                .mapToDouble(ItemProgressDto::getProgressValue)
                .sum();
    }

    /**
     * Get progress statistics for an item
     */
    public ProgressStatistics getProgressStatistics(Long userId, Long itemId) {
        List<ItemProgressDto> progressList = getItemProgress(userId, itemId);
        
        int totalSessions = progressList.size();
        int totalDuration = progressList.stream()
                .filter(progress -> progress.getDuration() != null)
                .mapToInt(ItemProgressDto::getDuration)
                .sum();
        
        double totalProgressValue = progressList.stream()
                .filter(progress -> progress.getProgressValue() != null)
                .mapToDouble(ItemProgressDto::getProgressValue)
                .sum();
        
        double avgDuration = totalSessions > 0 ? (double) totalDuration / totalSessions : 0;
        
        LocalDate firstSession = progressList.stream()
                .map(ItemProgressDto::getSessionDate)
                .min(LocalDate::compareTo)
                .orElse(null);
        
        LocalDate lastSession = progressList.stream()
                .map(ItemProgressDto::getSessionDate)
                .max(LocalDate::compareTo)
                .orElse(null);

        return new ProgressStatistics(totalSessions, totalDuration, totalProgressValue, 
                                    avgDuration, firstSession, lastSession);
    }

    /**
     * Convert ItemProgress entity to ItemProgressDto
     */
    private ItemProgressDto convertToDto(ItemProgress progress) {
        ItemProgressDto dto = new ItemProgressDto();
        dto.setId(progress.getId());
        dto.setSessionDate(progress.getSessionDate());
        dto.setDuration(progress.getDuration());
        dto.setNotes(progress.getNotes());
        dto.setProgressValue(progress.getProgressValue());
        dto.setProgressUnit(progress.getProgressUnit());
        dto.setCreatedAt(progress.getCreatedAt());
        dto.setUpdatedAt(progress.getUpdatedAt());

        if (progress.getItem() != null) {
            dto.setItemId(progress.getItem().getId());
            dto.setItemTitle(progress.getItem().getTitle());
        }

        return dto;
    }

    /**
     * Inner class for progress statistics
     */
    public static class ProgressStatistics {
        private int totalSessions;
        private int totalDuration;
        private double totalProgressValue;
        private double averageDuration;
        private LocalDate firstSession;
        private LocalDate lastSession;

        public ProgressStatistics(int totalSessions, int totalDuration, double totalProgressValue,
                                double averageDuration, LocalDate firstSession, LocalDate lastSession) {
            this.totalSessions = totalSessions;
            this.totalDuration = totalDuration;
            this.totalProgressValue = totalProgressValue;
            this.averageDuration = averageDuration;
            this.firstSession = firstSession;
            this.lastSession = lastSession;
        }

        // Getters
        public int getTotalSessions() { return totalSessions; }
        public int getTotalDuration() { return totalDuration; }
        public double getTotalProgressValue() { return totalProgressValue; }
        public double getAverageDuration() { return averageDuration; }
        public LocalDate getFirstSession() { return firstSession; }
        public LocalDate getLastSession() { return lastSession; }
    }
}