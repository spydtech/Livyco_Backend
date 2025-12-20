import Ticket from "../models/Ticket.js";

// Generate ticket ID starting from 1
const generateTicketId = async () => {
  try {
    // Find the highest ticketId
    const lastTicket = await Ticket.findOne().sort({ ticketId: -1 });
    
    // If no tickets exist, start from 1
    if (!lastTicket) {
      return 1;
    }
    
    // Return the next number
    return lastTicket.ticketId + 1;
  } catch (error) {
    console.error("Error generating ticket ID:", error);
    // Fallback: start from 1
    return 1;
  }
};

// CREATE TICKET
export const createTicket = async (req, res) => {
  try {
    const { clientId, livycoId, name, email, phone, category, comment, priority } = req.body;

    // Validate required fields
    if (!clientId || !livycoId || !name || !email || !category) {
      return res.status(400).json({ 
        success: false,
        message: "Missing required fields" 
      });
    }

    // Generate unique ticket ID (will start from 1)
    const ticketId = await generateTicketId();

    // Create new ticket
    const newTicket = await Ticket.create({
      ticketId,
      clientId: clientId, // This will be "LYVC00001"
      livycoId: livycoId || clientId, 
      name,
      email,
      phone: phone || "",
      category,
      comment: comment || "",
      priority: priority || "Medium",
      status: "Open",
      assignedTo: "Unassigned"
    });

    res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      ticket: newTicket,
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    
    // Handle duplicate ticket ID error
    if (error.code === 11000) {
      // Retry with a new ticket ID
      try {
        const ticketId = await generateTicketId();
        const newTicket = await Ticket.create({
          ticketId,
          clientId: req.body.clientId, 
          livycoId: req.body.livycoId || req.body.clientId,
          name: req.body.name,
          email: req.body.email,
          phone: req.body.phone || "",
          category: req.body.category,
          comment: req.body.comment || "",
          priority: req.body.priority || "Medium",
          status: "Open",
          assignedTo: "Unassigned"
        });

        return res.status(201).json({
          success: true,
          message: "Ticket created successfully",
          ticket: newTicket,
        });
      } catch (retryError) {
        console.error("Retry error:", retryError);
        return res.status(500).json({ 
          success: false,
          message: "Failed to create ticket after retry" 
        });
      }
    }
    
    res.status(500).json({ 
      success: false,
      message: error.message || "Server error" 
    });
  }
};

// GET TICKETS BY CLIENT ID (using clientId like "LYVC00001")
export const getTicketsByClient = async (req, res) => {
  try {
    const { clientId } = req.params;

    // Validate clientId
    if (!clientId) {
      return res.status(400).json({
        success: false,
        message: "Client ID is required"
      });
    }

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

// GET ALL TICKETS
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

// GET SINGLE TICKET BY ID
export const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const ticket = await Ticket.findById(id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found"
      });
    }
    
    res.status(200).json({
      success: true,
      ticket: ticket
    });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};

// UPDATE TICKET
export const updateTicket = async (req, res) => {
  try {
    const { assignedTo, status, priority, comment } = req.body;
    const { id } = req.params;

    // Build update object
    const updateFields = {};
    if (assignedTo !== undefined) updateFields.assignedTo = assignedTo;
    if (status !== undefined) updateFields.status = status;
    if (priority !== undefined) updateFields.priority = priority;
    if (comment !== undefined) updateFields.comment = comment;

    // Check if there are fields to update
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "No fields to update" 
      });
    }

    // Update ticket
    const ticket = await Ticket.findByIdAndUpdate(
      id,
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
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(err.errors).map(e => e.message)
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: err.message 
    });
  }
};

// DELETE TICKET
export const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    
    const ticket = await Ticket.findByIdAndDelete(id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Ticket deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting ticket:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// SEARCH TICKETS
export const searchTickets = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required"
      });
    }
    
    const tickets = await Ticket.find({
      $or: [
        { ticketId: { $regex: query, $options: 'i' } },
        { clientId: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { status: { $regex: query, $options: 'i' } }
      ]
    }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      tickets: tickets,
      count: tickets.length
    });
  } catch (error) {
    console.error("Error searching tickets:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// GET TICKETS BY STATUS
export const getTicketsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    
    const validStatuses = ["Open", "Resolved", "Closed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be Open, Resolved, or Closed"
      });
    }
    
    const tickets = await Ticket.find({ status }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      tickets: tickets,
      count: tickets.length
    });
  } catch (error) {
    console.error("Error fetching tickets by status:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// GET TICKETS BY PRIORITY
export const getTicketsByPriority = async (req, res) => {
  try {
    const { priority } = req.params;
    
    const validPriorities = ["Low", "Medium", "High"];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid priority. Must be Low, Medium, or High"
      });
    }
    
    const tickets = await Ticket.find({ priority }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      tickets: tickets,
      count: tickets.length
    });
  } catch (error) {
    console.error("Error fetching tickets by priority:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};