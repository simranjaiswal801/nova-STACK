import mongoose from "mongoose";

const enquirySchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    serviceSlug: {
      type: String,
      required: true,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },
    serviceName: { type: String, required: true, trim: true, maxlength: 120 },
    projectDescription: {
      type: String,
      required: true,
      trim: true,
      minlength: 12,
      maxlength: 5000,
    },
    budgetRange: { type: String, trim: true, maxlength: 80, default: "" },
    preferredTimeline: { type: String, trim: true, maxlength: 80, default: "" },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ["new", "contacted", "in_progress", "completed", "rejected"],
      default: "new",
      index: true,
    },
    internalNotes: { type: String, maxlength: 10000, default: "" },
    activity: [
      {
        action: { type: String, maxlength: 80 },
        from: { type: String, maxlength: 40 },
        to: { type: String, maxlength: 40 },
        note: { type: String, maxlength: 1000 },
        at: { type: Date, default: Date.now },
        actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
  },
  { timestamps: true, versionKey: false },
);
enquirySchema.index({ createdAt: -1 });

export const Enquiry =
  mongoose.models.Enquiry || mongoose.model("Enquiry", enquirySchema);
