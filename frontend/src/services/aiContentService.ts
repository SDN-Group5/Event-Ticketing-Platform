/**
 * AI Content Service
 * - Banner: AWS Bedrock (Titan Image) qua backend API
 * - Mô tả: Groq API (cần GROQ_API_KEY)
 */
const groqApiKey = process.env.GROQ_API_KEY || '';
const apiUrl = process.env.VITE_API_URL || 'http://localhost:7002';

/** Generate mô tả sự kiện bằng Groq */
export async function generateEventDescription(params: {
  eventName: string;
  category: string;
}): Promise<string> {
  if (!groqApiKey) {
    throw new Error('Thiếu GROQ_API_KEY. Thêm vào file .env');
  }

  const prompt = `Viết mô tả ngắn (2-3 câu) cho sự kiện:
- Tên: ${params.eventName}
- Thể loại: ${params.category}

Mô tả phải hấp dẫn, thu hút người tham dự. Dùng tiếng Việt.`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${groqApiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API lỗi: ${res.status} - ${err}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Không nhận được nội dung từ Groq');
  return text.trim();
}

/** Generate banner sự kiện qua backend (hỗ trợ nhiều provider) */
export async function generateEventBanner(params: {
  prompt: string;
  eventName?: string;
  provider?: 'replicate' | 'cloudinary' | 'huggingface' | 'bedrock';
}): Promise<{ imageDataUrl: string; provider: string }> {
  // Dùng route public /api/ai/generate-banner (không cần auth)
  const res = await fetch(`${apiUrl}/api/ai/generate-banner`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: params.prompt.trim(),
      eventName: params.eventName?.trim() || undefined,
      provider: params.provider || undefined, // Optional: chỉ định provider
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const msg = data?.error || res.statusText;
    
    // Hiển thị lỗi chi tiết hơn
    let errorMessage = msg || `Backend lỗi: ${res.status}`;
    
    // Gợi ý setup nếu lỗi về API keys
    if (msg.includes('Thiếu') || msg.includes('API') || msg.includes('token')) {
      errorMessage += '\n\n💡 Hướng dẫn: Xem doc/IMAGE_GENERATION_SETUP.md để setup provider';
    }
    
    throw new Error(errorMessage);
  }

  const data = await res.json();
  const imageDataUrl = data?.imageDataUrl;
  const provider = data?.provider || 'unknown';
  
  if (!imageDataUrl) throw new Error('Backend không trả về ảnh');
  
  return { imageDataUrl, provider };
}
