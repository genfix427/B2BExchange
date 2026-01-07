import validator from 'validator';

export const validateRegistration = (req, res, next) => {
  const { email, password } = req.body;

  // Validate email
  if (!validator.isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email'
    });
  }

  // Validate password
  if (!password || password.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters'
    });
  }

  // Validate NPI number (10 digits)
  if (req.body.pharmacyInfo?.npiNumber && !/^\d{10}$/.test(req.body.pharmacyInfo.npiNumber)) {
    return res.status(400).json({
      success: false,
      message: 'NPI# must be 10 digits'
    });
  }

  // Validate EIN (XX-XXXXXXX format)
  if (req.body.pharmacyInfo?.federalEIN && !/^\d{2}-\d{7}$/.test(req.body.pharmacyInfo.federalEIN)) {
    return res.status(400).json({
      success: false,
      message: 'Federal EIN must be in format XX-XXXXXXX'
    });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password'
    });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email'
    });
  }

  next();
};