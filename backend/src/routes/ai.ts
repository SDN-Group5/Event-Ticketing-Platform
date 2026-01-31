import express, { Request, Response } from "express";
import { generateBannerWithBedrock } from "../services/bedrockImage.service";
import { generateBanner, ImageProvider } from "../services/imageGeneration.service";

const router = express.Router();

/**
 * POST /api/ai/generate-banner
 * Tạo ảnh banner từ prompt
 * Body: { prompt: string, eventName?: string, provider?: 'replicate' | 'huggingface' | 'bedrock' }
 * Trả về: { imageDataUrl: string, provider: string }
 */
router.post("/generate-banner", async (req: Request, res: Response) => {
  try {
    const { prompt, eventName, provider } = req.body || {};
    
    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({ error: "Thiếu prompt" });
    }

    // Xử lý Bedrock riêng
    if (provider === 'bedrock') {
      try {
        const imageDataUrl = await generateBannerWithBedrock({
          prompt: prompt.trim(),
          eventName: eventName?.trim() || undefined,
        });
        return res.json({ imageDataUrl, provider: 'bedrock' });
      } catch (err: any) {
        console.error("🔴 Bedrock lỗi, đang thử provider khác...", err.message);
      }
    }

    // Dùng service với fallback tự động
    const result = await generateBanner(
      {
        prompt: prompt.trim(),
        eventName: eventName?.trim() || undefined,
      },
      provider as ImageProvider
    );

    return res.json({
      imageDataUrl: result.imageDataUrl,
      provider: result.provider,
    });
  } catch (err: any) {
    console.error("🔴 Generate banner error:", err);
    return res.status(500).json({
      error: err?.message || "Lỗi khi tạo banner. Kiểm tra API keys trong .env",
    });
  }
});

export default router;
