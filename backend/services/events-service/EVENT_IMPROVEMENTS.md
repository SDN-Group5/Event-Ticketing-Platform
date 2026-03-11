# Event Ticketing Platform - Event Logic Improvements

## 📋 Summary of Changes

This document outlines all improvements made to the Event Management System, including validation enhancements, conflict detection, and venue management features.

---

## ✅ 1. Date Validation Improvements

### Changes Made:
- **Backend Model** (`Event.js`): Added Mongoose validators to ensure `startTime` is always in the future
- **Backend Validation** (`event.validation.js`): Strengthened Joi validation schema with clearer error messages using ISO date format validation
- **Error Messages**: Vietnamese messages clearly indicate dates must be in the future

### Implementation Details:
- Server-side validates both before saving to DB and during request validation
- Minimum 1-minute ahead requirement for safety
- Clear error: `"Thời gian bắt đầu phải ở tương lai (tối thiểu 1 phút)"`

---

## 🔐 2. Time Slot Conflict Detection

### Features Added:
- **Conflict Checking**: Events at the same venue MUST have different time slots
- **Database Index**: Added compound index on `location`, `startTime`, `endTime` for performance
- **Overlap Detection**: Checks for any overlap in event times at the same location

### Implementation:

#### Static Method in Event Model:
```javascript
Event.hasTimeConflict(location, startTime, endTime, excludeEventId)
```
- Detects overlapping events at the same venue
- Excludes current event when updating
- Only checks non-cancelled events

### API Behavior:
- **Create Event**: Blocks creation if time slot conflicts with existing events
- **Update Event**: Validates new time doesn't conflict with other events
- **Error Message**: `"Địa điểm này đã có sự kiện khác trong khoảng thời gian này. Vui lòng chọn thời gian khác."`

---

## 🎨 3. Enhanced Event Banner Support

### Changes Made:
1. **Enhanced Schema Structure**: Banners now support rich object format
   ```javascript
   banners: [{
       url: String (required),    // Banner image URL
       title: String (optional),  // Banner title/caption
       uploadedAt: Date          // Upload timestamp
   }]
   ```

2. **Backward Compatibility**: Still accepts simple string array of URLs
   - Automatically converts string array to object format

3. **Validation**:
   - Validates URLs with proper URI format checking
   - Supports both formats in request:
     - `["url1", "url2"]`
     - `[{url: "url1", title: "Title1"}, ...]`

---

## 🏢 4. Venue Management System

### New API Endpoints:

#### 1. Get Suggested Venues
```
GET /api/events/venues/suggested?limit=5
```
- Returns most popular venues based on event frequency
- Falls back to default venues if no history exists
- Default venues included:
  - Nhà thi đấu Phú Thọ - TP.HCM
  - Sân vận động Mỹ Đình - Hà Nội
  - Nhà thi đấu Thanh Trì - Hà Nội
  - Sân vận động Thống Nhất - TP.HCM
  - Trung tâm Hội chợ Triển lãm Sài Gòn (SECC)
  - Cung thiết tế Liên Triều - TP.HCM
  - Nhà thi đấu Phan Đình Phùng - Hà Nội
  - Sân vận động Công Viên Cây Xanh - TP.HCM

**Response**:
```json
{
    "success": true,
    "count": 5,
    "data": [
        "Nhà thi đấu Phú Thọ - TP.HCM",
        "Sân vận động Mỹ Đình - Hà Nội",
        ...
    ]
}
```

#### 2. Check Venue Availability
```
POST /api/events/venues/check-availability
```

**Request Body**:
```json
{
    "location": "Nhà thi đấu Phú Thọ - TP.HCM",
    "startTime": "2026-03-20T10:00:00Z",
    "endTime": "2026-03-20T15:00:00Z"
}
```

**Response**:
```json
{
    "success": true,
    "data": {
        "available": true,
        "conflictingEvents": []
    }
}
```

