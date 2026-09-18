import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Tree = sequelize.define(
  'Tree',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    treeId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    commonName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    scientificName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    localName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      defaultValue: 'Fruit',
    },
    photos: {
      type: DataTypes.TEXT,
      defaultValue: '[]',
      get() {
        const rawValue = this.getDataValue('photos');
        if (!rawValue) return [];
        try {
          return JSON.parse(rawValue);
        } catch {
          return [];
        }
      },
      set(val) {
        if (Array.isArray(val)) {
          this.setDataValue('photos', JSON.stringify(val));
        } else if (typeof val === 'string') {
          try {
            JSON.parse(val);
            this.setDataValue('photos', val);
          } catch {
            this.setDataValue('photos', JSON.stringify([val]));
          }
        } else {
          this.setDataValue('photos', '[]');
        }
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    healthBenefits: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    culturalSignificance: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    plantedDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    plantedBy: {
      type: DataTypes.STRING,
      defaultValue: 'Fruitfull Jaipur Initiative (JECRC)',
    },
    zone: {
      type: DataTypes.STRING,
      defaultValue: 'Block A - Central Lawn',
    },
    latitude: {
      type: DataTypes.FLOAT,
      defaultValue: 26.78198,
    },
    longitude: {
      type: DataTypes.FLOAT,
      defaultValue: 75.82251,
    },
    healthStatus: {
      type: DataTypes.STRING,
      defaultValue: 'Healthy',
    },
    lastCheckupDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    height: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    girth: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    caretakerName: {
      type: DataTypes.STRING,
      defaultValue: 'JECRC Green Team',
    },
    qrCodeData: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    qrTargetUrl: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
  },
  {
    tableName: 'trees',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['treeId'] },
      { fields: ['category'] },
      { fields: ['zone'] },
      { fields: ['healthStatus'] },
    ],
  }
);

// Helper for human-readable age calculation
export const calculateAge = (plantedDate) => {
  if (!plantedDate) return 'Age unknown';
  const now = new Date();
  const planted = new Date(plantedDate);
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
};

// Format tree output to match expected frontend structure (including location object and age)
Tree.prototype.toFormattedJSON = function () {
  const json = this.toJSON();
  json.age = calculateAge(this.plantedDate);
  json.location = {
    zone: this.zone,
    latitude: this.latitude,
    longitude: this.longitude,
  };
  return json;
};
