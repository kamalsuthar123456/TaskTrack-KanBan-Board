import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
  {
    name: {
      type:      String,
      required:  [true, "Project name is required"],
      trim:      true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    description: {
      type:      String,
      default:   "",
      maxlength: [500, "Description cannot exceed 500 characters"],
    },

    // ✅ auto-derived from priority on frontend — kept for sidebar dot color
    color: {
      type:    String,
      default: "#F59E0B",
    },

    // ✅ NEW: priority replaces manual color picker
    priority: {
      type:    String,
      enum:    ["Critical", "High", "Medium", "Low", "Maybe Important", "Backlog"],
      default: "Medium",
    },

    owner: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },

    // registered user ObjectId refs
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref:  "User",
      },
    ],

    // pending email invites for people not yet registered
    invites: [
      {
        type:      String,
        trim:      true,
        lowercase: true,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Project", ProjectSchema);
