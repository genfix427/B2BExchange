import AdminActivity from '../models/AdminActivity.model.js';

/**
 * Log an admin activity.
 * This NEVER throws — logging must not break the main flow.
 */
const logActivity = async ({
  admin,        // req.admin object
  action,       // enum string
  actionCategory,
  description,
  target = {},  // { type, id, name, email }
  details = {}, // any extra metadata
  req = null    // express req for IP
}) => {
  try {
    const activity = new AdminActivity({
      admin: admin._id,
      adminName: `${admin.firstName} ${admin.lastName}`,
      adminEmail: admin.email,
      action,
      actionCategory,
      description,
      target,
      details,
      ipAddress: req
        ? req.headers['x-forwarded-for'] || req.connection?.remoteAddress || ''
        : ''
    });

    await activity.save();
    console.log(`📝 Activity logged: [${action}] by ${admin.email}`);
  } catch (error) {
    console.error('⚠️ Failed to log admin activity:', error.message);
    // Swallow the error so it never breaks the caller
  }
};

// ----- convenience wrappers -----

export const logVendorApproved = (admin, vendor, req) =>
  logActivity({
    admin,
    action: 'vendor_approved',
    actionCategory: 'vendor',
    description: `Approved vendor "${vendor.pharmacyInfo?.legalBusinessName || 'Unknown'}"`,
    target: {
      type: 'vendor',
      id: vendor._id,
      name: vendor.pharmacyInfo?.legalBusinessName || vendor.pharmacyInfo?.dba || 'Unknown',
      email: vendor.pharmacyOwner?.email || vendor.email
    },
    details: {
      vendorBusinessName: vendor.pharmacyInfo?.legalBusinessName,
      vendorDba: vendor.pharmacyInfo?.dba,
      vendorEmail: vendor.pharmacyOwner?.email || vendor.email,
      vendorPhone: vendor.pharmacyOwner?.mobile,
      npiNumber: vendor.pharmacyInfo?.npiNumber,
      approvedAt: new Date()
    },
    req
  });

export const logVendorRejected = (admin, vendor, rejectionReason, req) =>
  logActivity({
    admin,
    action: 'vendor_rejected',
    actionCategory: 'vendor',
    description: `Rejected vendor "${vendor.pharmacyInfo?.legalBusinessName || 'Unknown'}"`,
    target: {
      type: 'vendor',
      id: vendor._id,
      name: vendor.pharmacyInfo?.legalBusinessName || vendor.pharmacyInfo?.dba || 'Unknown',
      email: vendor.pharmacyOwner?.email || vendor.email
    },
    details: {
      vendorBusinessName: vendor.pharmacyInfo?.legalBusinessName,
      vendorDba: vendor.pharmacyInfo?.dba,
      vendorEmail: vendor.pharmacyOwner?.email || vendor.email,
      rejectionReason,
      rejectedAt: new Date()
    },
    req
  });

export const logVendorSuspended = (admin, vendor, reason, previousStatus, req) =>
  logActivity({
    admin,
    action: 'vendor_suspended',
    actionCategory: 'vendor',
    description: `Suspended vendor "${vendor.pharmacyInfo?.legalBusinessName || 'Unknown'}"`,
    target: {
      type: 'vendor',
      id: vendor._id,
      name: vendor.pharmacyInfo?.legalBusinessName || vendor.pharmacyInfo?.dba || 'Unknown',
      email: vendor.pharmacyOwner?.email || vendor.email
    },
    details: {
      vendorBusinessName: vendor.pharmacyInfo?.legalBusinessName,
      vendorEmail: vendor.pharmacyOwner?.email || vendor.email,
      suspensionReason: reason,
      previousStatus,
      suspendedAt: new Date()
    },
    req
  });

export const logVendorReactivated = (admin, vendor, newStatus, req) =>
  logActivity({
    admin,
    action: 'vendor_reactivated',
    actionCategory: 'vendor',
    description: `Reactivated vendor "${vendor.pharmacyInfo?.legalBusinessName || 'Unknown'}"`,
    target: {
      type: 'vendor',
      id: vendor._id,
      name: vendor.pharmacyInfo?.legalBusinessName || vendor.pharmacyInfo?.dba || 'Unknown',
      email: vendor.pharmacyOwner?.email || vendor.email
    },
    details: {
      vendorBusinessName: vendor.pharmacyInfo?.legalBusinessName,
      vendorEmail: vendor.pharmacyOwner?.email || vendor.email,
      newStatus,
      reactivatedAt: new Date()
    },
    req
  });

export const logProductUpdated = (admin, product, vendorInfo, changes, req) =>
  logActivity({
    admin,
    action: 'product_updated',
    actionCategory: 'product',
    description: `Updated product "${product.productName}" (NDC: ${product.ndcNumber})`,
    target: {
      type: 'product',
      id: product._id,
      name: product.productName
    },
    details: {
      productName: product.productName,
      ndcNumber: product.ndcNumber,
      vendorId: vendorInfo?.id || product.vendor,
      vendorName: vendorInfo?.name || 'Unknown',
      changes,
      updatedAt: new Date()
    },
    req
  });

export const logProductDeleted = (admin, product, vendorInfo, req) =>
  logActivity({
    admin,
    action: 'product_deleted',
    actionCategory: 'product',
    description: `Deleted product "${product.productName}" (NDC: ${product.ndcNumber})`,
    target: {
      type: 'product',
      id: product._id,
      name: product.productName
    },
    details: {
      productName: product.productName,
      ndcNumber: product.ndcNumber,
      manufacturer: product.manufacturer,
      price: product.price,
      quantityInStock: product.quantityInStock,
      vendorId: vendorInfo?.id || product.vendor,
      vendorName: vendorInfo?.name || 'Unknown',
      deletedAt: new Date()
    },
    req
  });

export const logOrderStatusUpdated = (admin, order, oldStatus, newStatus, note, req) =>
  logActivity({
    admin,
    action: 'order_status_updated',
    actionCategory: 'order',
    description: `Updated order #${order.orderNumber} status from "${oldStatus}" to "${newStatus}"`,
    target: {
      type: 'order',
      id: order._id,
      name: order.orderNumber
    },
    details: {
      orderNumber: order.orderNumber,
      oldStatus,
      newStatus,
      note,
      customerName: order.customerName,
      orderTotal: order.total,
      updatedAt: new Date()
    },
    req
  });

export const logVendorOrderStatusUpdated = (admin, order, vendorId, status, trackingNumber, req) =>
  logActivity({
    admin,
    action: 'vendor_order_status_updated',
    actionCategory: 'order',
    description: `Updated vendor order status in order #${order.orderNumber} to "${status}"`,
    target: {
      type: 'order',
      id: order._id,
      name: order.orderNumber
    },
    details: {
      orderNumber: order.orderNumber,
      vendorId,
      newStatus: status,
      trackingNumber: trackingNumber || null,
      updatedAt: new Date()
    },
    req
  });

export const logAdminProfileUpdated = (admin, updatedFields, req) =>
  logActivity({
    admin,
    action: 'admin_profile_updated',
    actionCategory: 'admin',
    description: `Updated own profile`,
    target: {
      type: 'admin',
      id: admin._id,
      name: `${admin.firstName} ${admin.lastName}`,
      email: admin.email
    },
    details: {
      updatedFields,
      updatedAt: new Date()
    },
    req
  });

export default {
  logActivity,
  logVendorApproved,
  logVendorRejected,
  logVendorSuspended,
  logVendorReactivated,
  logProductUpdated,
  logProductDeleted,
  logOrderStatusUpdated,
  logVendorOrderStatusUpdated,
  logAdminProfileUpdated
};