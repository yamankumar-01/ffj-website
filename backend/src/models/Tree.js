import mongoose from 'mongoose';

const treeSchema = new mongoose.Schema(
  {
    treeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
      uppercase: true,
    },
    commonName: {
      type: String,
      required: [true, 'Common name is required'],
      trim: true,
    },
    scientificName: {
      type: String,
      required: [true, 'Scientific botanical name is required'],
      trim: true,
    },
    localName: {
      type: String,
      required: [true, 'Local Hindi name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Fruit', 'Medicinal', 'Ornamental', 'Shade'],
      default: 'Fruit',
      index: true,
    },
    photos: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    healthBenefits: {
      type: String,
      default: '',
    },
    culturalSignificance: {
      type: String,
      default: '',
    },
    plantedDate: {
      type: Date,
      default: Date.now,
    },
    plantedBy: {
      type: String,
      default: 'Fruitfull Jaipur Initiative (JECRC)',
      trim: true,
    },
    location: {
      zone: {
        type: String,
        required: [true, 'Campus zone is required'],
        trim: true,
        index: true,
      },
      latitude: {
        type: Number,
        default: 26.78198, // JECRC Jaipur default latitude
      },
      longitude: {
        type: Number,
        default: 75.82251, // JECRC Jaipur default longitude
      },
    },
    healthStatus: {
      type: String,
      enum: ['Healthy', 'Needs Attention', 'Under Treatment'],
      default: 'Healthy',
      index: true,
    },
    lastCheckupDate: {
      type: Date,
      default: Date.now,
    },
    height: {
      type: Number, // in meters
      default: null,
    },
    girth: {
      type: Number, // in cm
      default: null,
    },
    caretakerName: {
      type: String,
      default: 'JECRC Green Team',
      trim: true,
    },
    qrCodeData: {
      type: String, // Base64 data URL for fast client rendering
      default: '',
    },
    qrTargetUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for human-readable age calculation
treeSchema.virtual('age').get(function () {
  if (!this.plantedDate) return 'Age unknown';
  const now = new Date();
  const planted = new Date(this.plantedDate);
  const diffMonths = (now.getFullYear() - planted.getFullYear()) * 12 + (now.getMonth() - planted.getMonth());

  if (diffMonths <= 0) {
    const diffDays = Math.floor((now - planted) / (1000 * 60 * 60 * 24));
    return `${Math.max(1, diffDays)} days old`;
  }
  const years = Math.floor(diffMonths / 12);
  const months = diffMonths % 12;

  if (years === 0) {
    return `${months} month${months > 1 ? 's' : ''} old`;
  }
  if (months === 0) {
    return `${years} year${years > 1 ? 's' : ''} old`;
  }
  return `${years} yr${years > 1 ? 's' : ''} ${months} mo${months > 1 ? 's' : ''}`;
});

// Text indexing for comprehensive multi-field search
treeSchema.index({
  treeId: 'text',
  commonName: 'text',
  scientificName: 'text',
  localName: 'text',
  description: 'text',
  plantedBy: 'text',
  'location.zone': 'text',
});

export const Tree = mongoose.model('Tree', treeSchema);
