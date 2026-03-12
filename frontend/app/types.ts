export interface Source {
  title: string;
  link: string;
  source: string;
}

export interface APIResult {
  image_url: string;
  total_matches: number;
  earliest_date: string;
  image_description: string;
  biases: {
    [key: string]: number;
  };
  source_clusters: {
    [domain: string]: string[];
  };
  exif_data?: any;
  ai_analysis?: {
    verdict?: string;
    ai_id_confidence?: number;
    human_confidence?: number;
    deepfake_confidence?: number;
    nsfw_is_detected?: boolean;
    scores?: {
      ai_generated?: number;
      human?: number;
      deepfake?: number;
    };
  };
}
