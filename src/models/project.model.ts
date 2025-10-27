import mongoose, { Schema, Document } from "mongoose";

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

const projectSchema = new Schema<IProject>(
  {
    repoId: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    fullname: String,
    description: String,
    summary: String,
    curatedAt: Date,
    languages: [String],
    topics: [String],
    stars: Number,
    forks: Number,
    lastPushedAt: Date,
    repoUrl: String,
    pathToDemo: String,
  },
  { timestamps: true }
);

export const Project = mongoose.model<IProject>("Project", projectSchema);
