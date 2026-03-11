# Event System - Quick Testing Guide

## API Testing Checklist

### ✅ Date Validation Tests

**Test 1: Create event with past date (SHOULD FAIL)**
```bash
curl -X POST http://localhost:3001/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Past Event",
    "category": "Music",
    "location": "Venue A",
    "startTime": "2025-01-01T10:00:00Z",
    "endTime": "2025-01-01T15:00:00Z"
  }'
```
Expected: 400 error - "Thời gian bắt đầu phải ở tương lai"

**Test 2: Create event with future date (SHOULD SUCCEED)**
```bash
curl -X POST http://localhost:3001/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Future Event",
    "category": "Music",
    "location": "Venue A",
    "startTime": "2026-04-01T10:00:00Z",
    "endTime": "2026-04-01T15:00:00Z"
  }'
```
Expected: 201 success

---

### ✅ Time Slot Conflict Tests

**Test 3: Create first event at a venue**
```bash
curl -X POST http://localhost:3001/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Event 1",
    "category": "Concert",
    "location": "Nhà thi đấu Phú Thọ - TP.HCM",
    "startTime": "2026-04-15T10:00:00Z",
    "endTime": "2026-04-15T15:00:00Z"
  }'
```
Expected: 201 success, save the returned event ID

**Test 4: Try overlapping event at same venue (SHOULD FAIL)**
```bash
curl -X POST http://localhost:3001/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Event 2 - Overlapping",
    "category": "Concert",
    "location": "Nhà thi đấu Phú Thọ - TP.HCM",
    "startTime": "2026-04-15T12:00:00Z",
    "endTime": "2026-04-15T17:00:00Z"
  }'
```
Expected: 400 error - "Địa điểm này đã có sự kiện khác"

**Test 5: Create non-overlapping event at same venue (SHOULD SUCCEED)**
```bash
curl -X POST http://localhost:3001/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Event 3 - Different Time",
    "category": "Concert",
    "location": "Nhà thi đấu Phú Thọ - TP.HCM",
    "startTime": "2026-04-15T18:00:00Z",
    "endTime": "2026-04-15T23:00:00Z"
  }'
```
Expected: 201 success

---

### ✅ Banner Tests

**Test 6: Create event with banners**
```bash
curl -X POST http://localhost:3001/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Event with Banners",
    "category": "Music",
    "location": "Venue B",
    "startTime": "2026-04-20T10:00:00Z",
    "endTime": "2026-04-20T15:00:00Z",
    "banners": [
      {
        "url": "https://via.placeholder.com/800x400",
        "title": "Main Banner"
      },
      {
        "url": "https://via.placeholder.com/800x300",
        "title": "Secondary"
      }
    ]
  }'
```
Expected: 201 success with banners properly saved

**Test 7: Invalid banner URL (SHOULD FAIL)**
```bash
curl -X POST http://localhost:3001/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Bad Banner Event",
    "category": "Music",
    "location": "Venue B",
    "startTime": "2026-04-20T10:00:00Z",
    "endTime": "2026-04-20T15:00:00Z",
    "banners": [
      {
        "url": "not-a-valid-url",
        "title": "Bad Banner"
      }
    ]
  }'
```
Expected: 400 error - "URL banner phải hợp lệ"

---

### ✅ Venue Suggestion Tests

**Test 8: Get suggested venues**
```bash
curl http://localhost:3001/api/events/venues/suggested?limit=5
```
Expected: 200 response with list of venues
```json
{
    "success": true,
    "count": 5,
    "data": ["Nhà thi đấu Phú Thọ - TP.HCM", ...]
}
```

**Test 9: Get suggested venues with custom limit**
```bash
curl http://localhost:3001/api/events/venues/suggested?limit=10
```
Expected: 200 response with up to 10 venues

---

### ✅ Venue Availability Check Tests

**Test 10: Check available time slot**
```bash
curl -X POST http://localhost:3001/api/events/venues/check-availability \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Venue A",
    "startTime": "2026-05-01T10:00:00Z",
    "endTime": "2026-05-01T15:00:00Z"
  }'
```
Expected: 200 response - available: true

**Test 11: Check conflicted time slot**
```bash
curl -X POST http://localhost:3001/api/events/venues/check-availability \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Nhà thi đấu Phú Thọ - TP.HCM",
    "startTime": "2026-04-15T10:00:00Z",
    "endTime": "2026-04-15T15:00:00Z"
  }'
```
Expected: 200 response - available: false with conflicting events listed

---

### ✅ Update Event Tests

**Test 12: Update event date (check conflict validation)**

First, get your event ID from Test 3. Then try to update it to a conflicting time:

```bash
curl -X PUT http://localhost:3001/api/events/{EVENT_ID} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "startTime": "2026-04-15T12:00:00Z",
    "endTime": "2026-04-15T17:00:00Z"
  }'
```
Expected: If another event exists, 400 error

---

## Validation Errors Summary

| Scenario | Expected Status | Expected Message |
|----------|-----------------|------------------|
| Past date | 400 | "Thời gian bắt đầu phải ở tương lai" |
| Missing endTime | 400 | "Thời gian kết thúc là bắt buộc" |
| EndTime ≤ StartTime | 400 | "Thời gian kết thúc phải sau thời gian bắt đầu" |
| Time conflict | 400 | "Địa điểm này đã có sự kiện khác" |
| Invalid banner URL | 400 | "Link banner phải là URL hợp lệ" |
| Missing location | 400 | "Địa điểm là bắt buộc" |
| Short title | 400 | "Tên sự kiện phải có ít nhất 5 ký tự" |

---

## Notes

- Replace `YOUR_TOKEN` with actual JWT token from login
- Replace `{EVENT_ID}` with actual event ID from creation response
- All timestamps should be ISO 8601 format
- Test venue name suggestions come from database or use defaults
- Banners support both URL strings and objects with title property

