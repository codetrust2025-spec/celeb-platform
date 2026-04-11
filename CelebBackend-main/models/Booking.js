const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  contact: { type: String, required: true },
  eventType: { type: String, required: true },
  eventDate: { type: Date, required: true },
  eventTime: { type: Date, required: true },
  eventLocation: { type: String, required: true },
  celebrity: { type: mongoose.Schema.Types.ObjectId, ref: 'Celebrity', required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

// Soft delete — exclude deleted bookings from all queries unless explicitly opted out
BookingSchema.pre(/^find/, function (next) {
  const q = this.getQuery()
  if (!q._includeSoftDeleted) {
    this.where({ deletedAt: null })
  } else {
    delete q._includeSoftDeleted
  }
  next()
})

module.exports = mongoose.model('Booking', BookingSchema);
