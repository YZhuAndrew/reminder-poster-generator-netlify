
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

export interface PosterTheme {
  id: string;
  name: string;
  primaryColor: string;    // Main outer background/border
  secondaryColor: string;  // Title text color
  backgroundColor: string; // Paper/Content background
  accentColor: string;     // Footer text, decorations
}

export interface PosterStyle {
  titleSize: number;
  bodySize: number;
  overlayOpacity: number;
  textColor: string;
  alignment: 'top' | 'center' | 'bottom';
  fontFamily: string; // Changed from 'sans' | 'serif' to string to support specific fonts
  widthScale: number;
  heightScale: number;
  theme: PosterTheme;
  textureStyle: string;
  showSeal: boolean; // Controls visibility of the seal/logo
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  title: string; // Original input title
  body: string;  // Original input body
  content: PosterContent;
  imageUrl: string | null;
  styleConfig: PosterStyle;
}

export enum Step {
  INPUT = 'INPUT',
  PREVIEW = 'PREVIEW',
}