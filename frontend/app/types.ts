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
  // The knowledge_graph seems to have been replaced by more specific fields.
  // If it's still needed, it can be added back.
}
