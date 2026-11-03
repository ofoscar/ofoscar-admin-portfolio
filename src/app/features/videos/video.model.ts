export enum VideoType {
  SHORT_FORM = 'Short form',
  YOUTUBE_VIDEO = 'Youtube video',
}

export enum VideoCategory {
  SOFTWARE_DEVELOPMENT = 'Software development',
}

export interface Video {
  id: number;
  title: string;
  slug: string;
  type: VideoType;
  date_uploaded: Date;
  category: VideoCategory;
  link: string;
}

export type VideoCreate = Omit<Video, 'id' | 'date_uploaded'> & { date_uploaded: string };

export type VideoUpdate = Partial<VideoCreate>;
