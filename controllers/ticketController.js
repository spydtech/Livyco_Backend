import Ticket from "../models/Ticket.js";

const generateTicketId = async () => {
  const lastTicket = await Ticket.findOne().sort({ ticketId: -1 });
  return lastTicket ? lastTicket.ticketId + 1 : 45436;
};

export const createTicket = async (req, res) => {
  try {
    const { clientId, livycoId, name, email, category, comment, priority } = req.body;

    if (!clientId || !livycoId || !name || !email || !category) {
      return res.status(400).json({ 
        success: false,
        message: "Missing required fields" 
      });
    }

    const ticketId = await generateTicketId();

    const newTicket = await Ticket.create({
      ticketId,
      clientId, 
      livycoId, 
      name,
      email,
      category,
      comment,
      priority,
    });

    res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      ticket: newTicket,
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    res.status(500).json({ 
      success: false,
      message: error.message || "Server error" 
    });
  }
};

export const getTicketsByClient = async (req, res) => {
  try {
    const { clientId } = req.params;

    const tickets = await Ticket.find({ clientId }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      tickets: tickets,
      count: tickets.length
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};

export const getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      tickets: tickets,
      count: tickets.length
    });
  } catch (error) {
    console.error("Error fetching all tickets:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};

export const updateTicket = async (req, res) => {
  try {
    const { assignedTo, status, priority } = req.body;

    const updateFields = {};
    if (assignedTo !== undefined) updateFields.assignedTo = assignedTo;
    if (status !== undefined) updateFields.status = status;
    if (priority !== undefined) updateFields.priority = priority;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "No fields to update" 
      });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      updateFields,   
      { new: true, runValidators: true }  
    );

    if (!ticket) {
      return res.status(404).json({ 
        success: false, 
        message: "Ticket not found" 
      });
    }

    res.json({
      success: true,
      message: "Ticket updated successfully",
      ticket,
    });
  } catch (err) {
    console.error("Error updating ticket:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: err.message 
    });
  }
};