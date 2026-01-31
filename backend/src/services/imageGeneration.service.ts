/**
 * Image Generation Service - Hugging Face Only
 * Sử dụng Hugging Face Inference API với API key
 */
export interface GenerateBannerParams {
  prompt: string;
  eventName?: string;
}

export type ImageProvider = 'huggingface' | 'bedrock';

// ============================================================================
// Helper Functions
// ============================================================================

function sanitizePrompt(prompt: string): string {
  return prompt
    .replace(/[^\w\s.,!?-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 400);
}

function buildPrompt(prompt: string, eventName?: string): string {
  const cleanPrompt = sanitizePrompt(prompt);
  const basePrompt = eventName
    ? `Professional event banner, ${eventName}, ${cleanPrompt}, high quality, modern design, vibrant colors, concert style, web banner`
    : `Professional event banner, ${cleanPrompt}, high quality, modern design, vibrant colors, web banner`;
  return basePrompt.slice(0, 500);
}

// ============================================================================
// Provider: Hugging Face
// ============================================================================

async function generateWithHuggingFace(params: GenerateBannerParams): Promise<string> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  
  if (!apiKey) {
    throw new Error(
      'Thiếu HUGGINGFACE_API_KEY trong .env\n\n' +
      '💡 Hướng dẫn:\n' +
      '1. Vào: https://huggingface.co/settings/tokens\n' +
      '2. Tạo token mới (Read permission)\n' +
      '3. Thêm vào backend/.env: HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxx'
    );
  }

  const fullPrompt = buildPrompt(params.prompt, params.eventName);
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  };

  // Danh sách models được recommend cho Inference Providers
  const models = [
    'black-forest-labs/FLUX.1-schnell', // Model nhanh, được recommend
    'ByteDance/SDXL-Lightning', // Model nhanh và tốt
    'stabilityai/stable-diffusion-xl-base-1.0', // Fallback
  ];

  for (const model of models) {
    try {
      console.log(`🔄 Đang thử Hugging Face model: ${model}...`);

      // Thử Inference Providers API trước (endpoint mới với format khác)
      // Nếu không được, fallback về endpoint cũ
      let endpoint = `https://api-inference.huggingface.co/models/${model}`;
      
      // Thử Inference Providers endpoint nếu có
      // Format: https://api-inference.huggingface.co/models/{model}
      // Router API có thể không hỗ trợ tất cả models

      // Request body - đơn giản hóa để tương thích tốt hơn
      const requestBody: any = {
        inputs: fullPrompt,
      };

      // Thêm parameters nếu model hỗ trợ
      if (model.includes('FLUX') || model.includes('SDXL') || model.includes('stable-diffusion')) {
        requestBody.parameters = {
          negative_prompt: 'blurry, low quality, distorted, watermark',
          width: 1024,
          height: 768,
          num_inference_steps: model.includes('schnell') ? 4 : 30,
          guidance_scale: 7.5,
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      // Model đang loading
      if (response.status === 503) {
        console.log(`⏳ Model ${model} đang loading, đợi 15 giây...`);
        await new Promise((resolve) => setTimeout(resolve, 15000));
        continue;
      }

      // Xử lý lỗi 410 - endpoint deprecated, thử lại với format đơn giản hơn
      if (response.status === 410) {
        console.log(`⚠️ Endpoint deprecated (410), thử lại với request đơn giản hơn...`);
        // Thử lại với request body đơn giản nhất
        const simpleResponse = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify({ inputs: fullPrompt }),
        });
        
        if (simpleResponse.ok) {
          const imageBuffer = await simpleResponse.arrayBuffer();
          const base64 = Buffer.from(imageBuffer).toString('base64');
          console.log(`✅ Hugging Face thành công với request đơn giản: ${model}`);
          return `data:image/png;base64,${base64}`;
        }
        
        // Nếu vẫn lỗi, thử model tiếp theo
        if (model === models[models.length - 1]) {
          throw new Error(
            `Hugging Face endpoint deprecated (410)\n\n` +
            `💡 Giải pháp:\n` +
            `1. Kiểm tra HUGGINGFACE_API_KEY trong backend/.env\n` +
            `2. Token có quyền "Read" và "Inference Providers"\n` +
            `3. Tạo token mới: https://huggingface.co/settings/tokens\n` +
            `4. Restart backend`
          );
        }
        continue;
      }

      // Xử lý lỗi 404 - model không tồn tại hoặc không accessible
      if (response.status === 404) {
        console.log(`⚠️ Model ${model} không tìm thấy (404), thử model tiếp theo...`);
        if (model === models[models.length - 1]) {
          throw new Error(
            `Tất cả Hugging Face models đều không tìm thấy (404)\n\n` +
            `💡 Giải pháp:\n` +
            `1. Kiểm tra kết nối internet\n` +
            `2. Kiểm tra HUGGINGFACE_API_KEY trong .env\n` +
            `3. Thử lại sau vài phút (API có thể đang maintenance)\n` +
            `4. Tạo token mới: https://huggingface.co/settings/tokens`
          );
        }
        continue;
      }

      // Xử lý lỗi 401 - API key không hợp lệ
      if (response.status === 401) {
        throw new Error(
          `Hugging Face API key không hợp lệ (401)\n\n` +
          `💡 Giải pháp:\n` +
          `1. Kiểm tra HUGGINGFACE_API_KEY trong backend/.env\n` +
          `2. Đảm bảo token bắt đầu bằng "hf_"\n` +
          `3. Tạo token mới: https://huggingface.co/settings/tokens\n` +
          `4. Restart backend sau khi thêm token`
        );
      }

      // Thành công
      if (response.ok) {
        const imageBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(imageBuffer).toString('base64');
        console.log(`✅ Hugging Face thành công với model: ${model}`);
        return `data:image/png;base64,${base64}`;
      }

      // Lỗi khác
      const errorText = await response.text();
      console.log(`❌ Model ${model} lỗi: ${response.status}`);
      
      if (model === models[models.length - 1]) {
        const errorPreview = errorText.slice(0, 200);
        throw new Error(
          `Hugging Face API lỗi: ${response.status}\n` +
          `Chi tiết: ${errorPreview}\n\n` +
          `💡 Giải pháp:\n` +
          `1. Kiểm tra HUGGINGFACE_API_KEY trong backend/.env\n` +
          `2. Đảm bảo token có quyền "Read"\n` +
          `3. Tạo token mới: https://huggingface.co/settings/tokens\n` +
          `4. Restart backend sau khi thêm token`
        );
      }
    } catch (err: any) {
      if (model === models[models.length - 1]) {
        throw err;
      }
    }
  }

  throw new Error('Tất cả Hugging Face models đều lỗi');
}

// ============================================================================
// Main Function
// ============================================================================

export async function generateBanner(
  params: GenerateBannerParams,
  preferredProvider?: ImageProvider
): Promise<{ imageDataUrl: string; provider: ImageProvider }> {
  // Chỉ dùng Hugging Face
  if (preferredProvider && preferredProvider !== 'huggingface' && preferredProvider !== 'bedrock') {
    console.log(`⚠️ Provider ${preferredProvider} không được hỗ trợ, dùng Hugging Face`);
  }

  try {
    console.log(`🔄 Đang tạo banner với Hugging Face...`);
    const imageDataUrl = await generateWithHuggingFace(params);
    console.log(`✅ Thành công với Hugging Face`);
    return { imageDataUrl, provider: 'huggingface' };
  } catch (err: any) {
    const errorMsg = err?.message || 'Unknown error';
    console.error(`❌ Hugging Face lỗi:`, errorMsg);
    throw err;
  }
}
