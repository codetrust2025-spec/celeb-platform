const express = require('express');
const router = express.Router();
const celebrityController = require('../controllers/celebrityController');
const upload = require('../middleware/upload');
const protect = require('../middleware/authMiddleware');

// Get all celebrities (public)
router.get('/', celebrityController.getCelebrities);

// Get single celebrity by ID (public)
router.get('/:id', celebrityController.getCelebrityById);

// Create new celebrity (admin only)
router.post('/', protect, (req, res, next) => {
  if (req.userRole !== 'admin') return res.status(403).json({ message: 'Admin access required' })
  next()
}, (req, res, next) => {
  upload.array('images', 5)(req, res, err => {
    if (err) return next(err) // passes multer errors to global error handler
    next()
  })
}, celebrityController.createCelebrity);

// Update a celebrity (admin only)
router.put('/:id', protect, (req, res, next) => {
  if (req.userRole !== 'admin') return res.status(403).json({ message: 'Admin access required' })
  next()
}, (req, res, next) => {
  upload.array('images', 5)(req, res, err => {
    if (err) return next(err)
    next()
  })
}, celebrityController.updateCelebrity);

// Delete a celebrity (admin only)
router.delete('/:id', protect, (req, res, next) => {
  if (req.userRole !== 'admin') return res.status(403).json({ message: 'Admin access required' })
  next()
}, celebrityController.deleteCelebrity);

module.exports = router;