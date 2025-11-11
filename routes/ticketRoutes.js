import express from "express";
import {
  createTicket,
  getTicketsByClient,
  getAllTickets,
  updateTicket,
} from "../controllers/ticketController.js";
import { verifyToken } from "../utils/jwtUtils.js";
import { authorizeAdmin, protectAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Create a new ticket
router.post("/", verifyToken, createTicket);

// Get all tickets for a specific client
router.get("/client/:clientId", verifyToken, getTicketsByClient);

// Get all tickets (for admin)
router.get("/", protectAdmin, authorizeAdmin(['admin']), getAllTickets);

// Update ticket (status / assignedTo / priority)
router.put("/:id", protectAdmin, authorizeAdmin(['admin']), updateTicket);

export default router;