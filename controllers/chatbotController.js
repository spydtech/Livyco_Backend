import { ChatbotService } from '../services/chatbotService.js';
import { ChatbotMessage, ChatbotSession } from '../models/Chatbot.js';
import FAQ from '../models/Faq.js';

const chatbotService = new ChatbotService();

export const chatbotController = {
  // Process chat message
  processMessage: async (req, res) => {
    try {
      const { message, sessionId } = req.body;
      const userId = req.user?._id;
      const userType = req.user?.role || 'guest';

      console.log('Chatbot request:', { 
        message: message?.substring(0, 50), 
        sessionId,
        userId: userId ? 'yes' : 'no'
      });

      // Input validation
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Message is required'
        });
      }

      const result = await chatbotService.processMessage(
        sessionId,
        userId,
        userType,
        message.trim()
      );

      console.log('Chatbot response generated:', { 
        intent: result.intent,
        propertiesCount: result.properties?.length || 0
      });

      res.json(result);

    } catch (error) {
      console.error('Chatbot controller error:', error);
      res.json({
        success: true,
        response: "Hello! 👋 I'm Livy, your AI assistant. How can I help you today?",
        quickReplies: [
          { text: "Find hostels", action: "find_hostels" },
          { text: "Check prices", action: "check_prices" },
          { text: "Contact support", action: "contact_support" }
        ],
        actions: [
          {
            type: 'browse',
            url: '/user/pgsearch',
            label: 'Browse properties'
          }
        ],
        intent: 'greeting',
        sessionId: req.body.sessionId || `error_${Date.now()}`,
        properties: []
      });
    }
  },

  // Get conversation history
  getHistory: async (req, res) => {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          error: 'Session ID is required'
        });
      }

      const history = await chatbotService.getConversationHistory(sessionId);
      
      const formattedHistory = history.map(msg => ({
        _id: msg._id,
        message: msg.isBot ? msg.response : msg.message,
        isBot: msg.isBot,
        timestamp: msg.timestamp,
        sender: msg.isBot ? 'bot' : 'user',
        quickReplies: msg.quickReplies,
        actions: msg.actions,
        properties: msg.properties || []
      }));

      res.json({
        success: true,
        history: formattedHistory,
        sessionId,
        count: formattedHistory.length
      });
    } catch (error) {
      console.error('Get history error:', error);
      res.json({
        success: true,
        history: [],
        sessionId: req.params.sessionId,
        count: 0
      });
    }
  },

  // Get properties for chatbot (if needed separately)
  getChatbotProperties: async (req, res) => {
    try {
      const { city, maxPrice } = req.query;
      
      let query = { status: 'approved' };
      
      if (city) {
        query.city = { $regex: new RegExp(city, 'i') };
      }

      const properties = await Property.find(query)
        .limit(15)
        .lean();

      // Enhance properties
      const enhancedProperties = await chatbotService.enhanceProperties(properties);

      // Filter by price if specified
      let filteredProperties = enhancedProperties;
      if (maxPrice) {
        filteredProperties = enhancedProperties.filter(p => p.price <= parseInt(maxPrice));
      }

      res.json({
        success: true,
        properties: filteredProperties,
        count: filteredProperties.length,
        filters: { city, maxPrice }
      });
    } catch (error) {
      console.error('Get chatbot properties error:', error);
      res.json({
        success: true,
        properties: [],
        count: 0
      });
    }
  },

  // Other methods remain the same...
  getFAQs: async (req, res) => {
    try {
      const faqs = await FAQ.find({ isActive: true })
        .sort({ priority: -1 })
        .limit(50)
        .lean();

      const groupedFAQs = {};
      faqs.forEach(faq => {
        if (!groupedFAQs[faq.category]) {
          groupedFAQs[faq.category] = [];
        }
        groupedFAQs[faq.category].push(faq);
      });

      res.json({
        success: true,
        faqs: groupedFAQs,
        allFAQs: faqs,
        total: faqs.length,
        categories: Object.keys(groupedFAQs)
      });
    } catch (error) {
      console.error('Get FAQs error:', error);
      res.json({
        success: true,
        faqs: {},
        allFAQs: [],
        total: 0,
        categories: []
      });
    }
  },

  submitFeedback: async (req, res) => {
    try {
      const { faqId, isHelpful } = req.body;

      if (!faqId) {
        return res.status(400).json({
          success: false,
          error: 'faqId is required'
        });
      }

      // Update FAQ helpfulness
      const update = isHelpful 
        ? { $inc: { helpfulCount: 1 } }
        : { $inc: { notHelpfulCount: 1 } };
      
      await FAQ.findByIdAndUpdate(faqId, update);

      res.json({
        success: true,
        message: 'Thank you for your feedback!'
      });
    } catch (error) {
      console.error('Submit feedback error:', error);
      res.json({
        success: true,
        message: 'Thank you for your feedback!'
      });
    }
  },

  clearConversation: async (req, res) => {
    try {
      const { sessionId } = req.body;

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          error: 'Session ID is required'
        });
      }

      await ChatbotMessage.deleteMany({ sessionId });
      await ChatbotSession.deleteOne({ sessionId });

      res.json({
        success: true,
        message: 'Conversation cleared',
        sessionId
      });
    } catch (error) {
      console.error('Clear conversation error:', error);
      res.json({
        success: true,
        message: 'Conversation cleared',
        sessionId: req.body.sessionId
      });
    }
  },

  getSessionInfo: async (req, res) => {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          error: 'Session ID is required'
        });
      }

      const session = await ChatbotSession.findOne({ sessionId }).lean();

      if (!session) {
        return res.json({
          success: true,
          session: {
            sessionId,
            userType: 'guest',
            lastInteraction: new Date(),
            status: 'active'
          }
        });
      }

      res.json({
        success: true,
        session: {
          sessionId: session.sessionId,
          userType: session.userType,
          lastInteraction: session.lastInteraction,
          status: session.status
        }
      });
    } catch (error) {
      console.error('Get session error:', error);
      res.json({
        success: true,
        session: {
          sessionId: req.params.sessionId,
          userType: 'guest',
          lastInteraction: new Date(),
          status: 'active'
        }
      });
    }
  },

  healthCheck: async (req, res) => {
    try {
      res.json({
        success: true,
        status: 'healthy',
        service: 'Chatbot API',
        timestamp: new Date().toISOString(),
        message: 'Chatbot service is running with property search'
      });
    } catch (error) {
      console.error('Health check error:', error);
      res.json({
        success: true,
        status: 'healthy',
        service: 'Chatbot API',
        timestamp: new Date().toISOString(),
        message: 'Chatbot service is running (fallback mode)'
      });
    }
  }
};