const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const protect = require('../middleware/authMiddleware');

router.post('/:celebrityId', protect, wishlistController.addToWishlist);
router.get('/', protect, wishlistController.getWishlist);
router.delete('/:celebrityId', protect, wishlistController.removeFromWishlist);

module.exports = router;
