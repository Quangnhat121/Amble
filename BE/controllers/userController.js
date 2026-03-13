const User = require('../models/User');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favoriteRoutes');
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, phone, bio, location, avatar } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { fullName, phone, bio, location, avatar },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: updatedUser,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully!',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Toggle favorite route
exports.toggleFavoriteRoute = async (req, res) => {
  try {
    const { routeId } = req.params;
    const user = await User.findById(req.user._id);

    const isFav = user.favoriteRoutes.includes(routeId);
    if (isFav) {
      user.favoriteRoutes = user.favoriteRoutes.filter(
        (id) => id.toString() !== routeId
      );
    } else {
      user.favoriteRoutes.push(routeId);
    }

    await user.save();
    await user.populate('favoriteRoutes');

    return res.status(200).json({
      success: true,
      message: isFav ? 'Removed from favorites' : 'Added to favorites',
      user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};