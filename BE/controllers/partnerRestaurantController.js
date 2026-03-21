const Restaurant = require('../models/restaurant');
const Partner = require('../models/partner');

const DAY_MAP = {
  T2: 'mon',
  T3: 'tue',
  T4: 'wed',
  T5: 'thu',
  T6: 'fri',
  T7: 'sat',
  CN: 'sun',
};

const mapDays = (days) => {
  if (!Array.isArray(days) || days.length === 0) return undefined;
  return days.map((day) => DAY_MAP[day] || day);
};

exports.setupRestaurant = async (req, res) => {
  try {
    const partner = req.partner;
    const {
      name,
      description,
      cuisines = [],
      suitableFor = [],
      priceMin = 0,
      priceMax = 0,
      city,
      address,
      phone,
      openTime,
      closeTime,
      openDays,
      hasParking,
      instagram,
      facebook,
      website,
      images = [],
    } = req.body;

    if (!name || !city || !address || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc.',
      });
    }

    const cuisineText = Array.isArray(cuisines) ? cuisines.join(', ') : String(cuisines || '');
    const mappedDays = mapDays(openDays);

    const updateData = {
      name,
      description: description || '',
      cuisine: cuisineText,
      categories: Array.isArray(cuisines) ? cuisines : [],
      tags: Array.isArray(suitableFor) ? suitableFor : [],
      priceMin: Number(priceMin) || 0,
      priceMax: Number(priceMax) || 0,
      priceRange: priceMin && priceMax ? `${priceMin}-${priceMax}` : '',
      city,
      address,
      phone,
      location: `${address}${city ? `, ${city}` : ''}`,
      openTime: openTime || '08:00',
      closeTime: closeTime || '22:00',
      openDays: mappedDays || undefined,
      hasParking: !!hasParking,
      instagram: instagram || '',
      facebook: facebook || '',
      website: website || '',
      images: Array.isArray(images) ? images : [],
    };

    let restaurant = null;

    if (partner.restaurantId) {
      restaurant = await Restaurant.findByIdAndUpdate(
        partner.restaurantId,
        { $set: updateData },
        { new: true }
      );
    }

    if (!restaurant) {
      restaurant = await Restaurant.findOneAndUpdate(
        { partnerId: partner._id },
        { $set: updateData, $setOnInsert: { partnerId: partner._id } },
        { new: true, upsert: true }
      );
    }

    if (!partner.restaurantId && restaurant) {
      partner.restaurantId = restaurant._id;
    }

    partner.restaurantName = name;
    partner.restaurantAddress = address;
    partner.restaurantCity = city;
    partner.cuisine = cuisineText;
    partner.description = description || '';
    await partner.save();

    return res.json({ success: true, restaurant });
  } catch (error) {
    console.error('[partner setup restaurant]', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
};
