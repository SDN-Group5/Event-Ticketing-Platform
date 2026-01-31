/**
 * AWS Bedrock - Titan Image Generator G1
 * Tạo ảnh banner từ prompt (chạy trên backend để giữ bí mật AWS key).
 */
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

const region = process.env.AWS_REGION || "us-east-1";
const modelId = "amazon.titan-image-generator-v1";

function getClient(): BedrockRuntimeClient {
  const accessKey = process.env.AWS_ACCESS_KEY_ID;
  const secretKey = process.env.AWS_SECRET_ACCESS_KEY;
  if (!accessKey || !secretKey) {
    throw new Error(
      "Thiếu AWS_ACCESS_KEY_ID hoặc AWS_SECRET_ACCESS_KEY trong .env"
    );
  }
  return new BedrockRuntimeClient({
    region,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  });
}

export interface GenerateBannerParams {
  prompt: string;
  eventName?: string;
}

/**
 * Làm sạch prompt để tránh content policy violation
 */
function sanitizePrompt(prompt: string): string {
  // Loại bỏ các ký tự đặc biệt có thể gây lỗi
  return prompt
    .replace(/[^\w\s.,!?-]/g, ' ') // Chỉ giữ chữ, số, dấu câu cơ bản
    .replace(/\s+/g, ' ') // Nhiều khoảng trắng thành 1
    .trim()
    .slice(0, 400); // Giữ lại chỗ cho prefix
}

/**
 * Sinh ảnh banner bằng Titan Image Generator.
 * Trả về data URL (data:image/png;base64,...) để frontend hiển thị.
 */
export async function generateBannerWithBedrock(
  params: GenerateBannerParams
): Promise<string> {
  // Làm sạch prompt
  const cleanPrompt = sanitizePrompt(params.prompt);
  if (!cleanPrompt || cleanPrompt.length < 3) {
    throw new Error("Prompt quá ngắn hoặc không hợp lệ");
  }

  // Tạo prompt an toàn và rõ ràng
  const fullPrompt = params.eventName
    ? `Professional event banner, ${params.eventName}, ${cleanPrompt}, high quality, modern design, vibrant colors, concert style, web banner`
    : `Professional event banner, ${cleanPrompt}, high quality, modern design, vibrant colors, web banner`;

  // Đảm bảo không quá 512 ký tự
  const finalPrompt = fullPrompt.slice(0, 512);

  const body = JSON.stringify({
    taskType: "TEXT_IMAGE",
    textToImageParams: {
      text: finalPrompt,
      negativeText: "blurry, low quality, distorted, watermark, text overlay",
    },
    imageGenerationConfig: {
      numberOfImages: 1,
      quality: "standard",
      height: 768,
      width: 1152, // 3:2 ratio - được hỗ trợ bởi Titan
      cfgScale: 8.0,
    },
  });

  const client = getClient();
  const command = new InvokeModelCommand({
    modelId,
    contentType: "application/json",
    accept: "application/json",
    body,
  });

  try {
    const response = await client.send(command);
    if (!response.body) {
      throw new Error("Bedrock không trả về body");
    }

    const bodyStr =
      typeof (response.body as any).transformToString === "function"
        ? await (response.body as any).transformToString()
        : new TextDecoder().decode(new Uint8Array(response.body as ArrayBuffer));
    const responseBody = JSON.parse(bodyStr);

    const errMsg = responseBody.error;
    if (errMsg) {
      throw new Error(`Bedrock content policy: ${errMsg}`);
    }

    const images = responseBody.images;
    if (!images || !images[0]) {
      throw new Error("Bedrock không trả về ảnh");
    }

    const base64 = images[0];
    return `data:image/png;base64,${base64}`;
  } catch (err: any) {
    // Log chi tiết lỗi từ AWS SDK
    console.error("🔴 AWS Bedrock Error Details:", {
      name: err?.name,
      message: err?.message,
      code: err?.code,
      statusCode: err?.$metadata?.httpStatusCode,
      requestId: err?.$metadata?.requestId,
      region: region,
      modelId: modelId,
    });

    // Xử lý các lỗi phổ biến
    if (err?.name === "AccessDeniedException" || err?.code === "AccessDeniedException") {
      throw new Error(
        "Access Denied: IAM user không có quyền gọi Bedrock. Kiểm tra policy 'bedrock:InvokeModel'."
      );
    }
    if (err?.name === "ValidationException" || err?.code === "ValidationException") {
      const errorMsg = err?.message || "Request không hợp lệ";
      if (errorMsg.includes("Operation not allowed")) {
        throw new Error(
          `AWS Bedrock account chưa được approve để dùng Titan Image Generator. Vui lòng request access qua AWS Support hoặc Bedrock Console. Xem hướng dẫn trong doc/AWS_BEDROCK_SETUP.md`
        );
      }
      throw new Error(`Validation Error: ${errorMsg}`);
    }
    if (err?.name === "ThrottlingException" || err?.code === "ThrottlingException") {
      throw new Error("Rate limit: Quá nhiều request. Vui lòng thử lại sau.");
    }
    if (err?.$metadata?.httpStatusCode === 403) {
      throw new Error(
        "403 Forbidden: Model chưa được enable hoặc IAM không có quyền. Kiểm tra Bedrock Model Access."
      );
    }

    // Lỗi khác
    throw new Error(
      err?.message || `AWS Bedrock error: ${err?.name || "Unknown error"}`
    );
  }
}
