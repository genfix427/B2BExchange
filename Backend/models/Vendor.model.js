//vendor model

import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

const pharmacyLicenseSchema = new mongoose.Schema({
  deaNumber: {
    type: String,
    required: [true, 'DEA# is required'],
    unique: true,
    trim: true
  },
  deaExpirationDate: {
    type: Date,
    required: [true, 'DEA expiration date is required']
  },
  stateLicenseNumber: {
    type: String,
    required: [true, 'State license number is required'],
    trim: true
  },
  stateLicenseExpirationDate: {
    type: Date,
    required: [true, 'State license expiration date is required']
  }
});

const documentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Document name is required']
  },
  url: {
    type: String,
    required: [true, 'Document URL is required']
  },
  publicId: {
    type: String,
    required: [true, 'Cloudinary public ID is required']
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const vendorSchema = new mongoose.Schema({
  // Step 1: Pharmacy Information
  pharmacyInfo: {
    npiNumber: {
      type: String,
      required: [true, 'NPI# is required'],
      unique: true,
      trim: true
    },
    legalBusinessName: {
      type: String,
      required: [true, 'Legal business name is required'],
      trim: true
    },
    dba: {
      type: String,
      required: [true, 'DBA is required'],
      trim: true
    },
    shippingAddress: {
      line1: {
        type: String,
        required: [true, 'Shipping address line 1 is required'],
        trim: true
      },
      line2: {
        type: String,
        trim: true
      },
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true
      },
      state: {
        type: String,
        required: [true, 'State is required'],
        enum: [
          'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
          'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
          'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
          'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
          'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
        ]
      },
      zipCode: {
        type: String,
        required: [true, 'Zip code is required'],
        validate: {
          validator: function(v) {
            return /^\d{5}(-\d{4})?$/.test(v);
          },
          message: 'Please enter a valid zip code'
        }
      }
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      validate: {
        validator: function(v) {
          return /^[\+]?[1-9][\d]{0,15}$/.test(v);
        },
        message: 'Please enter a valid phone number'
      }
    },
    fax: {
      type: String,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^[\+]?[1-9][\d]{0,15}$/.test(v);
        },
        message: 'Please enter a valid fax number'
      }
    },
    timezone: {
      type: String,
      required: [true, 'Timezone is required'],
      enum: [
        'America/New_York', 'America/Chicago', 'America/Denver', 
        'America/Los_Angeles', 'America/Anchorage', 'Pacific/Honolulu'
      ]
    },
    federalEIN: {
      type: String,
      required: [true, 'Federal EIN is required'],
      unique: true,
      trim: true
    },
    stateTaxID: {
      type: String,
      required: [true, 'State Tax ID is required'],
      trim: true
    },
    gln: {
      type: String,
      required: [true, 'GLN is required'],
      trim: true
    },
    mailingAddress: {
      line1: {
        type: String,
        required: [true, 'Mailing address line 1 is required'],
        trim: true
      },
      line2: {
        type: String,
        trim: true
      },
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true
      },
      state: {
        type: String,
        required: [true, 'State is required'],
        enum: [
          'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
          'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
          'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
          'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
          'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
        ]
      },
      zipCode: {
        type: String,
        required: [true, 'Zip code is required'],
        validate: {
          validator: function(v) {
            return /^\d{5}(-\d{4})?$/.test(v);
          },
          message: 'Please enter a valid zip code'
        }
      },
      isSameAsShipping: {
        type: Boolean,
        default: false
      }
    }
  },

  // Step 2: Pharmacy Owner
  pharmacyOwner: {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      validate: {
        validator: function(v) {
          return /^[\+]?[1-9][\d]{0,15}$/.test(v);
        },
        message: 'Please enter a valid mobile number'
      }
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please enter a valid email']
    }
  },

  // Step 3: Primary Contact
  primaryContact: {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      validate: {
        validator: function(v) {
          return /^[\+]?[1-9][\d]{0,15}$/.test(v);
        },
        message: 'Please enter a valid mobile number'
      }
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      validate: [validator.isEmail, 'Please enter a valid email']
    }
  },

  // Step 4: Pharmacy License (embedded schema)
  pharmacyLicense: {
    type: pharmacyLicenseSchema,
    required: [true, 'Pharmacy license information is required']
  },

  // Step 5: Pharmacy Questions
  pharmacyQuestions: {
    enterpriseType: {
      type: String,
      required: [true, 'Enterprise type is required'],
      enum: ['Independent', 'Chain', 'Hospital', 'Clinic', 'Other']
    },
    primaryWholesaler: {
      type: String,
      required: [true, 'Primary wholesaler is required'],
      trim: true
    },
    secondaryWholesaler: {
      type: String,
      trim: true
    },
    pharmacyType: {
      type: String,
      required: [true, 'Type of pharmacy is required'],
      enum: ['Retail', 'Specialty', 'Compounding', 'Long-term Care', 'Mail Order']
    },
    pharmacySoftware: {
      type: String,
      required: [true, 'Pharmacy software is required'],
      trim: true
    },
    hoursOfOperation: {
      type: String,
      required: [true, 'Hours of operation are required'],
      trim: true
    },
    numberOfLocations: {
      type: Number,
      required: [true, 'Number of locations is required'],
      min: [1, 'Must have at least 1 location']
    }
  },

  // Step 6: Referral Information
  referralInfo: {
    promoCode: {
      type: String,
      trim: true
    },
    referralSource: {
      type: String,
      required: [true, 'Referral source is required'],
      enum: ['Search Engine', 'Social Media', 'Referral', 'Trade Show', 'Advertisement', 'Other']
    },
    termsAccepted: {
      type: Boolean,
      required: [true, 'Terms & Conditions must be accepted'],
      validate: {
        validator: function(v) {
          return v === true;
        },
        message: 'You must accept the Terms & Conditions'
      }
    },
    acceptedAt: {
      type: Date,
      default: Date.now
    }
  },

  // Step 7: Documents
  documents: {
    type: [documentSchema],
    validate: {
      validator: function(v) {
        return v.length === 7;
      },
      message: 'All 7 required documents must be uploaded'
    }
  },

  // Authentication & Status
  email: {
    type: String,
    required: [true, 'Login email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  approvedAt: Date,
  rejectionReason: String,
  
  // Timestamps
  registeredAt: {
    type: Date,
    default: Date.now
  },
  lastLoginAt: Date,
  
  // Profile updates
  profileCompleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
vendorSchema.index({ email: 1 });
vendorSchema.index({ status: 1 });
vendorSchema.index({ 'pharmacyInfo.npiNumber': 1 });
vendorSchema.index({ 'pharmacyLicense.deaNumber': 1 });
vendorSchema.index({ registeredAt: -1 });

// Hash password before saving
vendorSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return "";
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    // next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
vendorSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if vendor is approved
vendorSchema.methods.isApproved = function() {
  return this.status === 'approved';
};

// Virtual for full name
vendorSchema.virtual('pharmacyOwner.fullName').get(function() {
  return `${this.pharmacyOwner.firstName} ${this.pharmacyOwner.lastName}`;
});

const Vendor = mongoose.model('Vendor', vendorSchema);

export default Vendor;