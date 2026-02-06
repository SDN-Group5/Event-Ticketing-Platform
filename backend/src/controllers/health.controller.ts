
// ============================================
// FILE: health.controller.ts
// MỤC ĐÍCH: Controller xử lý health check
// TRONG MVC: Đây là Controller layer
// ============================================

import { Request, Response } from "express";
import mongoose from "mongoose";

// ============================================
// FUNCTION: getHealth
// MỤC ĐÍCH: Kiểm tra trạng thái sức khỏe của API
// ENDPOINT: GET /api/health
// ============================================
export const getHealth = async (req: Request, res: Response) => {
  try {
    // Bước 1: Kiểm tra kết nối database
    // mongoose.connection.readyState === 1 nghĩa là đã kết nối
    const dbStatus =
      mongoose.connection.readyState === 1 ? "connected" : "disconnected";
    
    // Lấy danh sách collections trong database
    const collections =
      (await mongoose.connection.db?.listCollections().toArray()) || [];

    // Bước 2: Lấy thông tin memory usage
    // process.memoryUsage() = Thông tin về bộ nhớ đang sử dụng
    const memUsage = process.memoryUsage();
    const usedMemoryMB = Math.round(memUsage.heapUsed / 1024 / 1024);  // Chuyển sang MB
    const totalMemoryMB = Math.round(memUsage.heapTotal / 1024 / 1024);
    const memoryPercentage = Math.round((usedMemoryMB / totalMemoryMB) * 100);

    // Bước 3: Lấy uptime (thời gian server đã chạy)
    // process.uptime() = Số giây server đã chạy
    const uptime = process.uptime();

    // Bước 4: Tạo response data
    const healthData = {
      status: dbStatus === "connected" ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      uptime: Math.round(uptime),
      database: {
        status: dbStatus,
        collections: "Số collection có trong  " + collections.length,
        name: mongoose.connection.name || "hotel-booking",
      },
      memory: {
        used: usedMemoryMB,
        total: totalMemoryMB,
        percentage: memoryPercentage,
      },
      environment: process.env.NODE_ENV || "development",
      version: "1.0.0",
    };

    // Bước 5: Trả về response
    // Nếu database connected → 200, nếu không → 503 (Service Unavailable)
    const statusCode = dbStatus === "connected" ? 200 : 503;
    res.status(statusCode).json(healthData);
  } catch (error) {
    // Nếu có lỗi, trả về unhealthy
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: "Health check failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// ============================================
// FUNCTION: getDetailedHealth
// MỤC ĐÍCH: Lấy thông tin chi tiết về sức khỏe API
// ENDPOINT: GET /api/health/detailed
// ============================================
export const getDetailedHealth = async (req: Request, res: Response) => {
  try {
    // Lấy thông tin memory và CPU
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    // Tạo response data chi tiết
    const detailedHealth = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      system: {
        platform: process.platform,      // Hệ điều hành (darwin, win32, linux)
        arch: process.arch,               // Kiến trúc (x64, arm64)
        nodeVersion: process.version,      // Phiên bản Node.js
        pid: process.pid,                 // Process ID
      },
      performance: {
        memory: {
          heapUsed: memUsage.heapUsed,    // Bộ nhớ heap đã dùng (bytes)
          heapTotal: memUsage.heapTotal, // Tổng bộ nhớ heap (bytes)
          external: memUsage.external,    // Bộ nhớ external (bytes)
          rss: memUsage.rss,              // Resident Set Size (bytes)
        },
        cpu: {
          user: cpuUsage.user,            // CPU time user (microseconds)
          system: cpuUsage.system,        // CPU time system (microseconds)
        },
        uptime: Math.round(process.uptime()), // Uptime (seconds)
      },
      database: {
        status:
          mongoose.connection.readyState === 1 ? "connected" : "disconnected",
        readyState: mongoose.connection.readyState, // 0=disconnected, 1=connected
        host: mongoose.connection.host,  // Database host
        port: mongoose.connection.port,   // Database port
        name: mongoose.connection.name,  // Database name
      },
    };

    res.status(200).json(detailedHealth);
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      error: "Detailed health check failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
