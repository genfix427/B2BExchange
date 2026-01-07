import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function createAdmin() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/your_database';
    console.log('Connecting to MongoDB...');
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Hash the password
    const password = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    console.log('\n🔑 Password Details:');
    console.log('   Password:', password);
    console.log('   Hashed password:', hashedPassword);
    console.log('   Hash prefix:', hashedPassword.substring(0, 7));
    
    // Define Admin Schema
    const adminSchema = new mongoose.Schema({
      firstName: String,
      lastName: String,
      email: {
        type: String,
        unique: true,
        lowercase: true
      },
      password: String,
      role: {
        type: String,
        enum: ['super_admin', 'admin', 'moderator'],
        default: 'admin'
      },
      isActive: {
        type: Boolean,
        default: true
      },
      permissions: {
        canApproveVendors: Boolean,
        canManageAdmins: Boolean,
        canViewAnalytics: Boolean,
        canManageSettings: Boolean,
        canSuspendVendors: Boolean
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      updatedAt: {
        type: Date,
        default: Date.now
      }
    });
    
    const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);
    
    // Create admin document
    const adminData = {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      permissions: {
        canApproveVendors: true,
        canManageAdmins: false,
        canViewAnalytics: true,
        canManageSettings: true,
        canSuspendVendors: true
      }
    };
    
    console.log('\n📝 Creating admin...');
    
    // Delete if exists
    const deleted = await Admin.deleteOne({ email: 'admin@example.com' });
    if (deleted.deletedCount > 0) {
      console.log('   Removed existing admin with same email');
    }
    
    // Create new admin
    const admin = await Admin.create(adminData);
    
    console.log('\n✅ Admin created successfully!');
    console.log('\n📋 Admin Details:');
    console.log('   ID:', admin._id.toString());
    console.log('   Email:', admin.email);
    console.log('   Name:', `${admin.firstName} ${admin.lastName}`);
    console.log('   Role:', admin.role);
    console.log('   Status:', admin.isActive ? 'Active' : 'Inactive');
    console.log('\n🔐 Login Credentials:');
    console.log('   Email: admin@example.com');
    console.log('   Password: admin123');
    
    // Verify the password works
    console.log('\n🔍 Verifying password...');
    const isMatch = await bcrypt.compare('admin123', admin.password);
    console.log('   Password verification:', isMatch ? '✅ Success' : '❌ Failed');
    
    // List all admins
    const allAdmins = await Admin.find({}, 'email firstName lastName role isActive');
    console.log('\n👥 All Admins in Database:');
    allAdmins.forEach((a, i) => {
      console.log(`   ${i + 1}. ${a.email} - ${a.firstName} ${a.lastName} (${a.role})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.code === 11000) {
      console.error('   Duplicate email error. Admin already exists.');
    }
    
    process.exit(1);
  }
}

// Run the function
createAdmin();