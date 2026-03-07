import AdminActivity from '../../models/AdminActivity.model.js';
import Admin from '../../models/Admin.model.js';

/**
 * Return a { $gte, $lte } range based on the period string.
 */
const buildDateRange = (period) => {
  const now = new Date();

  switch (period) {
    case 'today': {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      return { $gte: start, $lte: end };
    }
    case 'week': {
      const start = new Date(now);
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      return { $gte: start, $lte: now };
    }
    case 'month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { $gte: start, $lte: now };
    }
    case 'year': {
      const start = new Date(now.getFullYear(), 0, 1);
      return { $gte: start, $lte: now };
    }
    case 'lifetime':
    default:
      return null; // no date filter
  }
};

// @desc    Get admin activity history
// @route   GET /api/admin/activity-history
// @access  Private (Admin)
export const getActivityHistory = async (req, res, next) => {
  try {
    const {
      period = 'lifetime',
      page = 1,
      limit = 20,
      actionType = '',      // specific action enum
      actionCategory = '',  // vendor | product | order | admin
      adminId = '',
      search = ''
    } = req.query;

    const query = {};

    // --- date filter ---
    const dateRange = buildDateRange(period);
    if (dateRange) {
      query.createdAt = dateRange;
    }

    // --- action filter ---
    if (actionType) {
      query.action = actionType;
    }

    // --- category filter ---
    if (actionCategory) {
      query.actionCategory = actionCategory;
    }

    // --- admin filter ---
    if (adminId) {
      query.admin = adminId;
    }

    // --- text search ---
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { adminName: { $regex: search, $options: 'i' } },
        { adminEmail: { $regex: search, $options: 'i' } },
        { 'target.name': { $regex: search, $options: 'i' } },
        { 'target.email': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [activities, total] = await Promise.all([
      AdminActivity.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      AdminActivity.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: activities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error in getActivityHistory:', error);
    next(error);
  }
};

// @desc    Get activity statistics / summary
// @route   GET /api/admin/activity-history/stats
// @access  Private (Admin)
export const getActivityStats = async (req, res, next) => {
  try {
    const { period = 'lifetime' } = req.query;

    const matchStage = {};
    const dateRange = buildDateRange(period);
    if (dateRange) {
      matchStage.createdAt = dateRange;
    }

    const [
      byAction,
      byAdmin,
      byCategory,
      totalCount
    ] = await Promise.all([
      // count per action type
      AdminActivity.aggregate([
        { $match: matchStage },
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      // count per admin
      AdminActivity.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$admin',
            adminName: { $first: '$adminName' },
            adminEmail: { $first: '$adminEmail' },
            count: { $sum: 1 },
            lastActivity: { $max: '$createdAt' }
          }
        },
        { $sort: { count: -1 } }
      ]),
      // count per category
      AdminActivity.aggregate([
        { $match: matchStage },
        { $group: { _id: '$actionCategory', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      // total
      AdminActivity.countDocuments(matchStage)
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalCount,
        byAction,
        byAdmin,
        byCategory
      }
    });
  } catch (error) {
    console.error('Error in getActivityStats:', error);
    next(error);
  }
};

// @desc    Get list of admins (for filter dropdown)
// @route   GET /api/admin/activity-history/admins
// @access  Private (Admin)
export const getAdminsList = async (req, res, next) => {
  try {
    const admins = await Admin.find()
      .select('firstName lastName email')
      .sort({ firstName: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: admins.map(a => ({
        _id: a._id,
        name: `${a.firstName} ${a.lastName}`,
        email: a.email
      }))
    });
  } catch (error) {
    next(error);
  }
};