Or if conflicts exist:
```json
{
    "success": true,
    "data": {
        "available": false,
        "conflictingEvents": [
            {
                "_id": "...",
                "title": "Concert Event",
                "startTime": "2026-03-20T11:00:00Z",
                "endTime": "2026-03-20T14:00:00Z"
            }
        ]
    }
}
```

### Service Functions:
- `getSuggestedVenues(limit)`: Gets popular venues or defaults
- `getDefaultVenues()`: Returns predefined venue list
- `checkTimeSlotAvailability(location, startTime, endTime)`: Checks conflicts

---

## 📝 Files Modified

### Backend Services:

1. **`backend/services/events-service/src/models/Event.js`**
   - Added Mongoose validators for date validation
   - Added static methods: `hasTimeConflict()`, `getSuggestedVenues()`
   - Added compound database index for performance
   - Enhanced banner schema with object structure

2. **`backend/services/events-service/src/validations/event.validation.js`**
   - Enhanced `createEventSchema` with stricter validations
   - Enhanced `updateEventSchema`
   - Added `checkTimeSlotSchema` for venue availability checks
   - Better error messages in Vietnamese

3. **`backend/services/events-service/src/services/event.service.js`**
   - Updated `createNewEvent()`: Added conflict checking
   - Updated `modifyEvent()`: Added conflict checking for updates
   - Added `getSuggestedVenues()`: Returns popular/default venues
   - Added `getDefaultVenues()`: Fallback venue list
   - Added `checkTimeSlotAvailability()`: Public availability checking

4. **`backend/services/events-service/src/controllers/event.controller.js`**
   - Added `getSuggestedVenues()`: API endpoint for venue suggestions
   - Added `checkVenueAvailability()`: API endpoint for conflict checking

5. **`backend/services/events-service/src/routes/event.routes.js`**
   - Added routes for new venue endpoints
   - Public endpoints (no auth required for venue recommendations)

---

## 🧪 Testing Examples

### Test 1: Create Event with Past Date
```bash
curl -X POST http://localhost:3001/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Old Event",
    "category": "Concert",
    "location": "Venue XYZ",
    "startTime": "2025-01-01T10:00:00Z",
    "endTime": "2025-01-01T15:00:00Z"
  }'
```
**Expected**: ❌ Rejected - "startTime must be in the future"

### Test 2: Create Event with Time Conflict
```bash
# Create first event
curl -X POST http://localhost:3001/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Event 1",
    "category": "Concert",
    "location": "Venue A",
    "startTime": "2026-03-20T10:00:00Z",
    "endTime": "2026-03-20T15:00:00Z"
  }'

# Try to create overlapping event at same venue
curl -X POST http://localhost:3001/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Event 2",
    "category": "Concert",
    "location": "Venue A",
    "startTime": "2026-03-20T12:00:00Z",
    "endTime": "2026-03-20T17:00:00Z"
  }'
```
**Expected**: ❌ Rejected - "Venue already has event in this time slot"

### Test 3: Check Venue Availability
```bash
curl -X POST http://localhost:3001/api/events/venues/check-availability \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Nhà thi đấu Phú Thọ - TP.HCM",
    "startTime": "2026-03-20T10:00:00Z",
    "endTime": "2026-03-20T15:00:00Z"
  }'
```

### Test 4: Get Venue Suggestions
```bash
curl http://localhost:3001/api/events/venues/suggested?limit=5
```

### Test 5: Create Event with Banner
```bash
curl -X POST http://localhost:3001/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Concert Event",
    "category": "Music",
    "location": "Venue A",
    "startTime": "2026-03-20T18:00:00Z",
    "endTime": "2026-03-20T23:00:00Z",
    "banners": [
      {
        "url": "https://example.com/banner1.jpg",
        "title": "Main Banner"
      },
      {
        "url": "https://example.com/banner2.jpg",
        "title": "Secondary Banner"
      }
    ]
  }'
```

---

## 🚀 Frontend Integration Guide

