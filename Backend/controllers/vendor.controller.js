import Vendor from '../models/Vendor.model.js';
import { sendVendorRegistrationEmail } from '../services/email.service.js';
import { uploadToCloudinary } from '../services/cloudinary.service.js';
import { DOCUMENT_TYPES } from '../utils/constants.js';

// @desc    Register vendor (7-step form submission)
// @route   POST /api/vendors/register
// @access  Public
export const registerVendor = async (req, res, next) => {
  try {
    const {
      pharmacyInfo,
      pharmacyOwner,
      primaryContact,
      pharmacyLicense,
      pharmacyQuestions,
      referralInfo,
      email,
      password
    } = req.body;

    const documents = req.files;

    // Validate all required data is present
    if (!pharmacyInfo || !pharmacyOwner || !primaryContact || !pharmacyLicense || 
        !pharmacyQuestions || !referralInfo || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All registration steps must be completed'
      });
    }

    // Validate documents (must have exactly 7)
    if (!documents || documents.length !== 7) {
      return res.status(400).json({
        success: false,
        message: 'All 7 required documents must be uploaded'
      });
    }

    // Check if vendor already exists
    const existingVendor = await Vendor.findOne({
      $or: [
        { email },
        { 'pharmacyInfo.npiNumber': pharmacyInfo.npiNumber },
        { 'pharmacyInfo.federalEIN': pharmacyInfo.federalEIN },
        { 'pharmacyLicense.deaNumber': pharmacyLicense.deaNumber }
      ]
    });

    if (existingVendor) {
      return res.status(400).json({
        success: false,
        message: 'Vendor with this email, NPI, EIN, or DEA already exists'
      });
    }

    // Upload documents to Cloudinary
    const uploadedDocuments = [];
    
    for (let i = 0; i < documents.length; i++) {
      const file = documents[i];
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: `File ${file.originalname} must be JPEG, PNG, or PDF`
        });
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: `File ${file.originalname} must be less than 5MB`
        });
      }

      const uploadResult = await uploadToCloudinary(file.buffer);
      
      uploadedDocuments.push({
        name: DOCUMENT_TYPES[i] || `Document ${i + 1}`,
        url: uploadResult.url,
        publicId: uploadResult.publicId
      });
    }

    // Create vendor
    const vendor = await Vendor.create({
      pharmacyInfo,
      pharmacyOwner,
      primaryContact,
      pharmacyLicense,
      pharmacyQuestions,
      referralInfo,
      documents: uploadedDocuments,
      email,
      password,
      status: 'pending'
    });

    // Send registration confirmation email
    await sendVendorRegistrationEmail(
      vendor.pharmacyOwner.email,
      `${vendor.pharmacyOwner.firstName} ${vendor.pharmacyOwner.lastName}`
    );

    // Send notification to admin (in production, would be a queue)
    console.log(`New vendor registered: ${vendor.pharmacyInfo.legalBusinessName}`);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please wait for admin approval.',
      data: {
        id: vendor._id,
        status: vendor.status,
        registeredAt: vendor.registeredAt
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get vendor profile
// @route   GET /api/vendors/profile
// @access  Private (Vendor)
export const getVendorProfile = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.user.id)
      .select('-password')
      .populate('approvedBy', 'firstName lastName email');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    res.status(200).json({
      success: true,
      data: vendor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update vendor profile
// @route   PUT /api/vendors/profile
// @access  Private (Vendor)
export const updateVendorProfile = async (req, res, next) => {
  try {
    const { pharmacyInfo, pharmacyOwner, primaryContact, pharmacyQuestions } = req.body;
    
    const updateData = {};
    
    if (pharmacyInfo) updateData.pharmacyInfo = pharmacyInfo;
    if (pharmacyOwner) updateData.pharmacyOwner = pharmacyOwner;
    if (primaryContact) updateData.primaryContact = primaryContact;
    if (pharmacyQuestions) updateData.pharmacyQuestions = pharmacyQuestions;
    
    updateData.profileCompleted = true;

    const vendor = await Vendor.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: vendor
    });
  } catch (error) {
    next(error);
  }
};