#!/bin/bash
# Script test API tạo ảnh banner

echo "🧪 Testing Image Generation API..."
echo ""

# Test với Replicate
echo "📸 Test 1: Tạo banner với Replicate"
curl -X POST http://localhost:7002/api/ai/generate-banner \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "concert banner with stage and lights",
    "eventName": "Test Event"
  }' \
  -w "\n\nStatus: %{http_code}\n" \
  -o /tmp/test-banner-response.json

echo ""
echo "✅ Response saved to /tmp/test-banner-response.json"
echo ""

# Kiểm tra response
if [ -f /tmp/test-banner-response.json ]; then
  echo "📄 Response preview:"
  head -c 200 /tmp/test-banner-response.json
  echo "..."
  echo ""
  
  # Kiểm tra có lỗi không
  if grep -q "error" /tmp/test-banner-response.json; then
    echo "❌ Có lỗi trong response!"
    cat /tmp/test-banner-response.json
  else
    echo "✅ API hoạt động tốt!"
  fi
fi
