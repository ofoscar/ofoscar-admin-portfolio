export interface ProjectImage {
  image_url: string;
  description: string;
}

export interface ProjectUpdate {
  title?: string;
  hook?: string;
  description?: string;
  github_url?: string | null;
  demo_url?: string | null;
  cover_image_url?: string | null;
  published?: boolean;
  tags?: string[];
  highlights?: string[];
  images?: ProjectImage[] | null;
}

export interface Project {
  id: number;
  title: string;
  hook: string;
  description: string;
  github_url: string | null;
  demo_url: string | null;
  cover_image_url: string | null;
  published: boolean;
  tags: string[];
  highlights: string[];
  images: ProjectImage[] | null;
}
export interface ProjectCreate {
  title: string;
  hook: string;
  description: string;
  github_url: string | null;
  demo_url: string | null;
  cover_image_url: string | null;
  published: boolean;
  tags: string[];
  highlights: string[];
  images: ProjectImage[] | null;
}
