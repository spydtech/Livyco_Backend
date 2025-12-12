import express from "express";
import { 
  createContact, 
  getUserContacts, 
  getClientContacts, 
  updateContactStatus, 
  deleteContact,
  getContactStats,
  getAllContactsForAdmin  // Add this import
} from "../controllers/contactController.js";
import { verifyToken } from "../utils/jwtUtils.js";

const router = express.Router();

// User routes (user contacting clients)
router.post("/contact", verifyToken, createContact);
router.get("/user/contacts", verifyToken, getUserContacts);
router.delete("/contact/:contactId", verifyToken, deleteContact);
router.get("/user/contacts/stats", verifyToken, getContactStats);

// Client routes (clients managing received contacts)
router.get("/client/contacts", verifyToken, getClientContacts);
router.put("/contact/:contactId/status", verifyToken, updateContactStatus);

// ============== ADMIN ROUTE ==============
// Add this line for admin to get ALL contacts
router.get("/admin/all", verifyToken, getAllContactsForAdmin);

export default router;