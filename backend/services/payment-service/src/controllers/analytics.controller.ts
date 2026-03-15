import { Request, Response } from 'express';
import { Order } from '../models/order.model';
import mongoose from 'mongoose';

export const getOverviewAnalytics = async (req: Request, res: Response) => {
  try {
    const organizerId = (req as any).userId;
    if (!organizerId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { period = 'month' } = req.query; // 'month', 'quarter', 'year'

    // Determine date range based on period
    const now = new Date();
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    if (period === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    } else if (period === 'quarter') {
      startDate.setMonth(now.getMonth() - 3);
    } else if (period === 'year') {
      startDate.setFullYear(now.getFullYear() - 1);
    } else {
      startDate.setMonth(now.getMonth() - 1); // default 30 days
    }

    const matchPaid = {
      organizerId,
      status: 'paid',
      createdAt: { $gte: startDate, $lte: now }
    };

    const matchAllTime = {
      organizerId,
      status: 'paid'
    };

    // 1. KPI Data
    const totalRevenueAggr = await Order.aggregate([
      { $match: matchPaid },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, tickets: { $sum: { $sum: '$items.quantity' } } } }
    ]);
    const overallRevenue = totalRevenueAggr[0] ? totalRevenueAggr[0].total : 0;
    const overallTickets = totalRevenueAggr[0] ? totalRevenueAggr[0].tickets : 0;

    const activeEventsAggr = await Order.aggregate([
      { $match: { organizerId } },
      { $group: { _id: '$eventId' } }
    ]);
    const activeEventsCount = activeEventsAggr.length;

    // 2. Revenue Breakdown
    let groupByFormat = '%Y-%m-%d';
    if (period === 'year' || period === 'quarter') {
      groupByFormat = '%Y-%m';
    }

    const revenueByMonthRaw = await Order.aggregate([
      { $match: matchPaid },
      {
        $group: {
          _id: { $dateToString: { format: groupByFormat, date: '$createdAt' } },
          value: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const revenueByMonth = revenueByMonthRaw.map(v => ({ month: v._id, value: v.value }));

    // 3. Ticket Type Distribution (by zoneName)
    const ticketDistRaw = await Order.aggregate([
      { $match: matchPaid },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.zoneName',
          count: { $sum: '$items.quantity' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    let totalDistTickets = ticketDistRaw.reduce((acc, curr) => acc + curr.count, 0);
    const ticketTypeDistribution = ticketDistRaw.map(item => ({
      type: item._id,
      count: item.count,
      percentage: totalDistTickets > 0 ? parseFloat(((item.count / totalDistTickets) * 100).toFixed(1)) : 0
    }));

    // 4. Top Events
    const topEventsRaw = await Order.aggregate([
      { $match: matchPaid },
      {
        $group: {
          _id: '$eventId',
          name: { $first: '$eventName' },
          revenue: { $sum: '$totalAmount' },
          ticketsSold: { $sum: { $sum: '$items.quantity' } }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ]);

    const topEvents = topEventsRaw.map(ev => ({
      name: ev.name,
      revenue: ev.revenue,
      ticketsSold: ev.ticketsSold,
      rating: 5 // mock rating
    }));

    res.status(200).json({
      success: true,
      data: {
        kpi: {
          totalRevenue: overallRevenue,
          ticketsSold: overallTickets,
          activeEvents: activeEventsCount,
          avgConversion: 65 // mock
        },
        revenueGrowth: 10.5,
        ticketGrowth: 5.2,
        conversionTrend: 2.1,
        revenueByMonth,
        ticketTypeDistribution,
        topEvents
      }
    });
  } catch (error: any) {
    console.error('Lỗi getOverviewAnalytics:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// ADMIN ANALYTICS: Get Event Revenues for Payouts
// ============================================
export const getAdminEventRevenues = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Search by event name or organizer ID if provided
    const matchStage: any = { status: 'paid', payoutStatus: 'pending' };

    // Add eventIds filter if provided (for filtering only completed events)
    if (req.query.eventIds) {
      const ids = (req.query.eventIds as string).split(',');
      if (ids.length > 0) {
        matchStage.eventId = { $in: ids };
      }
    }

    if (req.query.search) {
      matchStage.$or = [
        { eventName: { $regex: req.query.search, $options: 'i' } },
        { organizerId: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Pipeline to group by event
    const pipeline: any[] = [
      { $match: matchStage },
      {
        $group: {
          _id: '$eventId',
          eventName: { $first: '$eventName' },
          organizerId: { $first: '$organizerId' },
          ticketsSold: { $sum: { $sum: '$items.quantity' } },
          totalRevenue: { $sum: '$totalAmount' }, // Total paid by customers
          totalSubtotal: { $sum: '$subtotal' }, // Before commission
          totalCommission: { $sum: '$commissionAmount' }, // App's cut
          totalOrganizerAmount: { $sum: '$organizerAmount' }, // Organizer's cut
          latestOrderDate: { $max: '$paidAt' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { latestOrderDate: -1 } },
      { $skip: skip },
      { $limit: limit }
    ];

    const eventRevenues = await Order.aggregate(pipeline);

    // Count total unique paid events for pagination
    const countPipeline = [
      { $match: matchStage },
      { $group: { _id: '$eventId' } },
      { $count: 'total' }
    ];
    const totalResult = await Order.aggregate(countPipeline);
    const total = totalResult.length > 0 ? totalResult[0].total : 0;

    res.status(200).json({
      success: true,
      data: eventRevenues,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('Error fetching admin event revenues:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
