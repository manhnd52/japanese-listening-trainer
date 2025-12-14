export interface DictionaryPopupState {
  x: number;
  y: number;
  loading: boolean;
  data: DictionaryResult | null;
}

export interface DictionaryResult {
  word: string;
  definition: string;
  type: string;
  example: string;
}
