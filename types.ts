
export interface TrendingProduct {
  id: string;
  name: string;
  description: string;
  trendReason: string;
  adHook: string;
  visualPrompt: string;
}

export interface VideoStatus {
  productId: string;
  status: 'idle' | 'generating' | 'completed' | 'error';
  progress: number;
  videoUrl?: string;
  error?: string;
}

export enum GenerationStep {
  IDLE,
  SEARCHING,
  PRODUCTS_FOUND,
}
