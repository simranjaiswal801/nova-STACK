import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    icon: { type: String, required: true, trim: true, maxlength: 40 },
    group: { type: String, required: true, trim: true, maxlength: 80 },
    text: { type: String, required: true, trim: true, maxlength: 400 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    overview: { type: String, required: true, trim: true, maxlength: 4000 },
    deliverables: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    faqs: { type: [[String]], default: [] },
    benefits: { type: [String], default: [] },
    process: { type: [String], default: [] },
    enquiryService: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    displayOrder: { type: Number, default: 0, min: 0, max: 10000, index: true },
    published: { type: Boolean, default: true, index: true },
    archived: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, versionKey: false },
);

serviceSchema.index({ published: 1, archived: 1, displayOrder: 1 });
export const Service =
  mongoose.models.Service || mongoose.model("Service", serviceSchema);
