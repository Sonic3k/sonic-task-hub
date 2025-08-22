import axios, { AxiosResponse } from 'axios';
import {
  BaseResponse,
  PageResponse,
  User,
  Category,
  Task,
  Habit,
  Note,
  Event,
  HabitProgress,
  TaskFormData,
  HabitFormData,
  NoteFormData,
  EventFormData,
  HabitProgressFormData,
  CategoryFormData,
  UserFormData,
  TaskFilters,
  HabitFilters,
  NoteFilters,
  EventFilters,
  TaskStatus,
  HabitStatus,
  NoteStatus
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

// Task API
export const taskApi = {
  create: (userId: number, taskData: TaskFormData): Promise<AxiosResponse<BaseResponse<Task>>> =>
    api.post(`/tasks/user/${userId}`, taskData),

  getWithFilters: (userId: number, filters: TaskFilters): Promise<AxiosResponse<BaseResponse<PageResponse<Task>>>> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    return api.get(`/tasks/user/${userId}?${params.toString()}`);
  },

  getById: (userId: number, taskId: number): Promise<AxiosResponse<BaseResponse<Task>>> =>
    api.get(`/tasks/user/${userId}/task/${taskId}`),

  getByNumber: (userId: number, taskNumber: number): Promise<AxiosResponse<BaseResponse<Task>>> =>
    api.get(`/tasks/user/${userId}/number/${taskNumber}`),

  update: (userId: number, taskId: number, taskData: TaskFormData): Promise<AxiosResponse<BaseResponse<Task>>> =>
    api.put(`/tasks/user/${userId}/task/${taskId}`, taskData),

  complete: (userId: number, taskId: number, actualDuration?: number): Promise<AxiosResponse<BaseResponse<Task>>> =>
    api.put(`/tasks/user/${userId}/task/${taskId}/complete`, { actualDuration }),

  snooze: (userId: number, taskId: number, snoozeUntil: string): Promise<AxiosResponse<BaseResponse<Task>>> =>
    api.put(`/tasks/user/${userId}/task/${taskId}/snooze`, { snoozeUntil }),

  delete: (userId: number, taskId: number): Promise<AxiosResponse<BaseResponse<string>>> =>
    api.delete(`/tasks/user/${userId}/task/${taskId}`),

  getSubtasks: (userId: number, parentTaskId: number): Promise<AxiosResponse<BaseResponse<Task[]>>> =>
    api.get(`/tasks/user/${userId}/task/${parentTaskId}/subtasks`)
};

// Habit API
export const habitApi = {
  create: (userId: number, habitData: HabitFormData): Promise<AxiosResponse<BaseResponse<Habit>>> =>
    api.post(`/habits/user/${userId}`, habitData),

  getWithFilters: (userId: number, filters: HabitFilters): Promise<AxiosResponse<BaseResponse<PageResponse<Habit>>>> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    return api.get(`/habits/user/${userId}?${params.toString()}`);
  },

  getById: (userId: number, habitId: number): Promise<AxiosResponse<BaseResponse<Habit>>> =>
    api.get(`/habits/user/${userId}/habit/${habitId}`),

  getByNumber: (userId: number, habitNumber: number): Promise<AxiosResponse<BaseResponse<Habit>>> =>
    api.get(`/habits/user/${userId}/number/${habitNumber}`),

  update: (userId: number, habitId: number, habitData: HabitFormData): Promise<AxiosResponse<BaseResponse<Habit>>> =>
    api.put(`/habits/user/${userId}/habit/${habitId}`, habitData),

  updateStatus: (userId: number, habitId: number, status: HabitStatus): Promise<AxiosResponse<BaseResponse<Habit>>> =>
    api.put(`/habits/user/${userId}/habit/${habitId}/status`, { status }),

  delete: (userId: number, habitId: number): Promise<AxiosResponse<BaseResponse<string>>> =>
    api.delete(`/habits/user/${userId}/habit/${habitId}`)
};

