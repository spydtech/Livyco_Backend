import mongoose from "mongoose";

const MapLocationSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    pins: [
      {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
        address: { type: String },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("MapLocation", MapLocationSchema);
