const Wishlist = require('../models/Wishlist');
const Celebrity = require('../models/Celebrity');

exports.getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.userId }).populate('celebrities')
    if (!wishlist) return res.status(200).json({ celebrities: [] })
    res.json(wishlist)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.addToWishlist = async (req, res) => {
  try {
    const { celebrityId } = req.params
    const userId = req.userId

    const celebrity = await Celebrity.findById(celebrityId)
    if (!celebrity) return res.status(404).json({ message: 'Celebrity not found' })

    // $addToSet is atomic — prevents duplicates even under concurrent requests
    const wishlist = await Wishlist.findOneAndUpdate(
      { userId },
      { $addToSet: { celebrities: celebrityId } },
      { upsert: true, new: true }
    ).populate('celebrities')

    res.status(201).json(wishlist)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.removeFromWishlist = async (req, res) => {
  try {
    const { celebrityId } = req.params
    const userId = req.userId

    const wishlist = await Wishlist.findOneAndUpdate(
      { userId },
      { $pull: { celebrities: celebrityId } },
      { new: true }
    ).populate('celebrities')

    if (!wishlist) return res.status(404).json({ message: 'Wishlist not found' })
    res.json(wishlist)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
