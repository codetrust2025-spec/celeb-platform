const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const User = require('../models/User')
const Celebrity = require('../models/Celebrity')
const protect = require('../middleware/authMiddleware')
const upload = require('../middleware/upload')

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is required')
const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'password123'

// Timing-safe string comparison to prevent timing attacks
const safeEqual = (a, b) => {
  try {
    return crypto.timingSafeEqual(Buffer.from(String(a)), Buffer.from(String(b)))
  } catch {
    return false
  }
}

const resolveIdentifier = (emailOrPhone) => {
  if (!emailOrPhone) return {}
  const trimmed = String(emailOrPhone).trim()
  if (/^\d{10}$/.test(trimmed)) return { phone: trimmed }
  return { email: trimmed.toLowerCase() }
}

// ── Admin Login ───────────────────────────────────────────────────────────────
router.post('/adminlogin', (req, res) => {
  const { username, password } = req.body
  if (safeEqual(username, ADMIN_USER) && safeEqual(password, ADMIN_PASS)) {
    const token = jwt.sign({ userId: 'admin', role: 'admin' }, JWT_SECRET, { expiresIn: '7d' })
    return res.status(200).json({ message: 'Login successful', token, user: { username, role: 'admin' } })
  }
  return res.status(401).json({ message: 'Invalid credentials or unauthorized access' })
})

// ── User Register ─────────────────────────────────────────────────────────────
router.post('/userregister', async (req, res) => {
  try {
    const { name, password, emailOrPhone, username, userId } = req.body
    if (!name || !password || !emailOrPhone)
      return res.status(400).json({ message: 'Name, password, and email/phone are required' })

    const identifier = resolveIdentifier(emailOrPhone)
    const existing = await User.findOne(identifier)
    if (existing) return res.status(400).json({ message: 'User already exists' })

    const hashed = await bcrypt.hash(password, 10)
    const user = new User({ userId, name, username, password: hashed, role: 'user', ...identifier })
    await user.save()

    return res.status(201).json({ message: 'Registration successful' })
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
})

// ── User Login ────────────────────────────────────────────────────────────────
router.post('/userlogin', async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body
    if (!emailOrPhone || !password)
      return res.status(400).json({ message: 'Email/phone and password are required' })

    const identifier = resolveIdentifier(emailOrPhone)
    const user = await User.findOne(identifier)
    if (!user) return res.status(401).json({ message: 'Invalid credentials or unauthorized access' })

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ message: 'Invalid credentials or unauthorized access' })

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' })
    const { password: _p, ...safeUser } = user.toObject()
    return res.status(200).json({ message: 'Login successful', token, user: { ...safeUser, userId: user._id } })
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
})

// ── Celebrity Register ────────────────────────────────────────────────────────
router.post('/celebrityregister', async (req, res) => {
  try {
    const { name, password, emailOrPhone, username } = req.body
    if (!name || !password || !emailOrPhone)
      return res.status(400).json({ message: 'Name, password, and email/phone are required' })

    const identifier = resolveIdentifier(emailOrPhone)
    const existing = await Celebrity.findOne({ ...identifier, password: { $exists: true } })
    if (existing) return res.status(400).json({ message: 'Celebrity already exists' })

    const hashed = await bcrypt.hash(password, 10)
    const celeb = new Celebrity({
      name,
      username,
      password: hashed,
      role: 'celebrity',
      description: 'Pending profile setup',
      price: 1, // min:1 required by schema; stub profiles are filtered from public listing
      contact: String(emailOrPhone),
      imageUrl: '/uploads/placeholder.jpg',
      ...identifier
    })
    await celeb.save()

    return res.status(201).json({ message: 'Registration successful' })
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
})

// ── Celebrity Login ───────────────────────────────────────────────────────────
router.post('/celebritylogin', async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body
    if (!emailOrPhone || !password)
      return res.status(400).json({ message: 'Email/phone and password are required' })

    const identifier = resolveIdentifier(emailOrPhone)
    const celeb = await Celebrity.findOne({ ...identifier, password: { $exists: true, $ne: null } })
    if (!celeb) return res.status(401).json({ message: 'Invalid credentials or unauthorized access' })

    const match = await bcrypt.compare(password, celeb.password)
    if (!match) return res.status(401).json({ message: 'Invalid credentials or unauthorized access' })

    const token = jwt.sign({ userId: celeb._id, role: 'celebrity' }, JWT_SECRET, { expiresIn: '7d' })
    const { password: _p, ...safeCeleb } = celeb.toObject()
    return res.status(200).json({ message: 'Login successful', token, celebrity: safeCeleb })
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
})

