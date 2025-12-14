export interface Folder {
  id: number;
  name: string;
  isPublic: boolean;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    audios: number;
    folderShares: number;
  };
  user?: {
    id: number;
    fullname: string;
    email: string;
  };
  audios?: Array<{
    id: number;
    title: string;
    script: string;
    fileUrl: string;
    duration: number;
    createdAt: string;
  }>;
  folderShares?: Array<{
    id: number;
    userId: number;
    user: {
      id: number;
      fullname: string;
      email: string;
    };
  }>;
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
