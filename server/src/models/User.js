import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
      index: true,
      maxlength: 254,
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    active: { type: Boolean, default: true, index: true },
    sessionVersion: { type: Number, default: 0, select: false },
  },
  { timestamps: true, versionKey: false },
);

userSchema.pre("save", async function hashPassword() {
  if (this.isModified("passwordHash"))
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
});
userSchema.methods.verifyPassword = function verifyPassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};
userSchema.methods.toJSON = function safeUser() {
  const value = this.toObject();
  delete value.passwordHash;
  delete value.sessionVersion;
  delete value.__v;
  return value;
};

export const User = mongoose.models.User || mongoose.model("User", userSchema);
