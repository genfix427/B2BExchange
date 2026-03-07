// services/notification.service.js
import Notification from '../models/Notification.model.js';

const notificationService = {
  /**
   * Create a notification
   */
  async create({ recipient, type, title, message, relatedOffer, relatedOrder, relatedProduct, sender, senderName, metadata }) {
    try {
      const notification = await Notification.create({
        recipient,
        type,
        title,
        message,
        relatedOffer: relatedOffer || null,
        relatedOrder: relatedOrder || null,
        relatedProduct: relatedProduct || null,
        sender: sender || null,
        senderName: senderName || '',
        metadata: metadata || {}
      });
      return notification;
    } catch (error) {
      console.error('Failed to create notification:', error);
      // Don't throw - notifications shouldn't break main flow
      return null;
    }
  },

  /**
   * Get notifications for a vendor
   */
  async getNotifications(vendorId, { page = 1, limit = 20, unreadOnly = false }) {
    const query = { recipient: vendorId };
    if (unreadOnly) {
      query.isRead = false;
    }

    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ recipient: vendorId, isRead: false })
    ]);

    return {
      notifications,
      total,
      unreadCount,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    };
  },

  /**
   * Get unread count for a vendor
   */
  async getUnreadCount(vendorId) {
    return Notification.countDocuments({ recipient: vendorId, isRead: false });
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, vendorId) {
    return Notification.findOneAndUpdate(
      { _id: notificationId, recipient: vendorId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(vendorId) {
    return Notification.updateMany(
      { recipient: vendorId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
  },

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId, vendorId) {
    return Notification.findOneAndDelete({ _id: notificationId, recipient: vendorId });
  },

  /**
   * Create offer-related notifications
   */
  async notifyOfferReceived(offer) {
    return this.create({
      recipient: offer.sellerVendor,
      type: 'offer_received',
      title: 'New Offer Received',
      message: `${offer.buyerVendorName} made an offer of $${offer.offerPrice.toFixed(2)} for ${offer.quantity}x ${offer.productName}`,
      relatedOffer: offer._id,
      relatedProduct: offer.product,
      sender: offer.buyerVendor,
      senderName: offer.buyerVendorName,
      metadata: {
        offerPrice: offer.offerPrice,
        quantity: offer.quantity,
        originalPrice: offer.originalPrice
      }
    });
  },

  async notifyOfferAccepted(offer) {
    return this.create({
      recipient: offer.buyerVendor,
      type: 'offer_accepted',
      title: 'Offer Accepted!',
      message: `${offer.sellerVendorName} accepted your offer of $${offer.offerPrice.toFixed(2)} for ${offer.quantity}x ${offer.productName}. Order has been created.`,
      relatedOffer: offer._id,
      relatedOrder: offer.convertedOrder,
      relatedProduct: offer.product,
      sender: offer.sellerVendor,
      senderName: offer.sellerVendorName,
      metadata: {
        offerPrice: offer.offerPrice,
        quantity: offer.quantity
      }
    });
  },

  async notifyOfferRejected(offer) {
    return this.create({
      recipient: offer.buyerVendor,
      type: 'offer_rejected',
      title: 'Offer Rejected',
      message: `${offer.sellerVendorName} rejected your offer for ${offer.productName}. ${offer.rejectionReason ? 'Reason: ' + offer.rejectionReason : ''}`,
      relatedOffer: offer._id,
      relatedProduct: offer.product,
      sender: offer.sellerVendor,
      senderName: offer.sellerVendorName,
      metadata: {
        rejectionReason: offer.rejectionReason
      }
    });
  },

  async notifyOfferCountered(offer) {
    return this.create({
      recipient: offer.buyerVendor,
      type: 'offer_countered',
      title: 'Counter Offer Received',
      message: `${offer.sellerVendorName} countered your offer with $${offer.counterPrice.toFixed(2)} for ${offer.productName}`,
      relatedOffer: offer._id,
      relatedProduct: offer.product,
      sender: offer.sellerVendor,
      senderName: offer.sellerVendorName,
      metadata: {
        counterPrice: offer.counterPrice,
        originalOfferPrice: offer.offerPrice,
        quantity: offer.quantity
      }
    });
  },

  async notifyCounterAccepted(offer) {
    return this.create({
      recipient: offer.sellerVendor,
      type: 'counter_accepted',
      title: 'Counter Offer Accepted!',
      message: `${offer.buyerVendorName} accepted your counter offer of $${offer.counterPrice.toFixed(2)} for ${offer.productName}. Order has been created.`,
      relatedOffer: offer._id,
      relatedOrder: offer.convertedOrder,
      relatedProduct: offer.product,
      sender: offer.buyerVendor,
      senderName: offer.buyerVendorName,
      metadata: {
        counterPrice: offer.counterPrice,
        quantity: offer.quantity
      }
    });
  },

  async notifyCounterRejected(offer) {
    return this.create({
      recipient: offer.sellerVendor,
      type: 'counter_rejected',
      title: 'Counter Offer Rejected',
      message: `${offer.buyerVendorName} rejected your counter offer for ${offer.productName}`,
      relatedOffer: offer._id,
      relatedProduct: offer.product,
      sender: offer.buyerVendor,
      senderName: offer.buyerVendorName
    });
  },

  async notifyOrderCreatedFromOffer(offer, order) {
    // Notify buyer
    await this.create({
      recipient: offer.buyerVendor,
      type: 'order_created',
      title: 'Order Created from Offer',
      message: `Order #${order.orderNumber} has been created from your accepted offer for ${offer.productName}`,
      relatedOffer: offer._id,
      relatedOrder: order._id,
      relatedProduct: offer.product,
      sender: offer.sellerVendor,
      senderName: offer.sellerVendorName
    });

    // Notify seller
    await this.create({
      recipient: offer.sellerVendor,
      type: 'new_order',
      title: 'New Order from Accepted Offer',
      message: `Order #${order.orderNumber} created. ${offer.buyerVendorName} - ${offer.quantity}x ${offer.productName}`,
      relatedOffer: offer._id,
      relatedOrder: order._id,
      relatedProduct: offer.product,
      sender: offer.buyerVendor,
      senderName: offer.buyerVendorName
    });
  }
};

export default notificationService;