// Note API
export const noteApi = {
  create: (userId: number, noteData: NoteFormData): Promise<AxiosResponse<BaseResponse<Note>>> =>
    api.post(`/notes/user/${userId}`, noteData),

  getWithFilters: (userId: number, filters: NoteFilters): Promise<AxiosResponse<BaseResponse<PageResponse<Note>>>> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    return api.get(`/notes/user/${userId}?${params.toString()}`);
  },

  getById: (userId: number, noteId: number): Promise<AxiosResponse<BaseResponse<Note>>> =>
    api.get(`/notes/user/${userId}/note/${noteId}`),

  getByNumber: (userId: number, noteNumber: number): Promise<AxiosResponse<BaseResponse<Note>>> =>
    api.get(`/notes/user/${userId}/number/${noteNumber}`),

  update: (userId: number, noteId: number, noteData: NoteFormData): Promise<AxiosResponse<BaseResponse<Note>>> =>
    api.put(`/notes/user/${userId}/note/${noteId}`, noteData),

  archive: (userId: number, noteId: number): Promise<AxiosResponse<BaseResponse<Note>>> =>
    api.put(`/notes/user/${userId}/note/${noteId}/archive`),

  delete: (userId: number, noteId: number): Promise<AxiosResponse<BaseResponse<string>>> =>
    api.delete(`/notes/user/${userId}/note/${noteId}`)
};

// Event API
export const eventApi = {
  create: (userId: number, eventData: EventFormData): Promise<AxiosResponse<BaseResponse<Event>>> =>
    api.post(`/events/user/${userId}`, eventData),

  getWithFilters: (userId: number, filters: EventFilters): Promise<AxiosResponse<BaseResponse<PageResponse<Event>>>> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    return api.get(`/events/user/${userId}?${params.toString()}`);
  },

  getById: (userId: number, eventId: number): Promise<AxiosResponse<BaseResponse<Event>>> =>
    api.get(`/events/user/${userId}/event/${eventId}`),

  getByNumber: (userId: number, eventNumber: number): Promise<AxiosResponse<BaseResponse<Event>>> =>
    api.get(`/events/user/${userId}/number/${eventNumber}`),

  update: (userId: number, eventId: number, eventData: EventFormData): Promise<AxiosResponse<BaseResponse<Event>>> =>
    api.put(`/events/user/${userId}/event/${eventId}`, eventData),

  getInDateRange: (userId: number, startDate: string, endDate: string): Promise<AxiosResponse<BaseResponse<Event[]>>> =>
    api.get(`/events/user/${userId}/range?startDate=${startDate}&endDate=${endDate}`),

  delete: (userId: number, eventId: number): Promise<AxiosResponse<BaseResponse<string>>> =>
    api.delete(`/events/user/${userId}/event/${eventId}`)
};

// Habit Progress API
export const habitProgressApi = {
  log: (userId: number, habitId: number, progressData: HabitProgressFormData): Promise<AxiosResponse<BaseResponse<HabitProgress>>> =>
    api.post(`/habit-progress/user/${userId}/habit/${habitId}`, progressData),

  getForHabit: (userId: number, habitId: number): Promise<AxiosResponse<BaseResponse<HabitProgress[]>>> =>
    api.get(`/habit-progress/user/${userId}/habit/${habitId}`),

  getInDateRange: (userId: number, habitId: number, startDate: string, endDate: string): Promise<AxiosResponse<BaseResponse<HabitProgress[]>>> =>
    api.get(`/habit-progress/user/${userId}/habit/${habitId}/range?startDate=${startDate}&endDate=${endDate}`),

  delete: (userId: number, progressId: number): Promise<AxiosResponse<BaseResponse<string>>> =>
    api.delete(`/habit-progress/user/${userId}/progress/${progressId}`)
};

// API Helpers
export const apiHelpers = {
  handleApiError: (error: any): string => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  }
};