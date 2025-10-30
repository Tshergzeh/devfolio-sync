import { Document } from "mongoose";

export interface IProject extends Document {
  repoId: number;
  name: string;
  fullname: string;
  description?: string;
  summary?: string;
  curatedAt?: Date;
  languages: string[];
  topics: string[];
  stars: number;
  forks: number;
  lastPushedAt: Date;
  repoUrl: string;
  pathToDemo?: string;
}

export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  topics?: [string];
  stargazers_count: number;
  forks_count: number;
  pushed_at: string;
  homepage?: string | null;
}

export interface PaginatedResponse {
  data: IProject[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    hasNextPage: boolean;
  };
}

export interface ProjectsFileData {
  projects: IProject[];
  generatedAt: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}
