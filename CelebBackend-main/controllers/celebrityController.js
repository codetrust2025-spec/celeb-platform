const Celebrity = require('../models/Celebrity')

const phoneOk = (s = '') => /^\+?\d{10,13}$/.test(String(s).trim())

exports.getCelebrities = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 100
    const skip = (page - 1) * limit
    // Exclude celebrity auth stubs (placeholder image = not a real public profile)
    const filter = { imageUrl: { $ne: '/uploads/placeholder.jpg' } }
    const celebrities = await Celebrity.find(filter).skip(skip).limit(limit)
    res.json(celebrities)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getCelebrityById = async (req, res) => {
  try {
    const celebrity = await Celebrity.findById(req.params.id)
    if (!celebrity) return res.status(404).json({ message: 'Celebrity not found' })
    res.json(celebrity)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.createCelebrity = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      contact,
      category,
      instagramUrl,
      youtubeUrl,
      socialLinks
    } = req.body

    const files = Array.isArray(req.files) ? req.files : (req.file ? [req.file] : [])
    const imageUrls = files.map(f => `/uploads/${f.filename}`)

    if (!name || !description || !price || !contact) {
      return res.status(400).json({ message: 'Missing required fields: name, description, price, contact' })
    }
    const priceNum = Number(price)
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      return res.status(400).json({ message: 'Invalid price value' })
    }
    if (!phoneOk(contact)) {
      return res.status(400).json({ message: 'Invalid contact number' })
    }
    if (imageUrls.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' })
    }

    let links = {}
    if (socialLinks) {
      try { links = JSON.parse(socialLinks) } catch { }
    }
    if (instagramUrl) links.instagram = instagramUrl
    if (youtubeUrl) links.youtube = youtubeUrl

    const doc = new Celebrity({
      name: name.trim(),
      description: description.trim(),
      price: priceNum,
      contact: String(contact).trim(),
      category: category ? String(category).trim() : undefined,
      imageUrl: imageUrls[0],
      images: imageUrls,
      socialLinks: links
    })

    await doc.save()
    return res.status(201).json(doc)
  } catch (error) {
    console.error('Error creating celebrity:', error)
    return res.status(500).json({ message: 'Internal Server Error', error: error.message })
  }
}

exports.updateCelebrity = async (req, res) => {
  try {
    const { id } = req.params
    const {
      name,
      description,
      price,
      contact,
      category,
      instagramUrl,
      youtubeUrl,
      socialLinks
    } = req.body

    const celebrity = await Celebrity.findById(id)
    if (!celebrity) return res.status(404).json({ message: 'Celebrity not found' })

    if (name) celebrity.name = name.trim()
    if (description) celebrity.description = description.trim()
    if (price !== undefined) {
      const priceNum = Number(price)
      if (!Number.isFinite(priceNum) || priceNum <= 0) {
        return res.status(400).json({ message: 'Invalid price value' })
      }
      celebrity.price = priceNum
    }
    if (contact) {
      if (!phoneOk(contact)) return res.status(400).json({ message: 'Invalid contact number' })
      celebrity.contact = String(contact).trim()
    }
    if (category) celebrity.category = String(category).trim()

    let links = { ...(celebrity.socialLinks || {}) }
    if (socialLinks) {
      try { links = { ...links, ...JSON.parse(socialLinks) } } catch { }
    }
    if (instagramUrl) links.instagram = instagramUrl
    if (youtubeUrl) links.youtube = youtubeUrl
    celebrity.socialLinks = links

    const files = Array.isArray(req.files) ? req.files : (req.file ? [req.file] : [])
    if (files.length > 0) {
      const imageUrls = files.map(f => `/uploads/${f.filename}`)
      celebrity.imageUrl = imageUrls[0]
      celebrity.images = imageUrls
    }

    await celebrity.save()
    return res.json(celebrity)
  } catch (error) {
    console.error('Error updating celebrity:', error)
    return res.status(500).json({ message: 'Internal Server Error', error: error.message })
  }
}

exports.deleteCelebrity = async (req, res) => {
  try {
    const { id } = req.params
    const celebrity = await Celebrity.findById(id)
    if (!celebrity) return res.status(404).json({ message: 'Celebrity not found' })
    // Soft delete — preserve booking history
    celebrity.deletedAt = new Date()
    await celebrity.save()
    return res.json({ message: 'Celebrity deleted successfully' })
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error', error: error.message })
  }
}