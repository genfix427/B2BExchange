import Vendor from '../models/Vendor.model.js';
import { sendVendorRegistrationEmail } from '../services/email.service.js';
import { uploadToCloudinary } from '../services/cloudinary.service.js';
import { DOCUMENT_TYPES } from '../utils/constants.js';

// @desc    Register vendor (8-step form submission)
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
    const bankAccount = req.body.bankAccount ? JSON.parse(req.body.bankAccount) : null;
    const { email, password } = req.body;

    const documents = req.files || [];

    console.log('Parsed data:', {
      email: email ? 'present' : 'missing',
      password: password ? 'present' : 'missing',
      pharmacyInfo: pharmacyInfo ? 'present' : 'missing',
      bankAccount: bankAccount ? 'present' : 'missing',
      documentsCount: documents.length
    });

    // Validate all required data is present (now 8 steps)
    if (!pharmacyInfo || !pharmacyOwner || !primaryContact || !pharmacyLicense || 
        !pharmacyQuestions || !referralInfo || !bankAccount || !email || !password) {
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
      bankAccount, // Added bank account details
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

// @desc    Get vendor profile
// @route   GET /api/vendors/profile
// @access  Private (Vendor)
export const getVendorProfile = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.user.id)
      .select('-password -bankAccount.accountNumber -bankAccount.routingNumber')
      .populate('approvedBy', 'firstName lastName email');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    const vendorData = vendor.toObject();

    if (vendorData.bankAccount) {
      vendorData.bankAccount = {
        accountHolderName: vendorData.bankAccount.accountHolderName,
        bankName: vendorData.bankAccount.bankName,
        accountType: vendorData.bankAccount.accountType,

        // ✅ dynamically masked
        maskedAccountNumber: vendor.bankAccount.accountNumber
          ? `****${vendor.bankAccount.accountNumber.slice(-4)}`
          : null,

        maskedRoutingNumber: vendor.bankAccount.routingNumber
          ? `****${vendor.bankAccount.routingNumber.slice(-4)}`
          : null,

        bankAddress: vendorData.bankAccount.bankAddress,
        bankPhone: vendorData.bankAccount.bankPhone,
        achAuthorization: vendorData.bankAccount.achAuthorization,
        authorizationDate: vendorData.bankAccount.authorizationDate
      };
    }

    res.status(200).json({
      success: true,
      data: vendorData
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Update vendor profile (including bank account)
// @route   PUT /api/vendors/profile
// @access  Private (Vendor)
export const updateVendorProfile = async (req, res, next) => {
  try {
    const { pharmacyInfo, pharmacyOwner, primaryContact, pharmacyQuestions, bankAccount } = req.body;
    
    const updateData = {};
    
    if (pharmacyInfo) updateData.pharmacyInfo = pharmacyInfo;
    if (pharmacyOwner) updateData.pharmacyOwner = pharmacyOwner;
    if (primaryContact) updateData.primaryContact = primaryContact;
    if (pharmacyQuestions) updateData.pharmacyQuestions = pharmacyQuestions;
    if (bankAccount) updateData.bankAccount = bankAccount;
    
    updateData.profileCompleted = true;

    const vendor = await Vendor.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -bankAccount.accountNumber -bankAccount.confirmationAccountNumber -bankAccount.routingNumber');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: vendor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update vendor bank account details
// @route   PUT /api/vendors/bank-account
// @access  Private (Vendor)
export const updateBankAccount = async (req, res, next) => {
  try {
    const { bankAccount } = req.body;

    if (!bankAccount) {
      return res.status(400).json({
        success: false,
        message: 'Bank account details are required'
      });
    }

    const vendor = await Vendor.findByIdAndUpdate(
      req.user.id,
      { bankAccount },
      { new: true, runValidators: true }
    ).select('-password -bankAccount.accountNumber -bankAccount.confirmationAccountNumber -bankAccount.routingNumber');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Bank account updated successfully',
      data: {
        bankAccount: {
          accountHolderName: vendor.bankAccount.accountHolderName,
          bankName: vendor.bankAccount.bankName,
          accountType: vendor.bankAccount.accountType,
          maskedAccountNumber: vendor.bankAccount.maskedAccountNumber,
          maskedRoutingNumber: vendor.bankAccount.maskedRoutingNumber,
          bankAddress: vendor.bankAccount.bankAddress,
          bankPhone: vendor.bankAccount.bankPhone,
          achAuthorization: vendor.bankAccount.achAuthorization,
          authorizationDate: vendor.bankAccount.authorizationDate
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get vendor bank account details (masked for security)
// @route   GET /api/vendors/bank-account
// @access  Private (Vendor)
export const getBankAccount = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.user.id)
      .select('bankAccount');

    if (!vendor || !vendor.bankAccount) {
      return res.status(404).json({
        success: false,
        message: 'Bank account not found'
      });
    }

    // Return masked account details for security
    res.status(200).json({
      success: true,
      data: {
        bankAccount: {
          accountHolderName: vendor.bankAccount.accountHolderName,
          bankName: vendor.bankAccount.bankName,
          accountType: vendor.bankAccount.accountType,
          maskedAccountNumber: vendor.bankAccount.maskedAccountNumber,
          maskedRoutingNumber: vendor.bankAccount.maskedRoutingNumber,
          bankAddress: vendor.bankAccount.bankAddress,
          bankPhone: vendor.bankAccount.bankPhone,
          achAuthorization: vendor.bankAccount.achAuthorization,
          authorizationDate: vendor.bankAccount.authorizationDate
        }
      }
    });
  } catch (error) {
    next(error);
  }
};