// ── Celebrity Profile (authenticated celebrity only) ──────────────────────────
router.get('/celebrity/profile', protect, async (req, res) => {
  try {
    if (req.userRole !== 'celebrity') return res.status(403).json({ message: 'Celebrity access required' })
    const celeb = await Celebrity.findById(req.userId).select('-password')
    if (!celeb) return res.status(404).json({ message: 'Celebrity profile not found' })
    res.json(celeb)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── Celebrity Availability ────────────────────────────────────────────────────
router.get('/celebrity/availability', protect, async (req, res) => {
  try {
    if (req.userRole !== 'celebrity') return res.status(403).json({ message: 'Celebrity access required' })
    const celeb = await Celebrity.findById(req.userId).select('availability')
    res.json(celeb?.availability || [])
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/celebrity/availability', protect, async (req, res) => {
  try {
    if (req.userRole !== 'celebrity') return res.status(403).json({ message: 'Celebrity access required' })
    const { date } = req.body
    if (!date) return res.status(400).json({ message: 'Date is required' })
    // Validate date format and future date
    const d = new Date(date)
    if (isNaN(d.getTime())) return res.status(400).json({ message: 'Invalid date format' })
    if (d < new Date()) return res.status(400).json({ message: 'Availability date must be in the future' })
    const celeb = await Celebrity.findById(req.userId)
    if (!celeb) return res.status(404).json({ message: 'Celebrity not found' })
    if (!celeb.availability) celeb.availability = []
    if (!celeb.availability.includes(date)) celeb.availability.push(date)
    await celeb.save()
    res.json(celeb.availability)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── Remove Availability Date ──────────────────────────────────────────────────
router.delete('/celebrity/availability', protect, async (req, res) => {
  try {
    if (req.userRole !== 'celebrity') return res.status(403).json({ message: 'Celebrity access required' })
    const { date } = req.body
    if (!date) return res.status(400).json({ message: 'Date is required' })
    const celeb = await Celebrity.findById(req.userId)
    if (!celeb) return res.status(404).json({ message: 'Celebrity not found' })
    celeb.availability = (celeb.availability || []).filter(d => d !== date)
    await celeb.save()
    res.json(celeb.availability)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── Celebrity Profile Update ──────────────────────────────────────────────────
router.put('/celebrity/profile', protect, upload.array('images', 5), async (req, res) => {
  try {
    if (req.userRole !== 'celebrity') return res.status(403).json({ message: 'Celebrity access required' })
    const celeb = await Celebrity.findById(req.userId)
    if (!celeb) return res.status(404).json({ message: 'Celebrity not found' })

    const { name, description, price, contact, category, socialLinks, instagramUrl, youtubeUrl } = req.body

    if (name) celeb.name = name.trim()
    if (description) celeb.description = description.trim()
    if (price !== undefined) {
      const p = Number(price)
      if (!Number.isFinite(p) || p <= 0) return res.status(400).json({ message: 'Invalid price' })
      celeb.price = p
    }
    if (contact) celeb.contact = String(contact).trim()
    if (category) celeb.category = String(category).trim()

    let links = { ...(celeb.socialLinks || {}) }
    if (socialLinks) { try { links = { ...links, ...JSON.parse(socialLinks) } } catch {} }
    if (instagramUrl) links.instagram = instagramUrl
    if (youtubeUrl) links.youtube = youtubeUrl
    celeb.socialLinks = links

    const files = Array.isArray(req.files) ? req.files : (req.file ? [req.file] : [])
    if (files.length > 0) {
      const imageUrls = files.map(f => `/uploads/${f.filename}`)
      celeb.imageUrl = imageUrls[0]
      celeb.images = imageUrls
    }

    await celeb.save()
    const { password: _p, ...safe } = celeb.toObject()
    res.json(safe)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
