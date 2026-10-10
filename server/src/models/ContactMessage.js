import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: {
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
    subject: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 180,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 12,
      maxlength: 5000,
    },
    serviceSlug: {
      type: String,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      default: null,
    },
    budgetRange: { type: String, trim: true, maxlength: 80, default: "" },
    preferredTimeline: { type: String, trim: true, maxlength: 80, default: "" },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, versionKey: false },
);
contactSchema.index({ createdAt: -1 });

export const ContactMessage =
  mongoose.models.ContactMessage ||
  mongoose.model("ContactMessage", contactSchema);
