import express from 'express';
import {
  createCustomReview,
  getCustomReviewsByProperty, // Changed from getCustomReviews
  getAdminCustomReviews,
  approveCustomReview,
  rejectCustomReview,
  addAdminResponse,
  toggleFeatured,
  getPropertiesForReview,
  getApprovedCustomReviews
} from '../controllers/customReviewController.js';

const router = express.Router();

// User routes
router.post('/', createCustomReview);
router.get('/property/:propertyId', getCustomReviewsByProperty); // Updated function name

// Admin routes
router.get('/admin/all', getAdminCustomReviews);
router.get('/admin/properties', getPropertiesForReview);
router.get('/admin/approved', getApprovedCustomReviews);
router.put('/admin/approve/:id', approveCustomReview);
router.put('/admin/reject/:id', rejectCustomReview);
router.put('/admin/response/:id', addAdminResponse);
router.put('/admin/featured/:id', toggleFeatured);

export default router;