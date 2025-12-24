import { ChatbotMessage, ChatbotSession } from '../models/Chatbot.js';
import FAQ from '../models/Faq.js';
import Property from '../models/Property.js';
import PGProperty from '../models/PGProperty.js';
import Room from '../models/Room.js';
import User from '../models/User.js';

export class ChatbotService {
  constructor() {
    console.log('✅ Enhanced Chatbot Service Initialized');
  }

  async getOrCreateSession(userId, userType = 'guest') {
    try {
      let sessionId;
      
      if (userId) {
        sessionId = `user_${userId}`;
      } else {
        sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      
      let session = await ChatbotSession.findOne({ sessionId });
      
      if (!session) {
        session = new ChatbotSession({
          sessionId,
          userId: userId || null,
          userType
        });
        await session.save();
      } else {
        session.lastInteraction = new Date();
        await session.save();
      }

      return session;
    } catch (error) {
      console.error('Error creating session:', error);
      return {
        sessionId: userId ? `user_${userId}` : `temp_${Date.now()}`,
        userId,
        userType
      };
    }
  }

  async processMessage(sessionId, userId, userType, message) {
    try {
      const session = await this.getOrCreateSession(userId, userType);
      
      // Check if it's a quick reply action
      let intent;
      let entities = {};
      
      if (message.startsWith('ACTION:')) {
        // Handle action from quick reply
        const action = message.replace('ACTION:', '');
        return await this.handleAction(action, session);
      } else {
        // Analyze regular message
        const analysis = this.analyzeMessage(message);
        intent = analysis.intent;
        entities = analysis.entities;
      }
      
      // Generate response based on intent
      const responseData = await this.generateResponse(intent, entities, session, message);
      
      // Save messages if DB is available
      try {
        const userMessage = new ChatbotMessage({
          sessionId: session.sessionId,
          userId: session.userId,
          userType: session.userType,
          message,
          intent,
          response: responseData.response,
          quickReplies: responseData.quickReplies,
          actions: responseData.actions,
          isBot: false
        });
        await userMessage.save();

        const botMessage = new ChatbotMessage({
          sessionId: session.sessionId,
          userId: session.userId,
          userType: session.userType,
          message: responseData.response,
          intent,
          response: responseData.response,
          quickReplies: responseData.quickReplies,
          actions: responseData.actions,
          isBot: true
        });
        await botMessage.save();
      } catch (dbError) {
        console.log('Message save skipped:', dbError.message);
      }

      return {
        success: true,
        ...responseData,
        sessionId: session.sessionId
      };

    } catch (error) {
      console.error('Error processing message:', error);
      return this.getFallbackResponse(sessionId);
    }
  }

  // Handle quick reply actions
  async handleAction(action, session) {
    switch (action) {
      case 'find_hostels':
        return await this.handleFindHostels(session);
      
      case 'check_prices':
        return await this.handleCheckPrices(session);
      
      case 'virtual_tour':
        return await this.handleVirtualTour(session);
      
      case 'my_bookings':
        return await this.handleMyBookings(session);
      
      case 'filter_city_mumbai':
        return await this.handleFilterCity('Mumbai', session);
      
      case 'filter_city_delhi':
        return await this.handleFilterCity('Delhi', session);
      
      case 'filter_city_bangalore':
        return await this.handleFilterCity('Bangalore', session);
      case 'filter_city_chennai':
        return await this.handleFilterCity('Chennai', session);
       case 'filter_city_hyderabad':
        return await this.handleFilterCity('Hyderabad', session);
        case 'filter_city_pune':
        return await this.handleFilterCity('Pune', session);
        case 'filter_city_kolkata':
        return await this.handleFilterCity('Kolkata', session);
        case 'filter_city_ahmedabad':
        return await this.handleFilterCity('Ahmedabad', session);
        case 'filter_city_surath':
        return await this.handleFilterCity('Surath', session);
        case 'filter_city_indore':
        return await this.handleFilterCity('Indore', session);
        case 'filter_city_nagpur':
        return await this.handleFilterCity('Nagpur', session);
        case 'filter_city_jaipur':
        return await this.handleFilterCity('Jaipur', session);
        case 'filter_city_lucknow':
        return await this.handleFilterCity('Lucknow', session);
        case 'filter_city_bhopal':
        return await this.handleFilterCity('Bhopal', session);
        case 'filter_city_coimbatore':
        return await this.handleFilterCity('Coimbatore', session);   
      
      case 'filter_budget_5000':
        return await this.handleFilterBudget(5000, session);
      
      case 'filter_budget_8000':
        return await this.handleFilterBudget(8000, session);
      
      case 'filter_budget_10000':
        return await this.handleFilterBudget(10000, session);
      
      default:
        return this.getGreetingResponse(session);
    }
  }

  // Handle "Find hostels" action
  async handleFindHostels(session) {
    try {
      // Get all approved properties with their details
      const properties = await Property.find({ status: 'approved' })
        .limit(10)
        .lean();

      if (properties.length === 0) {
        return {
          response: "Currently, there are no hostels available. Please check back later or try different cities.",
          quickReplies: [
            { text: "Check Mumbai", action: "filter_city_mumbai" },
            { text: "Check Delhi", action: "filter_city_delhi" },
            { text: "Check Bangalore", action: "filter_city_bangalore" },
            { text: "Check Chennai", action: "filter_city_chennai" },
            { text: "Check Hyderabad", action: "filter_city_hyderabad" },
            { text: "Check Pune", action: "filter_city_pune" },
            { text: "Check Kolkata", action: "filter_city_kolkata" },
            { text: "Check Ahmedabad", action: "filter_city_ahmedabad" },
            { text: "Check Surath", action: "filter_city_surath" },
            { text: "Check Indore", action: "filter_city_indore" },
            { text: "Check Nagpur", action: "filter_city_nagpur" },
            { text: "Check Jaipur", action: "filter_city_jaipur" },
            { text: "Check Lucknow", action: "filter_city_lucknow" },
            { text: "Check Bhopal", action: "filter_city_bhopal" },
            { text: "Check Coimbatore", action: "filter_city_coimbatore" },

            { text: "Show All", action: "find_hostels" }
          ],
          actions: [
            {
              type: 'browse_all',
              url: '/user/pgsearch',
              label: 'Browse All Properties'
            }
          ],
          intent: 'availability',
          properties: []
        };
      }

      // Get additional details for each property
      const enhancedProperties = await Promise.all(
        properties.map(async (property) => {
          try {
            const pgProperty = await PGProperty.findOne({ propertyId: property._id }).lean();
            const room = await Room.findOne({ propertyId: property._id }).lean();
            
            // Calculate minimum price
            let minPrice = 0;
            if (room && room.roomTypes && room.roomTypes.length > 0) {
              minPrice = Math.min(...room.roomTypes.map(rt => rt.price || 0));
            }

            // Get amenities
            const amenities = pgProperty?.amenities || [];
            
            // Get images from Media model or use default
            const images = pgProperty?.images || [`/api/properties/${property._id}/images`];

            return {
              id: property._id,
              name: property.name,
              city: property.city,
              locality: property.locality,
              street: property.street,
              price: minPrice,
              rating: property.rating || 4.0,
              reviews: property.reviews || 0,
              amenities: amenities.slice(0, 5),
              gender: pgProperty?.gender || 'Co Living',
              foodIncluded: pgProperty?.foodIncluded || 'No',
              tenantType: pgProperty?.tenantType || 'Not Specific',
              available: true,
              image: images[0] || '/default-property.jpg',
              images: images,
              propertyId: property.propertyId,
              description: pgProperty?.description || 'Premium hostel with great amenities'
            };
          } catch (error) {
            console.error(`Error enhancing property ${property._id}:`, error);
            return {
              id: property._id,
              name: property.name,
              city: property.city,
              locality: property.locality,
              price: 0,
              available: true,
              image: '/default-property.jpg'
            };
          }
        })
      );

      // Filter out null properties
      const validProperties = enhancedProperties.filter(p => p !== null);

      const response = `I found ${validProperties.length} hostels for you! 🏠\n\nHere are some options:`;

      return {
        response,
        quickReplies: [
          { text: "In Mumbai", action: "filter_city_mumbai" },
          { text: "In Delhi", action: "filter_city_delhi" },
          { text: "In Bangalore", action: "filter_city_bangalore" },
            { text: "In Chennai", action: "filter_city_chennai" },
            { text: "In Hyderabad", action: "filter_city_hyderabad" },
            { text: "In Pune", action: "filter_city_pune" },
            { text: "In Kolkata", action: "filter_city_kolkata" },
            { text: "In Ahmedabad", action: "filter_city_ahmedabad" },
            { text: "In Surath", action: "filter_city_surath" },
            { text: "In Indore", action: "filter_city_indore" },
            { text: "In Nagpur", action: "filter_city_nagpur" },
            { text: "In Jaipur", action: "filter_city_jaipur" },
            { text: "In Lucknow", action: "filter_city_lucknow" },
            { text: "In Bhopal", action: "filter_city_bhopal" },
            { text: "In Coimbatore", action: "filter_city_coimbatore" },

          { text: "Under ₹5000", action: "filter_budget_5000" },
          { text: "Under ₹8000", action: "filter_budget_8000" },
          { text: "Above ₹10000", action: "filter_budget_10000" }

        ],
        actions: [
          {
            type: 'browse_all',
            url: '/user/pgsearch',
            label: 'View All Properties'
          },
          {
            type: 'virtual_tour',
            url: '/virtual-tour',
            label: 'Book Virtual Tour'
          }
        ],
        intent: 'availability',
        properties: validProperties,
        showProperties: true // Flag to indicate properties should be shown
      };

    } catch (error) {
      console.error('Error finding hostels:', error);
      return {
        response: "I'm having trouble fetching hostels right now. Please try the main search page.",
        quickReplies: [
          { text: "Try Again", action: "find_hostels" },
          { text: "Browse Website", action: "browse_website" }
        ],
        actions: [
          {
            type: 'search_page',
            url: '/user/pgsearch',
            label: 'Go to Search Page'
          }
        ],
        intent: 'availability',
        properties: [],
        showProperties: false
      };
    }
  }

  // Handle city filtering
  async handleFilterCity(city, session) {
    try {
      const properties = await Property.find({ 
        status: 'approved',
        city: { $regex: new RegExp(city, 'i') }
      }).limit(8).lean();

      if (properties.length === 0) {
        return {
          response: `No hostels found in ${city}. Try another city or check back later.`,
          quickReplies: [
            { text: "Check Mumbai", action: "filter_city_mumbai" },
            { text: "Check Delhi", action: "filter_city_delhi" },
            { text: "Check Bangalore", action: "filter_city_bangalore" },
            { text: "Check Chennai", action: "filter_city_chennai" },
            { text: "Check Hyderabad", action: "filter_city_hyderabad" },
            { text: "Check Pune", action: "filter_city_pune" },
            { text: "Check Kolkata", action: "filter_city_kolkata" },
            { text: "Check Ahmedabad", action: "filter_city_ahmedabad" },
            { text: "Check Surath", action: "filter_city_surath" },
            { text: "Check Indore", action: "filter_city_indore" },
            { text: "Check Nagpur", action: "filter_city_nagpur" },
            { text: "Check Jaipur", action: "filter_city_jaipur" },
            { text: "Check Lucknow", action: "filter_city_lucknow" },
            { text: "Check Bhopal", action: "filter_city_bhopal" },
            { text: "Check Coimbatore", action: "filter_city_coimbatore" },
            { text: "Show All", action: "find_hostels" }
          ],
          intent: 'availability',
          properties: []
        };
      }

      const enhancedProperties = await this.enhanceProperties(properties);

      return {
        response: `Found ${enhancedProperties.length} hostels in ${city}:`,
        quickReplies: [
          { text: "All Cities", action: "find_hostels" },
          { text: "Under ₹5000", action: "filter_budget_5000" },
          { text: "Under ₹8000", action: "filter_budget_8000" },
          { text: "Book Tour", action: "virtual_tour" }
        ],
        actions: [
          {
            type: 'view_city',
            url: `/user/pgsearch?city=${encodeURIComponent(city)}`,
            label: `View All in ${city}`
          }
        ],
        intent: 'availability',
        properties: enhancedProperties,
        showProperties: true
      };

    } catch (error) {
      console.error(`Error filtering city ${city}:`, error);
      return this.handleFindHostels(session);
    }
  }

  // Handle budget filtering
  async handleFilterBudget(budget, session) {
    try {
      // First get all properties
      const properties = await Property.find({ status: 'approved' }).limit(10).lean();
      
      // Enhance properties and filter by budget
      const enhancedProperties = await this.enhanceProperties(properties);
      const filteredProperties = enhancedProperties.filter(p => p.price <= budget);

      if (filteredProperties.length === 0) {
        return {
          response: `No hostels found under ₹${budget}. Try increasing your budget or check different cities.`,
          quickReplies: [
            { text: `Under ₹${budget + 3000}`, action: `filter_budget_${budget + 3000}` },
            { text: "All Budgets", action: "find_hostels" },
            { text: "Check Prices", action: "check_prices" }
          ],
          intent: 'pricing',
          properties: []
        };
      }

      return {
        response: `Found ${filteredProperties.length} hostels under ₹${budget}:`,
        quickReplies: [
          { text: "Under ₹5000", action: "filter_budget_5000" },
          { text: "Under ₹8000", action: "filter_budget_8000" },
          { text: "Under ₹10000", action: "filter_budget_10000" },
          { text: "All Hostels", action: "find_hostels" }
        ],
        actions: [
          {
            type: 'view_budget',
            url: `/user/pgsearch?maxPrice=${budget}`,
            label: `View All Under ₹${budget}`
          }
        ],
        intent: 'pricing',
        properties: filteredProperties,
        showProperties: true
      };

    } catch (error) {
      console.error(`Error filtering budget ${budget}:`, error);
      return this.handleFindHostels(session);
    }
  }

  // Handle "Check prices" action
  async handleCheckPrices(session) {
    const response = `💰 **Price Ranges:**\n\n` +
      `• Shared Room (3-4 sharing): ₹3,000 - ₹5,000/month\n` +
      `• Double Sharing: ₹5,000 - ₹8,000/month\n` +
      `• Single Room: ₹8,000 - ₹12,000/month\n` +
      `• Single AC Room: ₹10,000 - ₹15,000/month\n\n` +
      `Prices include basic amenities. Additional charges may apply for premium amenities.`;

    return {
      response,
      quickReplies: [
        { text: "Under ₹5000", action: "filter_budget_5000" },
        { text: "Under ₹8000", action: "filter_budget_8000" },
        { text: "Under ₹10000", action: "filter_budget_10000" },
        { text: "Find Hostels", action: "find_hostels" }
      ],
      actions: [
        {
          type: 'price_guide',
          url: '/pricing',
          label: 'View Detailed Pricing'
        }
      ],
      intent: 'pricing',
      properties: []
    };
  }

  // Handle "Virtual tour" action
  async handleVirtualTour(session) {
    const response = `🎥 **Virtual Tour Booking**\n\n` +
      `Experience our hostels with 360° virtual tours!\n\n` +
      `**Features:**\n` +
      `• Room walkthroughs\n` +
      `• Common area views\n` +
      `• Amenities showcase\n` +
      `• Live Q&A session\n\n` +
      `Book a tour to explore before you decide!`;

    return {
      response,
      quickReplies: [
        { text: "Book Now", action: "book_tour_now" },
        { text: "See Sample", action: "view_sample_tour" },
        { text: "Find Hostels", action: "find_hostels" },
        { text: "Check Prices", action: "check_prices" }
      ],
      actions: [
        {
          type: 'book_tour',
          url: '/virtual-tour/booking',
          label: 'Book Virtual Tour'
        },
        {
          type: 'sample_tour',
          url: '/virtual-tour/sample',
          label: 'View Sample Tour'
        }
      ],
      intent: 'virtual_tour',
      properties: []
    };
  }

  // Handle "My bookings" action
  async handleMyBookings(session) {
    if (!session.userId) {
      return {
        response: "To view your bookings, please login to your account first.",
        quickReplies: [
          { text: "Login", action: "go_to_login" },
          { text: "Find Hostels", action: "find_hostels" },
          { text: "Contact Support", action: "contact_support" }
        ],
        actions: [
          {
            type: 'login',
            url: '/user/login',
            label: 'Login Now'
          }
        ],
        intent: 'booking',
        properties: []
      };
    }

    const response = `📋 **Your Bookings**\n\n` +
      `View and manage your current and past bookings.\n\n` +
      `Click the button below to see your bookings.`;

    return {
      response,
      quickReplies: [
        { text: "Find Hostels", action: "find_hostels" },
        { text: "Check Prices", action: "check_prices" },
        { text: "Contact Support", action: "contact_support" }
      ],
      actions: [
        {
          type: 'my_bookings',
          url: '/user/my-stay',
          label: 'View My Bookings'
        },
        {
          type: 'book_now',
          url: '/user/pgsearch',
          label: 'Book New Hostel'
        }
      ],
      intent: 'booking',
      properties: []
    };
  }

  // Helper method to enhance properties with additional data
  async enhanceProperties(properties) {
    return await Promise.all(
      properties.map(async (property) => {
        try {
          const pgProperty = await PGProperty.findOne({ propertyId: property._id }).lean();
          const room = await Room.findOne({ propertyId: property._id }).lean();
          
          let minPrice = 0;
          if (room && room.roomTypes && room.roomTypes.length > 0) {
            minPrice = Math.min(...room.roomTypes.map(rt => rt.price || 0));
          }

          const amenities = pgProperty?.amenities?.slice(0, 5) || [];

          return {
            id: property._id,
            name: property.name,
            city: property.city,
            locality: property.locality,
            street: property.street,
            price: minPrice,
            rating: property.rating || 4.0,
            reviews: property.reviews || 0,
            amenities: amenities,
            gender: pgProperty?.gender || 'Co Living',
            foodIncluded: pgProperty?.foodIncluded || 'No',
            tenantType: pgProperty?.tenantType || 'Not Specific',
            available: true,
            image: '/default-property.jpg',
            propertyId: property.propertyId,
            description: pgProperty?.description || `Hostel in ${property.locality}, ${property.city}`
          };
        } catch (error) {
          console.error(`Error enhancing property ${property._id}:`, error);
          return null;
        }
      })
    ).then(results => results.filter(p => p !== null));
  }

  // Analyze regular messages
  analyzeMessage(message) {
    const lowerMsg = message.toLowerCase();
    let intent = 'greeting';
    const entities = {};

    if (lowerMsg.includes('available') || lowerMsg.includes('room') || lowerMsg.includes('hostel')) {
      intent = 'availability';
    } else if (lowerMsg.includes('price') || lowerMsg.includes('cost') || lowerMsg.includes('rent')) {
      intent = 'pricing';
    } else if (lowerMsg.includes('book') || lowerMsg.includes('reserve')) {
      intent = 'booking';
    } else if (lowerMsg.includes('tour') || lowerMsg.includes('visit')) {
      intent = 'virtual_tour';
    }

    return { intent, entities };
  }

  // Generate response for regular messages
  async generateResponse(intent, entities, session, message) {
    switch (intent) {
      case 'greeting':
        return this.getGreetingResponse(session);
      
      case 'availability':
        return await this.handleFindHostels(session);
      
      case 'pricing':
        return this.handleCheckPrices(session);
      
      case 'virtual_tour':
        return this.handleVirtualTour(session);
      
      case 'booking':
        return this.handleMyBookings(session);
      
      default:
        return this.getGreetingResponse(session);
    }
  }

  // Get greeting response
  getGreetingResponse(session) {
    const userName = session.userContext?.name || '';
    const greeting = userName ? `Hello ${userName}! 👋` : "Hello! 👋";
    
    return {
      response: `${greeting} I'm Livy, your AI assistant for Livyco Hostels. How can I help you today?`,
      quickReplies: [
        { text: "Find hostels", action: "find_hostels" },
        { text: "Check prices", action: "check_prices" },
        { text: "Book virtual tour", action: "virtual_tour" },
        { text: "My bookings", action: "my_bookings" }
      ],
      actions: [
        {
          type: 'browse',
          url: '/user/pgsearch',
          label: 'Browse Properties'
        }
      ],
      intent: 'greeting',
      properties: []
    };
  }

  // Get fallback response
  getFallbackResponse(sessionId) {
    return {
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
          label: 'Browse Properties'
        }
      ],
      intent: 'greeting',
      sessionId: sessionId || `temp_${Date.now()}`
    };
  }

  // Get conversation history
  async getConversationHistory(sessionId) {
    try {
      const messages = await ChatbotMessage.find({ sessionId })
        .sort({ timestamp: 1 })
        .limit(50)
        .lean();
      
      return messages.map(msg => ({
        _id: msg._id?.toString(),
        message: msg.message,
        response: msg.response,
        isBot: msg.isBot,
        timestamp: msg.timestamp,
        quickReplies: msg.quickReplies || [],
        actions: msg.actions || [],
        properties: msg.properties || []
      }));
    } catch (error) {
      console.error('Error getting history:', error);
      return [];
    }
  }
}