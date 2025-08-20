import axios, { AxiosResponse } from 'axios';
import {
  BaseResponse,
  PageResponse,
  User,
  Category,
  Item,
  ItemProgress,
  ItemFormData,
  CategoryFormData,
  UserFormData,
  ProgressFormData,
  ItemFilters,
  ItemType,
  ItemStatus,
  Priority
} from '../types';

const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// User API
export const userApi = {
  register: (userData: UserFormData): Promise<AxiosResponse<BaseResponse<User>>> =>
    api.post('/users/register', userData),

  login: (username: string, password: string): Promise<AxiosResponse<BaseResponse<User>>> =>
    api.post('/users/login', { username, password }),

  getProfile: (userId: number): Promise<AxiosResponse<BaseResponse<User>>> =>
    api.get(`/users/${userId}`),

  updateProfile: (userId: number, email?: string, displayName?: string): Promise<AxiosResponse<BaseResponse<User>>> =>
    api.put(`/users/${userId}/profile`, { email, displayName }),

  changePassword: (userId: number, currentPassword: string, newPassword: string): Promise<AxiosResponse<BaseResponse<string>>> =>
    api.put(`/users/${userId}/password`, { currentPassword, newPassword }),

  getAllUsers: (): Promise<AxiosResponse<BaseResponse<User[]>>> =>
    api.get('/users/all'),

  checkUsername: (username: string): Promise<AxiosResponse<BaseResponse<boolean>>> =>
    api.get(`/users/check-username?username=${username}`)
};

// Category API
export const categoryApi = {
  getAvailableForUser: (userId: number): Promise<AxiosResponse<BaseResponse<Category[]>>> =>
    api.get(`/categories/user/${userId}`),

  getUserCustom: (userId: number): Promise<AxiosResponse<BaseResponse<Category[]>>> =>
    api.get(`/categories/user/${userId}/custom`),

  create: (userId: number, categoryData: CategoryFormData): Promise<AxiosResponse<BaseResponse<Category>>> =>
    api.post(`/categories/user/${userId}`, categoryData),

  update: (userId: number, categoryId: number, categoryData: Partial<CategoryFormData>): Promise<AxiosResponse<BaseResponse<Category>>> =>
    api.put(`/categories/user/${userId}/category/${categoryId}`, categoryData),

  delete: (userId: number, categoryId: number): Promise<AxiosResponse<BaseResponse<string>>> =>
    api.delete(`/categories/user/${userId}/category/${categoryId}`),

  getById: (categoryId: number): Promise<AxiosResponse<BaseResponse<Category>>> =>
    api.get(`/categories/${categoryId}`)
};

// Item API
export const itemApi = {
  create: (userId: number, itemData: ItemFormData): Promise<AxiosResponse<BaseResponse<Item>>> =>
    api.post(`/items/user/${userId}`, itemData),

  update: (userId: number, itemId: number, itemData: Partial<ItemFormData>): Promise<AxiosResponse<BaseResponse<Item>>> =>
    api.put(`/items/user/${userId}/item/${itemId}`, itemData),

  getWithFilters: (userId: number, filters: ItemFilters): Promise<AxiosResponse<BaseResponse<PageResponse<Item>>>> => {
    const params = new URLSearchParams();
    
    console.log('API filters:', filters);
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
        console.log(`Filter: ${key} = ${value}`);
      }
    });

    const url = `/items/user/${userId}?${params.toString()}`;
    console.log('Final API URL:', url);
    
    return api.get(url);
  },

  getById: (userId: number, itemId: number): Promise<AxiosResponse<BaseResponse<Item>>> =>
    api.get(`/items/user/${userId}/item/${itemId}`),

  getByNumber: (userId: number, itemNumber: number): Promise<AxiosResponse<BaseResponse<Item>>> =>
    api.get(`/items/user/${userId}/number/${itemNumber}`),

  complete: (userId: number, itemId: number, actualDuration?: number): Promise<AxiosResponse<BaseResponse<Item>>> =>
    api.put(`/items/user/${userId}/item/${itemId}/complete`, { actualDuration }),

  snooze: (userId: number, itemId: number, snoozeUntil: string): Promise<AxiosResponse<BaseResponse<Item>>> =>
    api.put(`/items/user/${userId}/item/${itemId}/snooze`, { snoozeUntil }),

  updateStatus: (userId: number, itemId: number, status: ItemStatus): Promise<AxiosResponse<BaseResponse<Item>>> =>
    api.put(`/items/user/${userId}/item/${itemId}/status`, { status }),

  delete: (userId: number, itemId: number): Promise<AxiosResponse<BaseResponse<string>>> =>
    api.delete(`/items/user/${userId}/item/${itemId}`),

  getSubtasks: (userId: number, parentItemId: number): Promise<AxiosResponse<BaseResponse<Item[]>>> =>
    api.get(`/items/user/${userId}/item/${parentItemId}/subtasks`),

  getTopLevel: (userId: number): Promise<AxiosResponse<BaseResponse<Item[]>>> =>
    api.get(`/items/user/${userId}/top-level`),

  getOverdue: (userId: number): Promise<AxiosResponse<BaseResponse<Item[]>>> =>
    api.get(`/items/user/${userId}/overdue`),

  unsnoozeReady: (userId: number): Promise<AxiosResponse<BaseResponse<Item[]>>> =>
    api.put(`/items/user/${userId}/unsnooze`, {}),

  // Bulk operations
  bulkComplete: (userId: number, itemIds: number[]): Promise<AxiosResponse<BaseResponse<string>>> =>
    api.put(`/items/user/${userId}/bulk/complete`, { itemIds }),

  bulkSnooze: (userId: number, itemIds: number[], snoozeUntil: string): Promise<AxiosResponse<BaseResponse<string>>> =>
    api.put(`/items/user/${userId}/bulk/snooze`, { itemIds, snoozeUntil }),

  bulkDelete: (userId: number, itemIds: number[]): Promise<AxiosResponse<BaseResponse<string>>> =>
    api.delete(`/items/user/${userId}/bulk`, { data: { itemIds } })
};

