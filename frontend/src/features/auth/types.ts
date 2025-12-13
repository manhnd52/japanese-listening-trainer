export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthResponse {
    user: {
        id: string;
        name: string;
        email: string;
    };
    token: string;
}

export interface User {
  id: number;
  fullname: string;
  email: string;
  avatarUrl: string | null;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  fullname: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    user: User; 
    accessToken: string;
    refreshToken: string;
  };
}

export interface UpdateProfileInput {
  fullname?: string;
  newPassword?: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  message?: string;
  data: User; 
}