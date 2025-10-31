import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: Number,
      required: true,
      unique: true, // ensures no duplicates
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // assuming your client is stored in User model
      required: true,
    },
    livycoId: {type: String, required: true},
    name: { type: String, required: true },
    email: { type: String, required: true },
    category: { type: String, required: true },
    comment: { type: String },
    status: {
      type: String,
      enum: ["Open", "Resolved", "Closed"],
      default: "Open",
    },
     assignedTo: {
      type: String,
      default: "Unassigned",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Ticket", ticketSchema);
