# 🔄 Code Changes Summary

## Modified Files

### 1️⃣ Event.js (Model)
**Location**: `backend/services/events-service/src/models/Event.js`

**Changes**:
```javascript
// ❌ BEFORE: Simple string array
banners: [{ type: String }]

// ✅ AFTER: Rich object structure
banners: [{
    url: { type: String, required: true },
    title: { type: String },
    uploadedAt: { type: Date, default: Date.now }
}]
```

**New Validation**:
```javascript
// Date cannot be in the past
startTime: { 
    validate: {
        validator: function(value) {
            return value > new Date();
        },
        message: 'Thời gian bắt đầu phải lớn hơn thời gian hiện tại'
    }
}

// EndTime must be after StartTime
endTime: {
    validate: {
        validator: function(value) {
            if (!value) return true;
            return value > this.startTime;
        },
        message: 'Thời gian kết thúc phải sau thời gian bắt đầu'
    }
}
```

**New Methods**:
```javascript
// Static method to check time conflicts
Event.hasTimeConflict(location, startTime, endTime, excludeEventId)

// Static method to get popular venues
Event.getSuggestedVenues(limit)
```

**New Index**:
```javascript
eventSchema.index({ location: 1, startTime: 1, endTime: 1 });
```

---

### 2️⃣ event.validation.js
**Location**: `backend/services/events-service/src/validations/event.validation.js`

**Changes**:
```javascript
// ❌ BEFORE
location: Joi.string().required()

// ✅ AFTER
location: Joi.string().min(3).required()

// ❌ BEFORE
startTime: Joi.date().iso().greater('now').required()

// ✅ AFTER
startTime: Joi.date().iso().greater('now').required().messages({
    'date.greater': 'Thời gian bắt đầu phải ở tương lai (tối thiểu 1 phút)',
    // ... more specific messages
})

// ❌ BEFORE
endTime: Joi.date().iso().greater(Joi.ref('startTime')).optional()

// ✅ AFTER
endTime: Joi.date().iso().required().messages({
    'any.required': 'Thời gian kết thúc là bắt buộc',
    'date.format': 'Định dạng thời gian không hợp lệ'
})

// ❌ BEFORE
banners: Joi.array().items(Joi.string().uri()).optional()

// ✅ AFTER
banners: Joi.alternatives(
    Joi.array().items(
        Joi.object({
            url: Joi.string().uri().required(),
            title: Joi.string().optional()
        })
    ),
    Joi.array().items(Joi.string().uri())
).optional()
```

**New Schema**:
```javascript
export const checkTimeSlotSchema = Joi.object({
    location: Joi.string().required(),
    startTime: Joi.date().iso().required(),
    endTime: Joi.date().iso().greater(Joi.ref('startTime')).required()
});
```

---

### 3️⃣ event.service.js
**Location**: `backend/services/events-service/src/services/event.service.js`

**Enhanced createNewEvent()**:
```javascript
// ❌ BEFORE: Only basic time validation
if (new Date(eventData.startTime) >= new Date(eventData.endTime)) {
    throw new Error('...');
}

// ✅ AFTER: Full date and conflict validation
const startTime = new Date(eventData.startTime);
const now = new Date();
if (startTime <= now) {
    throw new Error('Thời gian bắt đầu phải ở tương lai...');
}

// Check for time conflicts
const hasConflict = await Event.hasTimeConflict(
    eventData.location,
    new Date(eventData.startTime),
    new Date(eventData.endTime)
);
if (hasConflict) {
    throw new Error('Địa điểm này đã có sự kiện khác...');
}

// Normalize banners format
let banners = eventData.banners || [];
if (banners.length > 0 && typeof banners[0] === 'string') {
    banners = banners.map(url => ({ url, title: '' }));
}
```

**Enhanced modifyEvent()**:
```javascript
// ✅ AFTER: Added comprehensive validation
if (updateData.startTime && updateData.endTime) {
    // Validate dates
    if (new Date(updateData.startTime) >= new Date(updateData.endTime)) {
        throw new Error('...');
    }
    
    // Validate not in past
    const startTime = new Date(updateData.startTime);
    if (startTime <= now) {
        throw new Error('...');
    }
    
    // Check for conflicts (excluding current event)
    const hasConflict = await Event.hasTimeConflict(
        location,
        new Date(updateData.startTime),
        new Date(updateData.endTime),
        eventId
    );
    if (hasConflict) {
        throw new Error('...');
    }
}
```

