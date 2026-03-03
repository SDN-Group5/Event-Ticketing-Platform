#!/usr/bin/env node

/**
 * Quick Test: Huỷ thanh toán → trả ghế ngay lập tức
 */

const axios = require('axios');

const PAYMENT_URL = 'http://localhost:4004/api/payments';
const LAYOUT_URL = 'http://localhost:4002/api/v1';

async function testBulkRelease() {
    console.log('🧪 Testing bulk-release endpoint...');
    
    try {
        const response = await axios.post(`${LAYOUT_URL}/events/d49fc93020729fe74d34a286/seats/bulk-release`, {
            seatIds: ['zone-1772543703989-8rmh6bb5m-1-1', 'zone-1772543703989-8rmh6bb5m-1-2']
        });
        
        console.log('✅ Bulk release successful:', response.data);
        return true;
    } catch (error) {
        console.error('❌ Bulk release failed:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        return false;
    }
}

async function testCancelPayment() {
    console.log('🧪 Testing cancel payment with seat release...');
    
    try {
        // Test với orderCode có sẵn (thay bằng orderCode thật)
        const response = await axios.post(`${PAYMENT_URL}/cancel/554552804559`, {}, {
            headers: { 
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzNlNGE5YTVlNmY0YjI2ZDEzNDJkNjgiLCJlbWFpbCI6ImRlMTgwNTc3dHJhbmhvbmdwaHVvY0BnbWFpbC5jb20iLCJyb2xlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NDA5OTI2NzIsImV4cCI6MTc0MTA3OTA3Mn0.zJMlGKPYfqkKAuFO6qKgRVjfCzRLCTGLzLkdFu0XFQE'
            }
        });
        
        console.log('✅ Cancel payment successful:', response.data);
        return true;
    } catch (error) {
        console.error('❌ Cancel payment failed:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        return false;
    }
}

async function runTests() {
    console.log('🚀 Quick Test: Seat Release\n');
    
    // Test 1: Bulk release endpoint
    await testBulkRelease();
    console.log('');
    
    // Test 2: Cancel payment (nếu có orderCode)
    // await testCancelPayment();
    
    console.log('✅ Tests completed!');
}

runTests().catch(console.error);