// Progress API
export const progressApi = {
  log: (userId: number, itemId: number, progressData: ProgressFormData): Promise<AxiosResponse<BaseResponse<ItemProgress>>> =>
    api.post(`/progress/user/${userId}/item/${itemId}`, progressData),

  update: (userId: number, progressId: number, progressData: Partial<ProgressFormData>): Promise<AxiosResponse<BaseResponse<ItemProgress>>> =>
    api.put(`/progress/user/${userId}/progress/${progressId}`, progressData),

  delete: (userId: number, progressId: number): Promise<AxiosResponse<BaseResponse<string>>> =>
    api.delete(`/progress/user/${userId}/progress/${progressId}`),

  getForItem: (userId: number, itemId: number): Promise<AxiosResponse<BaseResponse<ItemProgress[]>>> =>
    api.get(`/progress/user/${userId}/item/${itemId}`),

  getInDateRange: (userId: number, itemId: number, startDate: string, endDate: string): Promise<AxiosResponse<BaseResponse<ItemProgress[]>>> =>
    api.get(`/progress/user/${userId}/item/${itemId}/range?startDate=${startDate}&endDate=${endDate}`),

  getById: (userId: number, progressId: number): Promise<AxiosResponse<BaseResponse<ItemProgress>>> =>
    api.get(`/progress/user/${userId}/progress/${progressId}`),

  hasProgressForDate: (userId: number, itemId: number, date: string): Promise<AxiosResponse<BaseResponse<boolean>>> =>
    api.get(`/progress/user/${userId}/item/${itemId}/check?date=${date}`),

  getTotalDuration: (userId: number, itemId: number): Promise<AxiosResponse<BaseResponse<number>>> =>
    api.get(`/progress/user/${userId}/item/${itemId}/total-duration`),

  getTotalProgress: (userId: number, itemId: number): Promise<AxiosResponse<BaseResponse<number>>> =>
    api.get(`/progress/user/${userId}/item/${itemId}/total-progress`),

  getStatistics: (userId: number, itemId: number): Promise<AxiosResponse<BaseResponse<any>>> =>
    api.get(`/progress/user/${userId}/item/${itemId}/statistics`)
};

// Helper functions for common operations
export const apiHelpers = {
  // Format date for API
  formatDate: (date: Date): string => {
    return date.toISOString();
  },

  // Format date for date input
  formatDateForInput: (date: Date): string => {
    return date.toISOString().split('T')[0];
  },

  // Parse API date
  parseDate: (dateString: string): Date => {
    return new Date(dateString);
  },

  // Handle API errors
  handleApiError: (error: any): string => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  },

  // Create snooze date options
  getSnoozeOptions: () => [
    { label: '1 day', value: new Date(Date.now() + 24 * 60 * 60 * 1000) },
    { label: '3 days', value: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
    { label: '1 week', value: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    { label: '2 weeks', value: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },
    { label: '1 month', value: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
  ]
};

export default api;