**New Functions**:
```javascript
// Get venues by popularity or defaults
export const getSuggestedVenues = async (limit = 5) => {
    const venues = await Event.getSuggestedVenues(limit);
    return venues && venues.length > 0 ? venues : getDefaultVenues();
}

export const getDefaultVenues = () => {
    return [
        'Nhà thi đấu Phú Thọ - TP.HCM',
        'Sân vận động Mỹ Đình - Hà Nội',
        // ... 6 more venues
    ];
}

// Check availability with conflict details
export const checkTimeSlotAvailability = async (location, startTime, endTime) => {
    const hasConflict = await Event.hasTimeConflict(location, startTime, endTime);
    
    if (hasConflict) {
        const conflicts = await Event.find({
            location,
            status: { $ne: 'cancelled' },
            $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }]
        }).select('title startTime endTime');
        
        return {
            available: false,
            conflictingEvents: conflicts
        };
    }
    
    return {
        available: true,
        conflictingEvents: []
    };
}
```

---

### 4️⃣ event.controller.js
**Location**: `backend/services/events-service/src/controllers/event.controller.js`

**New Endpoints**:
```javascript
// Get venue suggestions
export const getSuggestedVenues = async (req, res) => {
    const { limit = 5 } = req.query;
    const venues = await eventService.getSuggestedVenues(parseInt(limit));
    
    res.status(200).json({
        success: true,
        count: venues.length,
        data: venues
    });
}

// Check venue availability
export const checkVenueAvailability = async (req, res) => {
    const { location, startTime, endTime } = req.body;
    
    if (!location || !startTime || !endTime) {
        return res.status(400).json({
            success: false,
            message: 'location, startTime, and endTime are required'
        });
    }
    
    const availability = await eventService.checkTimeSlotAvailability(
        location,
        new Date(startTime),
        new Date(endTime)
    );
    
    res.status(200).json({
        success: true,
        data: availability
    });
}
```

---

### 5️⃣ event.routes.js
**Location**: `backend/services/events-service/src/routes/event.routes.js`

**New Routes**:
```javascript
// ✅ AFTER: Added public venue endpoints
router.get(
    '/venues/suggested',
    eventController.getSuggestedVenues
);

router.post(
    '/venues/check-availability',
    eventController.checkVenueAvailability
);
```

---

## 📊 Data Structure Changes

### Event Document - Before vs After

**BEFORE**:
```json
{
    "organizerId": "123",
    "title": "Concert",
    "location": "Venue A",
    "startTime": "2026-04-15T10:00:00Z",
    "endTime": "2026-04-15T15:00:00Z",
    "banners": [
        "https://example.com/banner1.jpg",
        "https://example.com/banner2.jpg"
    ],
    "status": "draft"
}
```

**AFTER**:
```json
{
    "organizerId": "123",
    "title": "Concert",
    "location": "Venue A",
    "startTime": "2026-04-15T10:00:00Z",
    "endTime": "2026-04-15T15:00:00Z",
    "banners": [
        {
            "url": "https://example.com/banner1.jpg",
            "title": "Main Banner",
            "uploadedAt": "2026-03-11T10:30:00Z"
        },
        {
            "url": "https://example.com/banner2.jpg",
            "title": "Secondary Banner",
            "uploadedAt": "2026-03-11T10:31:00Z"
        }
    ],
    "status": "draft",
    "publishedBy": null,
    "publishedAt": null
}
```

---

## 🔄 API Changes

### New Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/events/venues/suggested` | None | Get popular/default venues |
| POST | `/api/events/venues/check-availability` | None | Check time slot conflicts |

### Updated Endpoints

| Method | Endpoint | Changes |
|--------|----------|---------|
| POST | `/api/events` | Now validates date not in past, checks time conflicts |
| PUT | `/api/events/:id` | Now validates date not in past, checks time conflicts |

---

## ✨ Features Added

| Feature | Implemented In | Benefits |
|---------|----------------|----------|
| Date not in past validation | Model + Service + Validation | Prevents invalid events |
| Time slot conflict detection | Model (hasTimeConflict) | Prevents overlapping events |
| Enhanced banner objects | Model + Validation | Rich banner metadata |
| Venue suggestions | Service + Controller | Better UX for organizers |
| Venue availability check | Service + Controller + Routes | Real-time conflict info |
| Database optimization | Model (Index) | Faster queries |

---

## 🧪 Breaking Changes

⚠️ **POTENTIAL BREAKING CHANGES**: None for existing events, but:

1. **Banner Format Change**: If frontend sends string array, it will be auto-converted
2. **Date Validation**: Events with past start dates will now be rejected
3. **Conflict Checking**: Overlapping events at same venue will be rejected

---

## 📈 Performance Impact

| Operation | Before | After | Notes |
|-----------|--------|-------|-------|
| Create Event | Direct save | +1 DB query | Checks conflicts |
| Update Event | Direct update | +1 DB query | Checks conflicts |
| Get Venues | N/A | Aggregation | Counts by location |
| Check Availability | N/A | 1 query | Fast with index |

---

## 🔒 Security

✅ Authorization unchanged
✅ Conflict checking prevents venue manipulation
✅ Date validation prevents backdating events
✅ URL validation for banners prevents injection

---

