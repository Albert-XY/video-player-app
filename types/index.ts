export interface User {
  id: number;
  username: string;
}

export interface Video {
  id: number;
  title: string;
  src: string;
}

export interface VideoView {
  id: number;
  username: string;
  videoId: number;
  startTime: Date;
  endTime: Date;
}

