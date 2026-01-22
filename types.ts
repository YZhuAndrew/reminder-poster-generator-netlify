export interface PosterContent {
  headline: string;
  // subheadline removed - merged into bodyText via Rich Text
  bodyText: string; 
  footer: string;
  imagePrompt: string;
  suggestedColor: string;
}

export interface PosterState {
  content: PosterContent | null;
  imageUrl: string | null;
  isGeneratingText: boolean;
  isGeneratingImage: boolean;
  error: string | null;
}

export interface PosterStyle {
  titleSize: number;
  bodySize: number;
  overlayOpacity: number;
  textColor: string;
  alignment: 'top' | 'center' | 'bottom';
  fontFamily: 'sans' | 'serif';
  widthScale: number;
  heightScale: number;
}

export enum Step {
  INPUT = 'INPUT',
  PREVIEW = 'PREVIEW',
}