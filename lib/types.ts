export type Importance = 'required' | 'optional';
export type LinkType = 'primary' | 'secondary';

export interface Movie {
  id: string;
  title: string;
  titleRu?: string;
  universe: string;
  chronologyYear: number;
  releaseDate: string;
  events: string;
  characters: string[];
  importance: Importance;
  ratings: {
    imdb: { score: number | null; url: string };
    rt: { score: number | null; url: string };
  };
  runtime: number;
  postCreditsScenes: number;
  director: string;
  poster: {
    tmdbId: number | null;
    directUrl: string | null;
  };
}

export interface Link {
  id: string;
  source: string;
  target: string;
  type: LinkType;
}

export interface Catalog {
  version: string;
  meta: { title: string; chronologyBasis: string; updatedAt: string };
  universes: Record<string, { name: string; accent: string }>;
  movies: Movie[];
  links: Link[];
}