import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: Number,
      required: true,
      unique: true,
    },
    clientId: {
      type: String, // Store as String (LYVC00001)
      required: true,
    },
    livycoId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Open", "Resolved", "Closed"],
      default: "Open",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    assignedTo: {
      type: String,
      default: "Unassigned",
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better performance
ticketSchema.index({ clientId: 1 });
ticketSchema.index({ ticketId: 1 });
ticketSchema.index({ status: 1 });

export default mongoose.model("Ticket", ticketSchema);