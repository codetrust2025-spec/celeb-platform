const Booking = require('../models/Booking')
const Celebrity = require('../models/Celebrity')

const isAdmin = req => req.userRole === 'admin'

const STATUS_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['cancelled'],
  cancelled: []
}

exports.createBooking = async (req, res) => {
  const { name, contact, eventType, eventTime, eventDate, eventLocation, celebrityId } = req.body
  const userId = String(req.userId)

  // Validate required fields
  if (!name || !contact || !eventType || !eventDate || !eventTime || !eventLocation || !celebrityId)
    return res.status(400).json({ message: 'All fields are required' })

  // Validate event date is in the future (compare date only, not time)
  const date = new Date(eventDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (isNaN(date.getTime()) || date < today)
    return res.status(400).json({ message: 'Event date must be today or in the future' })

  try {
    // Verify celebrity exists
    const celebrity = await Celebrity.findById(celebrityId)
    if (!celebrity) return res.status(404).json({ message: 'Celebrity not found' })

    const booking = new Booking({ name, contact, eventType, eventTime, eventDate, eventLocation, celebrity: celebrityId, userId })
    await booking.save()
    res.status(201).json(booking)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.updateBooking = async (req, res) => {
  const { bookingId } = req.params
  const { name, contact, eventType, eventDate, eventTime, eventLocation } = req.body
  try {
    const booking = await Booking.findById(bookingId)
    if (!booking) return res.status(404).json({ message: 'Booking not found' })
    if (!isAdmin(req) && booking.userId !== String(req.userId))
      return res.status(403).json({ message: 'Not authorized to update this booking' })
    if (booking.status === 'cancelled')
      return res.status(400).json({ message: 'Cannot update a cancelled booking' })

    // Validate future date if provided
    if (eventDate) {
      const date = new Date(eventDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (isNaN(date.getTime()) || date < today)
        return res.status(400).json({ message: 'Event date must be today or in the future' })
      booking.eventDate = eventDate
    }
    if (name) booking.name = name
    if (contact) booking.contact = contact
    if (eventType) booking.eventType = eventType
    if (eventTime) booking.eventTime = eventTime
    if (eventLocation) booking.eventLocation = eventLocation
    await booking.save()
    res.json(booking)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 50
    const skip = (page - 1) * limit

    // countDocuments does not run the model's /^find/ soft-delete middleware.
    const filter = { deletedAt: null }
    if (!isAdmin(req)) {
      if (req.userRole === 'celebrity') {
        filter.celebrity = req.userId
      } else {
        filter.userId = String(req.userId)
      }
    }

    const [bookings, total] = await Promise.all([
      Booking.find(filter).populate('celebrity').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Booking.countDocuments(filter)
    ])
    res.json({ bookings, total, page, pages: Math.ceil(total / limit) })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.deleteBooking = async (req, res) => {
  const { bookingId } = req.params
  try {
    const booking = await Booking.findById(bookingId)
    if (!booking) return res.status(404).json({ message: 'Booking not found' })
    if (!isAdmin(req) && booking.userId !== String(req.userId))
      return res.status(403).json({ message: 'Not authorized to delete this booking' })
    // Soft delete — consistent with Celebrity model
    booking.deletedAt = new Date()
    await booking.save()
    res.status(200).json({ message: 'Booking deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.confirmBooking = async (req, res) => {
  const { bookingId } = req.params
  try {
    if (!isAdmin(req)) return res.status(403).json({ message: 'Admin access required' })
    const booking = await Booking.findById(bookingId)
    if (!booking) return res.status(404).json({ message: 'Booking not found' })
    if (!STATUS_TRANSITIONS[booking.status].includes('confirmed'))
      return res.status(400).json({ message: `Cannot confirm a ${booking.status} booking` })
    booking.status = 'confirmed'
    await booking.save()
    res.status(200).json({ message: 'Booking confirmed', booking })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.cancelBooking = async (req, res) => {
  const { bookingId } = req.params
  try {
    const booking = await Booking.findById(bookingId)
    if (!booking) return res.status(404).json({ message: 'Booking not found' })
    if (!isAdmin(req) && booking.userId !== String(req.userId))
      return res.status(403).json({ message: 'Not authorized to cancel this booking' })
    if (!STATUS_TRANSITIONS[booking.status].includes('cancelled'))
      return res.status(400).json({ message: `Cannot cancel a ${booking.status} booking` })
    booking.status = 'cancelled'
    await booking.save()
    res.status(200).json({ message: 'Booking cancelled', booking })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
