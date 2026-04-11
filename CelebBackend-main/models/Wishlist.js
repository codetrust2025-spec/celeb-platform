const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  celebrities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Celebrity' }],
}, { timestamps: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);
