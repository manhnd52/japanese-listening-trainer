

export interface FetchAudiosParams {
  userId: number;
}

export interface ToggleFavoriteParams {
  id: string;
  userId: number;
  isFavorite: boolean;
}

export interface DeleteAudioParams {
  id: string;
  userId: number;
}

export interface MoveAudioParams {
  id: string;
  folderId: string;
  userId: number;
}

export interface UpdateAudioParams {
  id: string;
  title?: string;
  script?: string;
  folderId?: string;
  userId: number;
}

export interface UploadAudioParams {
  formData: FormData;
  userId: number;
}