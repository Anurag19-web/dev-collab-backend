import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      unique: true,
      required: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true
    },

    password: {
      type: String,
      required: true
    },

    bio: {
      type: String,
      default: ""
    },

    skills: {
      type: [String],
      default: []
    },

    github: {
      type: String,
      trim: true,
      default: ""
    },

    linkedin: {
      type: String,
      trim: true,
      default: ""
    },

    portfolio: {
      type: String,
      trim: true,
      default: ""
    },
    profilePicture: {
      type: String
    },

    public_id: {
      type: String
    },

    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: []
      }
    ],

    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: []
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);