import express from "express";
import {
  addOrUpdateMultiplePins,
  getAllLocations,
  getLocationByProperty,
} from "../controllers/mapController.js";

const router = express.Router();

router.post("/", addOrUpdateMultiplePins);
router.get("/", getAllLocations);
router.get("/:propertyId", getLocationByProperty);

export default router;
