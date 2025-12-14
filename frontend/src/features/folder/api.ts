import { apiClient } from '@/lib/api';

export interface Folder {
  id: number;
  name: string;
  isPublic: boolean;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    audios: number;
  };
  user?: {
    id: number;
    fullname: string;
    email: string;
  };
}

export interface CreateFolderDto {
  name: string;
  isPublic?: boolean;
  userId?: number;
}

export interface UpdateFolderDto {
  name?: string;
  isPublic?: boolean;
}

/**
 * Get all folders for current user
 */
export const getFolders = async (userId: number): Promise<Folder[]> => {
  const response = await apiClient.get(`/folders?userId=${userId}`);
  return response.data.data;
};

/**
 * Get folder by ID
 */
export const getFolderById = async (id: number, userId?: number): Promise<Folder> => {
  const url = userId ? `/folders/${id}?userId=${userId}` : `/folders/${id}`;
  const response = await apiClient.get(url);
  return response.data.data;
};

/**
 * Create a new folder
 */
export const createFolder = async (data: CreateFolderDto): Promise<Folder> => {
  const response = await apiClient.post('/folders', data);
  return response.data.data;
};

/**
 * Update folder
 */
export const updateFolder = async (id: number, data: UpdateFolderDto): Promise<Folder> => {
  const response = await apiClient.put(`/folders/${id}`, data);
  return response.data.data;
};

/**
 * Delete folder
 */
export const deleteFolder = async (id: number): Promise<void> => {
  await apiClient.delete(`/folders/${id}`);
};
