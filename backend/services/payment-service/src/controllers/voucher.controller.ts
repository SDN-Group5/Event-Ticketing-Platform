import { Request, Response } from 'express';
import { Voucher } from '../models/voucher.model';

/**
 * Helper: lấy organizerId từ header hoặc body/query (tạm thời, vì payment-service không verify JWT trực tiếp)
 */
function getOrganizerId(req: Request): string | null {
  const headerId = (req.headers['x-user-id'] as string) || (req.headers['x-organizer-id'] as string);
  const bodyId = (req.body && (req.body.organizerId as string)) || undefined;
  const queryId = (req.query && (req.query.organizerId as string)) || undefined;

  return headerId || bodyId || queryId || null;
}

/**
 * GET /api/payments/organizer/vouchers
 * Lấy danh sách voucher của organizer hiện tại
 * Query optional: eventId
 */
export const getOrganizerVouchers = async (req: Request, res: Response) => {
  try {
    const organizerId = getOrganizerId(req);

    if (!organizerId) {
      return res.status(401).json({
        success: false,
        message: 'Thiếu organizerId (header x-user-id hoặc body.organizerId)',
      });
    }

    const { eventId } = req.query;
    const filter: any = { organizerId };
    if (eventId) {
      filter.eventId = eventId;
    }

    const vouchers = await Voucher.find(filter).sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: vouchers,
    });
  } catch (err: any) {
    console.error('[getOrganizerVouchers] Error:', err);
    return res.status(500).json({
      success: false,
      message: err?.message || 'Lỗi lấy danh sách voucher',
    });
  }
};

/**
 * POST /api/payments/organizer/vouchers
 * Tạo voucher mới cho organizer
 */
export const createVoucher = async (req: Request, res: Response) => {
  try {
    const organizerId = getOrganizerId(req);

    if (!organizerId) {
      return res.status(401).json({
        success: false,
        message: 'Thiếu organizerId (header x-user-id hoặc body.organizerId)',
      });
    }

    let {
      code,
      description,
      discountType,
      discountValue,
      maxUses,
      startDate,
      endDate,
      minimumPrice,
      status,
      eventId,
      userId,
    } = req.body;

    if (!code || !discountType || discountValue == null) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu code, discountType hoặc discountValue',
      });
    }

    code = String(code).trim().toUpperCase();

    if (discountType !== 'percentage' && discountType !== 'fixed') {
      return res.status(400).json({
        success: false,
        message: 'discountType phải là "percentage" hoặc "fixed"',
      });
    }

    discountValue = Number(discountValue);
    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      return res.status(400).json({
        success: false,
        message: 'discountValue phải là số dương',
      });
    }

    if (discountType === 'percentage' && discountValue > 100) {
      return res.status(400).json({
        success: false,
        message: 'Giảm theo % không được vượt quá 100',
      });
    }

    maxUses = maxUses != null ? Number(maxUses) : 1;
    if (!Number.isFinite(maxUses) || maxUses <= 0) {
      maxUses = 1;
    }

    const existing = await Voucher.findOne({ code });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Mã voucher này đã tồn tại, vui lòng chọn mã khác',
      });
    }

    const voucher = await Voucher.create({
      code,
      description,
      discountType,
      discountValue,
      maxUses,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      minimumPrice: minimumPrice != null ? Number(minimumPrice) : undefined,
      status: status || 'active',
      organizerId,
      eventId,
      userId,
    });

    return res.status(201).json({
      success: true,
      data: voucher,
    });
  } catch (err: any) {
    console.error('[createVoucher] Error:', err);
    return res.status(500).json({
      success: false,
      message: err?.message || 'Lỗi tạo voucher',
    });
  }
};

/**
 * PUT /api/payments/organizer/vouchers/:id
 * Cập nhật voucher (chỉ cho phép organizer sở hữu voucher đó)
 */
export const updateVoucher = async (req: Request, res: Response) => {
  try {
    const organizerId = getOrganizerId(req);

    if (!organizerId) {
      return res.status(401).json({
        success: false,
        message: 'Thiếu organizerId (header x-user-id hoặc body.organizerId)',
      });
    }

    const { id } = req.params;
    const voucher = await Voucher.findOne({ _id: id, organizerId });

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy voucher',
      });
    }

    const {
      description,
      discountType,
      discountValue,
      maxUses,
      startDate,
      endDate,
      minimumPrice,
      status,
      eventId,
      userId,
    } = req.body;

    if (description !== undefined) voucher.description = description;

    if (discountType) {
      if (discountType !== 'percentage' && discountType !== 'fixed') {
        return res.status(400).json({
          success: false,
          message: 'discountType phải là "percentage" hoặc "fixed"',
        });
      }
      (voucher as any).discountType = discountType;
    }

    if (discountValue != null) {
      const value = Number(discountValue);
      if (!Number.isFinite(value) || value <= 0) {
        return res.status(400).json({
          success: false,
          message: 'discountValue phải là số dương',
        });
      }
      if ((voucher as any).discountType === 'percentage' && value > 100) {
        return res.status(400).json({
          success: false,
          message: 'Giảm theo % không được vượt quá 100',
        });
      }
      (voucher as any).discountValue = value;
    }

    if (maxUses != null) {
      const max = Number(maxUses);
      if (Number.isFinite(max) && max > 0) {
        (voucher as any).maxUses = max;
      }
    }

    if (startDate !== undefined) {
      (voucher as any).startDate = startDate ? new Date(startDate) : undefined;
    }

    if (endDate !== undefined) {
      (voucher as any).endDate = endDate ? new Date(endDate) : undefined;
    }

    if (minimumPrice !== undefined) {
      (voucher as any).minimumPrice =
        minimumPrice != null ? Number(minimumPrice) : undefined;
    }

    if (status) {
      (voucher as any).status = status;
    }

    if (eventId !== undefined) {
      (voucher as any).eventId = eventId || undefined;
    }

    if (userId !== undefined) {
      (voucher as any).userId = userId || undefined;
    }

    await voucher.save();

    return res.json({
      success: true,
      data: voucher,
    });
  } catch (err: any) {
    console.error('[updateVoucher] Error:', err);
    return res.status(500).json({
      success: false,
      message: err?.message || 'Lỗi cập nhật voucher',
    });
  }
};

/**
 * DELETE /api/payments/organizer/vouchers/:id
 * Xoá voucher (hard delete) cho organizer hiện tại
 */
export const deleteVoucher = async (req: Request, res: Response) => {
  try {
    const organizerId = getOrganizerId(req);

    if (!organizerId) {
      return res.status(401).json({
        success: false,
        message: 'Thiếu organizerId (header x-user-id hoặc body.organizerId)',
      });
    }

    const { id } = req.params;
    const voucher = await Voucher.findOneAndDelete({ _id: id, organizerId });

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy voucher hoặc bạn không có quyền xoá',
      });
    }

    return res.json({
      success: true,
      data: null,
      message: 'Đã xoá voucher',
    });
  } catch (err: any) {
    console.error('[deleteVoucher] Error:', err);
    return res.status(500).json({
      success: false,
      message: err?.message || 'Lỗi xoá voucher',
    });
  }
};

