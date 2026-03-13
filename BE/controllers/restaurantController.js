const Restaurant = require('../models/Restaurant');

// GET /api/restaurants/featured
exports.getFeatured = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ isActive: true, isFeatured: true })
      .sort({ rating: -1 })
      .lean();
    return res.json({ success: true, restaurants });
  } catch (err) {
    console.error('[getFeatured]', err);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// GET /api/restaurants?city=&cuisine=&category=&search=&priceRange=
exports.getAll = async (req, res) => {
  try {
    const { city, cuisine, category, search, priceRange } = req.query;
    const filter = { isActive: true };

    if (city)       filter.city       = new RegExp(city, 'i');
    if (cuisine)    filter.cuisine    = new RegExp(cuisine, 'i');
    if (category)   filter.categories = category;
    if (priceRange) filter.priceRange = priceRange;

    if (search) {
      filter.$or = [
        { name:        new RegExp(search, 'i') },
        { cuisine:     new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { city:        new RegExp(search, 'i') },
        { tags:        new RegExp(search, 'i') },
      ];
    }

    const restaurants = await Restaurant.find(filter)
      .sort({ isFeatured: -1, rating: -1 })
      .lean();

    return res.json({ success: true, restaurants });
  } catch (err) {
    console.error('[getAll]', err);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// GET /api/restaurants/:id
exports.getById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ _id: req.params.id, isActive: true }).lean();
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy nhà hàng' });
    }
    return res.json({ success: true, restaurant });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
    }
    console.error('[getById]', err);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};