import mongoose, { Schema, Document, Model } from "mongoose";

// ─── Domain union type ────────────────────────────────────────────────────────

export type InternshipDomain =
  | "AI"
  | "Web Development"
  | "Cybersecurity"
  | "Data Science"
  | "Cloud"
  | "Mobile Development"
  | "DevOps"
  | "Blockchain"
  | "IoT"
  | "Game Development"
  | "UI/UX Design"
  | "Machine Learning"
  | "Other";

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IInternship extends Document {
  title: string;
  company: string;
  location: string;
  domain: InternshipDomain;
  required_skills: string[];
  stipend: string;
  duration: string;
  application_link: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const internshipSchema = new Schema<IInternship>(
  {
    title: {
      type: String,
      required: [true, "Internship title is required"],
      trim: true,
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    domain: {
      type: String,
      required: [true, "Domain is required"],
      trim: true,
      enum: {
        values: [
          "AI",
          "Web Development",
          "Cybersecurity",
          "Data Science",
          "Cloud",
          "Mobile Development",
          "DevOps",
          "Blockchain",
          "IoT",
          "Game Development",
          "UI/UX Design",
          "Machine Learning",
          "Other",
        ] as InternshipDomain[],
        message: "{VALUE} is not a supported domain",
      },
    },
    required_skills: {
      type: [String],
      required: [true, "At least one required skill must be specified"],
      validate: {
        validator: (arr: string[]): boolean => arr.length > 0,
        message: "required_skills must contain at least one skill",
      },
    },
    stipend: {
      type: String,
      required: [true, "Stipend information is required"],
      trim: true,
    },
    duration: {
      type: String,
      required: [true, "Duration is required"],
      trim: true,
    },
    application_link: {
      type: String,
      required: [true, "Application link is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
  },
  { timestamps: true }
);

// Text index for search across title, company, domain & description
internshipSchema.index({
  title: "text",
  company: "text",
  domain: "text",
  description: "text",
});

const Internship: Model<IInternship> = mongoose.model<IInternship>(
  "Internship",
  internshipSchema
);

export default Internship;
