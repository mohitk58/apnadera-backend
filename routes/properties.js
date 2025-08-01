const express = require('express');
const { body, validationResult, query } = require('express-validator');
const multer = require('multer');
const Property = require('../models/Property');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, 
    files: 10 
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be positive'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be positive'),
  query('type').optional().isIn(['house', 'apartment', 'condo', 'townhouse', 'land', 'commercial']),
  query('status').optional().isIn(['available', 'sold', 'pending', 'rented']),
  query('city').optional().trim(),
  query('state').optional().trim(),
  query('bedrooms').optional().isInt({ min: 0 }),
  query('bathrooms').optional().isInt({ min: 0 }),
  query('featured').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const filter = { isActive: true };
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { 'location.city': { $regex: req.query.search, $options: 'i' } },
        { 'location.state': { $regex: req.query.search, $options: 'i' } },
        { 'location.address': { $regex: req.query.search, $options: 'i' } }
      ];
    }
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
    }
    if (req.query.type) filter.type = req.query.type;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.city) filter['location.city'] = new RegExp(req.query.city, 'i');
    if (req.query.state) filter['location.state'] = new RegExp(req.query.state, 'i');
    if (req.query.bedrooms) filter['details.bedrooms'] = { $gte: parseInt(req.query.bedrooms) };
    if (req.query.bathrooms) filter['details.bathrooms'] = { $gte: parseInt(req.query.bathrooms) };
    if (req.query.featured === 'true') filter.isFeatured = true;
    const sort = {};
    if (req.query.sortBy) {
      const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
      sort[req.query.sortBy] = sortOrder;
    } else {
      sort.createdAt = -1; 
    }
    const properties = await Property.find(filter)
      .populate('owner', 'name email phone')
      .populate('agent', 'name email phone')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    const total = await Property.countDocuments(filter);
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
      message: 'Error fetching properties'
    });
  }
});
router.get('/search', [
  query('q').trim().notEmpty().withMessage('Search query is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const searchResults = await Property.find({
      $and: [
        { isActive: true },
        {
          $or: [
            { title: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } },
            { 'location.city': { $regex: q, $options: 'i' } },
            { 'location.state': { $regex: q, $options: 'i' } },
            { 'location.address': { $regex: q, $options: 'i' } }
          ]
        }
      ]
    })
    .populate('owner', 'name email phone')
    .populate('agent', 'name email phone')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
    const total = await Property.countDocuments({
      $and: [
        { isActive: true },
        {
          $or: [
            { title: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } },
            { 'location.city': { $regex: q, $options: 'i' } },
            { 'location.state': { $regex: q, $options: 'i' } },
            { 'location.address': { $regex: q, $options: 'i' } }
          ]
        }
      ]
    });
    const totalPages = Math.ceil(total / limit);
    res.json({
      properties: searchResults,
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
      message: 'Error searching properties'
    });
  }
});
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('owner', 'name email phone avatar')
      .populate('agent', 'name email phone avatar');
    if (!property) {
      return res.status(404).json({ 
        error: 'Property not found',
        message: 'The requested property does not exist'
      });
    }
    if (!property.isActive) {
      return res.status(404).json({ 
        error: 'Property not available',
        message: 'This property is no longer available'
      });
    }
    property.views += 1;
    await property.save();
    res.json(property);
  } catch (error) {
    res.status(500).json({ 
      error: 'Server error',
      message: 'Error fetching property'
    });
  }
});
router.post('/', protect, authorize('seller', 'agent', 'admin'), upload.array('images', 10), [
  body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('description').trim().isLength({ min: 20, max: 2000 }).withMessage('Description must be between 20 and 2000 characters'),
  body('type').isIn(['house', 'apartment', 'condo', 'townhouse', 'land', 'commercial']).withMessage('Invalid property type'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be positive'),
  body('location.address').trim().notEmpty().withMessage('Address is required'),
  body('location.city').trim().notEmpty().withMessage('City is required'),
  body('location.state').trim().notEmpty().withMessage('State is required'),
  body('location.zipCode').trim().notEmpty().withMessage('Zip code is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }
    const propertyData = {
      title: req.body.title,
      description: req.body.description,
      type: req.body.type,
      price: parseFloat(req.body.price),
      status: req.body.status,
      location: {
        address: req.body.location.address,
        city: req.body.location.city,
        state: req.body.location.state,
        zipCode: req.body.location.zipCode,
        country: req.body.location.country
      },
      details: {
        bedrooms: parseInt(req.body.details.bedrooms),
        bathrooms: parseInt(req.body.details.bathrooms),
        squareFeet: parseInt(req.body.details.sqft),
        yearBuilt: parseInt(req.body.details.yearBuilt)
      },
      amenities: req.body.amenities || [],
      owner: req.user._id
    };
    if (req.user.role === 'agent') {
      propertyData.agent = req.user._id;
    }
    if (req.files && req.files.length > 0) {
      propertyData.images = req.files.map((file, index) => ({
        url: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        caption: `Image ${index + 1}`,
        isPrimary: index === 0
      }));
    }
    const property = await Property.create(propertyData);
    const populatedProperty = await Property.findById(property._id)
      .populate('owner', 'name email phone')
      .populate('agent', 'name email phone');
    res.status(201).json(populatedProperty);
  } catch (error) {
    res.status(500).json({ 
      error: 'Server error',
      message: 'Error creating property'
    });
  }
});
router.put('/:id', protect, upload.array('images', 10), [
  body('title').optional().trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('description').optional().trim().isLength({ min: 20, max: 2000 }).withMessage('Description must be between 20 and 2000 characters'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be positive')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ 
        error: 'Property not found',
        message: 'The requested property does not exist'
      });
    }
    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'You can only update your own properties'
      });
    }
    const updateData = { ...req.body };
    if (req.body['location[address]']) {
      updateData.location = {
        address: req.body['location[address]'],
        city: req.body['location[city]'],
        state: req.body['location[state]'],
        zipCode: req.body['location[zipCode]'],
        country: req.body['location[country]']
      };
      delete updateData['location[address]'];
      delete updateData['location[city]'];
      delete updateData['location[state]'];
      delete updateData['location[zipCode]'];
      delete updateData['location[country]'];
    }
    if (req.body['details[bedrooms]']) {
      updateData.details = {
        bedrooms: parseInt(req.body['details[bedrooms]']),
        bathrooms: parseInt(req.body['details[bathrooms]']),
        squareFeet: parseInt(req.body['details[sqft]']),
        yearBuilt: parseInt(req.body['details[yearBuilt]'])
      };
      delete updateData['details[bedrooms]'];
      delete updateData['details[bathrooms]'];
      delete updateData['details[sqft]'];
      delete updateData['details[yearBuilt]'];
    }
    if (req.body['amenities[]']) {
      updateData.amenities = Array.isArray(req.body['amenities[]']) 
        ? req.body['amenities[]'] 
        : [req.body['amenities[]']];
      delete updateData['amenities[]'];
    }
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file, index) => ({
        url: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        caption: `Image ${index + 1}`,
        isPrimary: false
      }));
      updateData.images = [...(property.images || []), ...newImages];
    }
    if (req.body.price && req.body.price !== property.price) {
      updateData.priceHistory = [
        ...(property.priceHistory || []),
        {
          price: property.price,
          date: new Date()
        }
      ];
    }
    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('owner', 'name email phone').populate('agent', 'name email phone');
    res.json(updatedProperty);
  } catch (error) {
    res.status(500).json({ 
      error: 'Server error',
      message: 'Error updating property'
    });
  }
});
router.delete('/:id', protect, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ 
        error: 'Property not found',
        message: 'The requested property does not exist'
      });
    }
    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'You can only delete your own properties'
      });
    }
    await Property.findByIdAndDelete(req.params.id);
    res.json({ 
      message: 'Property deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Server error',
      message: 'Error deleting property'
    });
  }
});
router.post('/:id/favorite', protect, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ 
        error: 'Property not found',
        message: 'The requested property does not exist'
      });
    }
    const user = await User.findById(req.user._id);
    const isFavorited = user.favorites.some(favId => favId.toString() === property._id.toString());
    if (isFavorited) {
      user.favorites = user.favorites.filter(id => id.toString() !== property._id.toString());
      property.favorites = property.favorites.filter(id => id.toString() !== user._id.toString());
    } else {
      user.favorites.push(property._id);
      property.favorites.push(user._id);
    }
    await user.save();
    await property.save();
    res.json({ 
      message: isFavorited ? 'Removed from favorites' : 'Added to favorites',
      isFavorited: !isFavorited
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Server error',
      message: 'Error updating favorites'
    });
  }
});
module.exports = router; 