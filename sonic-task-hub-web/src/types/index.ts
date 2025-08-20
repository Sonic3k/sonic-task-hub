export enum ItemType {
  TASK = 'TASK',
  HABIT = 'HABIT',
  REMINDER = 'REMINDER'
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

export enum ItemStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  SNOOZED = 'SNOOZED'
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

export interface Item {
  id: number;
  itemNumber: number;
  title: string;
  description?: string;
  type: ItemType;
  priority: Priority;
  complexity: Complexity;
  status: ItemStatus;
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
  parentItemId?: number;
  parentItemTitle?: string;
  subtasks?: Item[];
  subtaskCount: number;
  completedSubtaskCount: number;
  sortOrder: number;
  habitStage?: string;
  habitTargetDays?: number;
  habitCompletedDays?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ItemProgress {
  id: number;
  itemId: number;
  itemTitle?: string;
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
export interface ItemFormData {
  title: string;
  description?: string;
  type: ItemType;
  priority: Priority;
  complexity: Complexity;
  dueDate?: string;
  categoryId?: number;
  parentItemId?: number;
  estimatedDuration?: number;
  habitStage?: string;
  habitTargetDays?: number;
}

export interface CategoryFormData {
  name: string;
  description?: string;
  color: string;
}

export interface UserFormData {
  username: string;
  password: string;
  email?: string;
  displayName?: string;
}

export interface ProgressFormData {
  sessionDate?: string;
  duration?: number;
  notes?: string;
  progressValue?: number;
  progressUnit?: string;
}

// Filter types
export interface ItemFilters {
  type?: ItemType;
  status?: ItemStatus;
  priority?: Priority;
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

export const STATUS_COLORS = {
  [ItemStatus.PENDING]: 'text-gray-600 bg-gray-50',
  [ItemStatus.IN_PROGRESS]: 'text-blue-600 bg-blue-50',
  [ItemStatus.COMPLETED]: 'text-green-600 bg-green-50',
  [ItemStatus.SNOOZED]: 'text-orange-600 bg-orange-50'
};

export const TYPE_ICONS = {
  [ItemType.TASK]: '📝',
  [ItemType.HABIT]: '🎯',
  [ItemType.REMINDER]: '💭'
};

export const PRIORITY_ICONS = {
  [Priority.LOW]: '🔵',
  [Priority.MEDIUM]: '🟡',
  [Priority.HIGH]: '🔴'
};

export const COMPLEXITY_ICONS = {
  [Complexity.EASY]: '⚡',
  [Complexity.MEDIUM]: '📝',
  [Complexity.HARD]: '💻'
};