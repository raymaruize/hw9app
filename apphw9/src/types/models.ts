export type ContextProfile = {
  emotion_text: string;
  city_or_location: string;
  environment_style: string;
  weather: string;
  season: string;
  time_of_day: string;
  date_context?: string;
  lunar_date_or_festival?: string;
};

export type MatchInformation = {
  geo_mode: 'china_region' | 'global_landscape';
  nearby_regions: string[];
  landscapes: string[];
  popularity_weight: number;
};

export type MatchResult = {
  line_text: string;
  title: string;
  author: string;
  dynasty: string;
  match_reason: string;
  modern_explanation: string;
  confidence: number;
  popularity_score: number;
  alternatives: string[];
};

export type SavedPoem = {
  id: string;
  line_text: string;
  title: string;
  author: string;
  dynasty: string;
  short_reason: string;
  saved_at: string;
  context_snapshot: ContextProfile;
};

export type AIProviderConfig = {
  provider_name: string;
  base_url: string;
  model_name: string;
  api_key: string;
  is_enabled: boolean;
};

export type AppSettings = {
  backend_base_url: string;
  ai_provider: AIProviderConfig;
};

export type RecommendationResult = {
  match: MatchResult;
  source: 'ai' | 'backend' | 'local';
  warning?: string;
};