### 1. Display Venue Suggestions in Form
```javascript
import React, { useState, useEffect } from 'react';

function EventForm() {
  const [suggestedVenues, setSuggestedVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState('');
  const [customVenue, setCustomVenue] = useState('');

  useEffect(() => {
    // Fetch suggested venues
    fetch('/api/events/venues/suggested?limit=5')
      .then(res => res.json())
      .then(data => setSuggestedVenues(data.data));
  }, []);

  return (
    <div className="event-form">
      <label>Venue:</label>
      <select 
        value={selectedVenue} 
        onChange={(e) => setSelectedVenue(e.target.value)}
      >
        <option value="">Select a venue or enter custom</option>
        {suggestedVenues.map(venue => (
          <option key={venue} value={venue}>{venue}</option>
        ))}
      </select>
      <input 
        type="text" 
        placeholder="Or enter custom venue"
        value={customVenue}
        onChange={(e) => setCustomVenue(e.target.value)}
      />
    </div>
  );
}
```

### 2. Check Availability Before Submission
```javascript
async function checkVenueAvailability(location, startTime, endTime) {
  const response = await fetch('/api/events/venues/check-availability', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location,
      startTime,
      endTime
    })
  });
  
  const data = await response.json();
  
  if (!data.data.available) {
    console.log('Conflicts:', data.data.conflictingEvents);
    alert('Venue not available. Conflicting events: ' + 
          data.data.conflictingEvents.map(e => e.title).join(', '));
    return false;
  }
  
  return true;
}
```

### 3. Display Banner Upload
```javascript
function EventForm() {
  const [banners, setBanners] = useState([{ url: '', title: '' }]);

  const addBanner = () => {
    setBanners([...banners, { url: '', title: '' }]);
  };

  const updateBanner = (index, field, value) => {
    const newBanners = [...banners];
    newBanners[index][field] = value;
    setBanners(newBanners);
  };

  return (
    <div>
      <h3>Event Banners</h3>
      {banners.map((banner, idx) => (
        <div key={idx} className="banner-input">
          <input 
            type="url"
            placeholder="Banner URL"
            value={banner.url}
            onChange={(e) => updateBanner(idx, 'url', e.target.value)}
          />
          <input 
            type="text"
            placeholder="Banner Title (optional)"
            value={banner.title}
            onChange={(e) => updateBanner(idx, 'title', e.target.value)}
          />
        </div>
      ))}
      <button onClick={addBanner}>+ Add Banner</button>
    </div>
  );
}
```

---

## 📊 Database Impact

### New Index Created:
```javascript
eventSchema.index({ location: 1, startTime: 1, endTime: 1 });
```
This improves query performance for venue conflict checking.

### Migration Note:
If upgrading existing database:
```bash
# Mongoose will automatically create the index on next connection
# Or manually create via MongoDB:
db.events.createIndex({ location: 1, startTime: 1, endTime: 1 })
```

---

## 🔍 Error Handling Summary

| Error | Status | Message |
|-------|--------|---------|
| Past Date | 400 | Thời gian bắt đầu phải ở tương lai (tối thiểu 1 phút) |
| Time Conflict | 400 | Địa điểm này đã có sự kiện khác trong khoảng thời gian này |
| Invalid URL | 400 | Link banner phải là một URL hợp lệ |
| Invalid Date Format | 400 | Định dạng thời gian không hợp lệ (nên dùng chuẩn ISO) |
| Unauthorized | 403 | Bạn không có quyền chỉnh sửa sự kiện này |

---

## 🎯 Next Steps (Recommended)

1. **Frontend**: Implement venue dropdown with custom input
2. **Frontend**: Add real-time availability checking as user selects time
3. **Frontend**: Display banner preview before upload
4. **Backend**: Add venue management panel (admin can add/edit venues)
5. **Backend**: Add email notifications when venue conflicts occur
6. **Analytics**: Track most popular venues for better suggestions

---

**Last Updated**: March 11, 2026

