const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Property = require('../models/Property');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();
router.get('/properties', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const properties = await Property.find({ owner: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await Property.countDocuments({ owner: req.user._id });
    const totalPages = Math.ceil(total / limit);
    res.json({
      properties,
      pagination: {
        currentPage: page,
        totalPages,
        totalProperties: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Server error',
      message: 'Error fetching user properties'
    });
  }
});
router.get('/favorites', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'favorites',
      populate: [
        { path: 'owner', select: 'name email phone' },
        { path: 'agent', select: 'name email phone' }
      ]
    });
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ 
      error: 'Server error',
      message: 'Error fetching favorites'
    });
  }
});
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await User.countDocuments({});
    const totalPages = Math.ceil(total / limit);
    res.json({
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Server error',
      message: 'Error fetching users'
    });
  }
});
router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('favorites');
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ 
      error: 'Server error',
      message: 'Error fetching user'
    });
  }
});
router.put('/:id', protect, authorize('admin'), [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('role').optional().isIn(['buyer', 'seller', 'agent', 'admin']).withMessage('Invalid role'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  body('isVerified').optional().isBoolean().withMessage('isVerified must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }
    if (req.body.name) user.name = req.body.name;
    if (req.body.role) user.role = req.body.role;
    if (req.body.phone) user.phone = req.body.phone;
    if (req.body.location) user.location = req.body.location;
    if (req.body.bio) user.bio = req.body.bio;
    if (req.body.avatar) user.avatar = req.body.avatar;
    if (req.body.isActive !== undefined) user.isActive = req.body.isActive;
    if (req.body.isVerified !== undefined) user.isVerified = req.body.isVerified;
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      location: updatedUser.location,
      bio: updatedUser.bio,
      avatar: updatedUser.avatar,
      isActive: updatedUser.isActive,
      isVerified: updatedUser.isVerified,
      createdAt: updatedUser.createdAt
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Server error',
      message: 'Error updating user'
    });
  }
});
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }
    const userProperties = await Property.countDocuments({ owner: user._id });
    if (userProperties > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete user',
        message: 'User has properties associated with their account'
      });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ 
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Server error',
      message: 'Error deleting user'
    });
  }
});
router.get('/stats', protect, async (req, res) => {
  try {
    const totalProperties = await Property.countDocuments({ owner: req.user._id });
    const activeProperties = await Property.countDocuments({ 
      owner: req.user._id, 
      isActive: true 
    });
    const totalViews = await Property.aggregate([
      { $match: { owner: req.user._id } },
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);
    const totalFavorites = await Property.aggregate([
      { $match: { owner: req.user._id } },
      { $group: { _id: null, totalFavorites: { $sum: { $size: '$favorites' } } } }
    ]);
    const totalValue = await Property.aggregate([
      { $match: { owner: req.user._id } },
      { $group: { _id: null, totalValue: { $sum: '$price' } } }
    ]);
    res.json({
      totalProperties,
      activeProperties,
      totalViews: totalViews[0]?.totalViews || 0,
      totalFavorites: totalFavorites[0]?.totalFavorites || 0,
      totalValue: totalValue[0]?.totalValue || 0,
      propertiesChange: '+0',
      favoritesChange: '+0',
      viewsChange: '+0%',
      valueChange: '+0%'
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Server error',
      message: 'Error fetching user statistics'
    });
  }
});
module.exports = router; 