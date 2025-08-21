export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  SNOOZED = 'SNOOZED'
}

export enum HabitStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED'
}

export enum NoteStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED'
}

export enum RecurringPattern {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
  EVERY_N_DAYS = 'EVERY_N_DAYS',
  EVERY_N_WEEKS = 'EVERY_N_WEEKS'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export enum Complexity {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export interface User {
  id: number;
  username: string;
  email?: string;
  displayName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  color: string;
  isDefault: boolean;
  userId?: number;
  userDisplayName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: number;
  taskNumber: number;
  title: string;
  description?: string;
  priority: Priority;
  complexity: Complexity;
  status: TaskStatus;
  dueDate?: string;
  completedAt?: string;
  snoozedUntil?: string;
  estimatedDuration?: number;
  actualDuration?: number;
  userId: number;
  userDisplayName?: string;
  categoryId?: number;
  categoryName?: string;
  categoryColor?: string;
  parentTaskId?: number;
  parentTaskTitle?: string;
  subtasks?: Task[];
  subtaskCount: number;
  completedSubtaskCount: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Habit {
  id: number;
  habitNumber: number;
  title: string;
  description?: string;
  habitStage?: string;
  targetDays?: number;
  completedDays: number;
  status: HabitStatus;
  userId: number;
  userDisplayName?: string;
  categoryId?: number;
  categoryName?: string;
  categoryColor?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: number;
  noteNumber: number;
  title: string;
  description?: string;
  priority: Priority;
  status: NoteStatus;
  userId: number;
  userDisplayName?: string;
  categoryId?: number;
  categoryName?: string;
  categoryColor?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: number;
  eventNumber: number;
  title: string;
  description?: string;
  eventDateTime: string;
  location?: string;
  reminderMinutes?: number;
  isRecurring: boolean;
  recurringPattern?: RecurringPattern;
  recurringInterval?: number;
  recurringEndDate?: string;
  masterEventId?: number;
  masterEventTitle?: string;
  userId: number;
  userDisplayName?: string;
  categoryId?: number;
  categoryName?: string;
  categoryColor?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface HabitProgress {
  id: number;
  habitId: number;
  habitTitle?: string;
  sessionDate: string;
  duration?: number;
  notes?: string;
  progressValue?: number;
  progressUnit?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BaseResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errorCode?: string;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  pageable: {
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    pageSize: number;
    pageNumber: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

// Form types
export interface TaskFormData {
  title: string;
  description?: string;
  priority: Priority;
  complexity: Complexity;
  dueDate?: string;
  categoryId?: number;
  parentTaskId?: number;
  estimatedDuration?: number;
}

export interface HabitFormData {
  title: string;
  description?: string;
  habitStage?: string;
  targetDays?: number;
  categoryId?: number;
}

export interface NoteFormData {
  title: string;
  description?: string;
  priority: Priority;
  categoryId?: number;
}

export interface EventFormData {
  title: string;
  description?: string;
  eventDateTime: string;
  location?: string;
  reminderMinutes?: number;
  isRecurring: boolean;
  recurringPattern?: RecurringPattern;
  recurringInterval?: number;
  recurringEndDate?: string;
  categoryId?: number;
}

export interface HabitProgressFormData {
  sessionDate?: string;
  duration?: number;
  notes?: string;
  progressValue?: number;
  progressUnit?: string;
}

// Filter types
export interface TaskFilters {
  status?: TaskStatus;
  priority?: Priority;
  categoryId?: number;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface HabitFilters {
  status?: HabitStatus;
  categoryId?: number;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface NoteFilters {
  status?: NoteStatus;
  priority?: Priority;
  categoryId?: number;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface EventFilters {
  categoryId?: number;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

// Constants
export const PRIORITY_COLORS = {
  [Priority.LOW]: 'text-blue-600 bg-blue-50',
  [Priority.MEDIUM]: 'text-yellow-600 bg-yellow-50',
  [Priority.HIGH]: 'text-red-600 bg-red-50'
};

export const COMPLEXITY_COLORS = {
  [Complexity.EASY]: 'text-green-600 bg-green-50',
  [Complexity.MEDIUM]: 'text-orange-600 bg-orange-50',
  [Complexity.HARD]: 'text-purple-600 bg-purple-50'
};

export const TASK_STATUS_COLORS = {
  [TaskStatus.PENDING]: 'text-gray-600 bg-gray-50',
  [TaskStatus.IN_PROGRESS]: 'text-blue-600 bg-blue-50',
  [TaskStatus.COMPLETED]: 'text-green-600 bg-green-50',
  [TaskStatus.SNOOZED]: 'text-orange-600 bg-orange-50'
};

export const HABIT_STATUS_COLORS = {
  [HabitStatus.ACTIVE]: 'text-green-600 bg-green-50',
  [HabitStatus.PAUSED]: 'text-yellow-600 bg-yellow-50',
  [HabitStatus.COMPLETED]: 'text-blue-600 bg-blue-50',
  [HabitStatus.ARCHIVED]: 'text-gray-600 bg-gray-50'
};

export const NOTE_STATUS_COLORS = {
  [NoteStatus.ACTIVE]: 'text-green-600 bg-green-50',
  [NoteStatus.ARCHIVED]: 'text-gray-600 bg-gray-50'
};

export const TASK_ICONS = {
  [Priority.LOW]: '🔵',
  [Priority.MEDIUM]: '🟡',
  [Priority.HIGH]: '🔴'
};

export const HABIT_ICONS = {
  [HabitStatus.ACTIVE]: '🎯',
  [HabitStatus.PAUSED]: '⏸️',
  [HabitStatus.COMPLETED]: '✅',
  [HabitStatus.ARCHIVED]: '📦'
};

export const NOTE_ICONS = {
  [Priority.LOW]: '📝',
  [Priority.MEDIUM]: '📋',
  [Priority.HIGH]: '📌'
};

export const EVENT_ICONS = {
  default: '📅',
  recurring: '🔄'
};

export const RECURRING_PATTERN_LABELS = {
  [RecurringPattern.DAILY]: 'Daily',
  [RecurringPattern.WEEKLY]: 'Weekly',
  [RecurringPattern.MONTHLY]: 'Monthly',
  [RecurringPattern.YEARLY]: 'Yearly',
  [RecurringPattern.EVERY_N_DAYS]: 'Every N Days',
  [RecurringPattern.EVERY_N_WEEKS]: 'Every N Weeks'
};