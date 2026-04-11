const mongoose = require('mongoose')

const SocialLinksSchema = new mongoose.Schema(
  { instagram: String, youtube: String },
  { _id: false }
)

const celebritySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 1, max: 10000000 },
    contact: { type: String, required: true },
    category: { type: String, trim: true },
    imageUrl: { type: String, required: true },
    images: { type: [String], default: [], validate: { validator: v => v.length <= 10, message: 'Maximum 10 images allowed' } },
    socialLinks: { type: SocialLinksSchema, default: {} },
    // Auth fields
    email: { type: String, lowercase: true, trim: true, sparse: true },
    phone: { type: String, trim: true, sparse: true },
    username: { type: String, trim: true, sparse: true },
    password: { type: String },
    role: { type: String, default: 'celebrity' },
    availability: { type: [String], default: [] },
    deletedAt: { type: Date, default: null }
  },
  { timestamps: true }
)

// Soft delete — exclude deleted celebrities from all queries unless explicitly opted out
celebritySchema.pre(/^find/, function (next) {
  const q = this.getQuery()
  // Only skip the filter if caller explicitly passes _includeSoftDeleted: true
  if (!q._includeSoftDeleted) {
    this.where({ deletedAt: null })
  } else {
    // Remove the internal flag so it doesn't leak into the DB query
    delete q._includeSoftDeleted
  }
  next()
})

celebritySchema.virtual('imageUrls').get(function () {
  if (Array.isArray(this.images) && this.images.length) return this.images
  return this.imageUrl ? [this.imageUrl] : []
})

celebritySchema.set('toJSON', { virtuals: true })
celebritySchema.set('toObject', { virtuals: true })

module.exports = mongoose.model('Celebrity', celebritySchema)
