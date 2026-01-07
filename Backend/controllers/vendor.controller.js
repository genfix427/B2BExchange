import Vendor from '../models/Vendor.model.js';
import { sendVendorRegistrationEmail } from '../services/email.service.js';
import { uploadToCloudinary } from '../services/cloudinary.service.js';
import { DOCUMENT_TYPES } from '../utils/constants.js';

// @desc    Register vendor (7-step form submission)
// @route   POST /api/vendors/register
// @access  Public
export const registerVendor = async (req, res, next) => {
  console.log('registerVendor controller called');
  console.log('Files received:', req.files?.length || 0);
  
  try {
    // Parse JSON data from form fields
    const pharmacyInfo = req.body.pharmacyInfo ? JSON.parse(req.body.pharmacyInfo) : null;
    const pharmacyOwner = req.body.pharmacyOwner ? JSON.parse(req.body.pharmacyOwner) : null;
    const primaryContact = req.body.primaryContact ? JSON.parse(req.body.primaryContact) : null;
    const pharmacyLicense = req.body.pharmacyLicense ? JSON.parse(req.body.pharmacyLicense) : null;
    const pharmacyQuestions = req.body.pharmacyQuestions ? JSON.parse(req.body.pharmacyQuestions) : null;
    const referralInfo = req.body.referralInfo ? JSON.parse(req.body.referralInfo) : null;
    const { email, password } = req.body;

    const documents = req.files || [];

    console.log('Parsed data:', {
      email: email ? 'present' : 'missing',
      password: password ? 'present' : 'missing',
      pharmacyInfo: pharmacyInfo ? 'present' : 'missing',
      documentsCount: documents.length
    });

    // Validate all required data is present
    if (!pharmacyInfo || !pharmacyOwner || !primaryContact || !pharmacyLicense || 
        !pharmacyQuestions || !referralInfo || !email || !password) {
      console.log('Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'All registration steps must be completed'
      });
    }

    // Validate documents (must have exactly 7)
    if (!documents || documents.length !== 7) {
      console.log('Invalid document count:', documents.length);
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
      console.log('Duplicate vendor found');
      return res.status(400).json({
        success: false,
        message: 'Vendor with this email, NPI, EIN, or DEA already exists'
      });
    }

    console.log('Uploading documents to Cloudinary...');
    
    // Upload documents to Cloudinary
    const uploadedDocuments = [];
    
    for (let i = 0; i < documents.length; i++) {
      const file = documents[i];
      
      console.log(`Processing document ${i + 1}:`, file.originalname, file.mimetype, file.size);

      try {
        const uploadResult = await uploadToCloudinary(file.buffer);
        
        uploadedDocuments.push({
          name: DOCUMENT_TYPES[i] || `Document ${i + 1}`,
          url: uploadResult.url,
          publicId: uploadResult.publicId
        });
        
        console.log(`Document ${i + 1} uploaded successfully`);
      } catch (uploadError) {
        console.error(`Failed to upload document ${i + 1}:`, uploadError);
        throw new Error(`Failed to upload document: ${file.originalname}`);
      }
    }

    console.log('Creating vendor in database...');
    
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

    console.log('Vendor created:', vendor._id);

    // Send registration confirmation email
    try {
      await sendVendorRegistrationEmail(
        vendor.pharmacyOwner.email,
        `${vendor.pharmacyOwner.firstName} ${vendor.pharmacyOwner.lastName}`
      );
      console.log('Registration email sent');
    } catch (emailError) {
      console.error('Failed to send registration email:', emailError);
      // Don't fail registration if email fails
    }

    // Send notification to admin
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
    console.error('Registration error:', error);
    next(error);
  }
};

// ... rest of the controller code remains the same

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