import mongoose, { Schema } from "mongoose";

import { IProject } from "@/types";

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
