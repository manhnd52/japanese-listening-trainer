// Player feature types
export interface ToggleFavoriteResponse {
    audioId: string;
    isFavorite: boolean;
}

export interface ToggleFavoriteRequest {
    audioId: string;
}
