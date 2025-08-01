const mongoose = require('mongoose');
const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Property title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Property description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  type: {
    type: String,
    required: [true, 'Property type is required'],
    enum: ['house', 'apartment', 'condo', 'townhouse', 'land', 'commercial']
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'pending', 'rented'],
    default: 'available'
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  location: {
    address: {
      type: String,
      required: [true, 'Address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    zipCode: {
      type: String,
      required: [true, 'Zip code is required']
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  details: {
    bedrooms: {
      type: Number,
      min: [0, 'Bedrooms cannot be negative']
    },
    bathrooms: {
      type: Number,
      min: [0, 'Bathrooms cannot be negative']
    },
    squareFeet: {
      type: Number,
      min: [0, 'Square feet cannot be negative']
    },
    lotSize: {
      type: Number,
      min: [0, 'Lot size cannot be negative']
    },
    yearBuilt: {
      type: Number,
      min: [1800, 'Year built must be reasonable']
    },
    parking: {
      type: String,
      enum: ['none', 'street', 'garage', 'carport']
    },
    heating: {
      type: String,
      enum: ['none', 'electric', 'gas', 'oil', 'solar']
    },
    cooling: {
      type: String,
      enum: ['none', 'central', 'window', 'split']
    }
  },
  amenities: [{
    type: String,
    enum: [
      'pool', 'garden', 'balcony', 'fireplace', 'basement', 
      'attic', 'garage', 'parking', 'elevator', 'gym',
      'security', 'air-conditioning', 'heating', 'dishwasher',
      'washer', 'dryer', 'furnished', 'pet-friendly'
    ]
  }],
  images: [{
    url: {
      type: String,
      required: true
    },
    caption: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  views: {
    type: Number,
    default: 0
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priceHistory: [{
    price: Number,
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});
propertySchema.index({
  title: 'text',
  description: 'text',
  'location.city': 'text',
  'location.state': 'text'
});
propertySchema.virtual('pricePerSqFt').get(function() {
  if (this.details.squareFeet && this.details.squareFeet > 0) {
    return Math.round(this.price / this.details.squareFeet);
  }
  return null;
});
propertySchema.set('toJSON', { virtuals: true });
module.exports = mongoose.model('Property', propertySchema); 