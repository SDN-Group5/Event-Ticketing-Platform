# 🚀 ROADMAP - React Frontend Development

## ✅ ĐÁNH GIÁ HIỆN TRẠNG

### ✅ ĐÃ CÓ:
- [x] React 18 + TypeScript + Vite setup
- [x] Tailwind CSS configured
- [x] React Router setup
- [x] React Query (v3) - đang dùng
- [x] API Client với Axios
- [x] Context API (AppContext, SearchContext)
- [x] Một số pages: Home, Search, Detail, Booking, MyBookings, Register, SignIn
- [x] Components: Header, Footer, Hero, SearchBar, etc.
- [x] Forms: BookingForm, GuestInfoForm, ManageHotelForm

### ⚠️ CẦN BỔ SUNG:
- [ ] **State Management**: Rule nói dùng Zustand nhưng đang dùng Context
- [ ] **React Query**: Đang dùng v3, nên upgrade lên @tanstack/react-query v5
- [ ] **Dashboards**: Chưa có Owner/Manager/Receptionist dashboards
- [ ] **Service Request**: Chưa có page (UC 8)
- [ ] **Check-in/Check-out**: Chưa có pages (UC 9, 10)
- [ ] **Promotions Management**: Chưa có (UC 12)
- [ ] **Employees Management**: Chưa có (UC 13)
- [ ] **PayOS Integration**: Chưa tích hợp (UC 5)
- [ ] **Role-based Routing**: Chưa có protection theo role
- [ ] **Neo Brutalism Styling**: Chưa apply cho dashboards

---

## 🎯 CÓ THỂ BẮT ĐẦU LÀM NGAY!

### ✅ ĐIỀU KIỆN ĐỦ ĐỂ BẮT ĐẦU:
1. ✅ Backend APIs đã sẵn sàng (14 use cases)
2. ✅ Frontend structure đã có
3. ✅ Basic pages đã có
4. ✅ API client đã setup

---

## 📋 ROADMAP CHI TIẾT

### PHASE 1: SETUP & FOUNDATION (1-2 ngày)

#### 1.1 Upgrade Dependencies
```bash
# Upgrade React Query
npm install @tanstack/react-query@latest

# Install Zustand (theo rule.md)
npm install zustand

# Install Zod (theo rule.md)
npm install zod
```

#### 1.2 Setup Zustand Store
```typescript
// src/stores/authStore.ts
// src/stores/userStore.ts
// src/stores/configStore.ts
```

#### 1.3 Migrate Context → Zustand
- [ ] Migrate AppContext → Zustand store
- [ ] Update components sử dụng Context
- [ ] Test authentication flow

#### 1.4 Setup React Query Provider
```typescript
// Update main.tsx với @tanstack/react-query
```

---

### PHASE 2: DASHBOARDS (3-5 ngày)

#### 2.1 Owner Dashboard (UC 11, 12, 13, 14)
- [ ] Create `/dashboard/owner` route
- [ ] Stats Cards component (Revenue, Bookings, Hotels, Employees)
- [ ] Revenue Chart (Recharts)
- [ ] Bookings Chart (Pie/Bar)
- [ ] My Hotels section (UC 11)
- [ ] Employees Management table (UC 13)
- [ ] Promotions Management table (UC 12)
- [ ] Analytics section (UC 14)
- [ ] Apply Neo Brutalism styling

#### 2.2 Manager Dashboard (UC 7, 11, 12, 13, 14)
- [ ] Create `/dashboard/manager` route
- [ ] Today's Overview stats
- [ ] Bookings Management table (UC 7)
- [ ] Rooms Management grid
- [ ] Promotions Management (UC 12)
- [ ] Employees Management (UC 13)
- [ ] Analytics (UC 14)

#### 2.3 Receptionist Dashboard (UC 7, 8, 9, 10)
- [ ] Create `/dashboard/receptionist` route
- [ ] Today's Tasks stats
- [ ] All Bookings table (UC 7)
- [ ] Check-in Operations (UC 9)
- [ ] Check-out Operations (UC 10)
- [ ] Service Requests table (UC 8)

#### 2.4 Sidebar Navigation Component
- [ ] Create Sidebar component với role-based menu
- [ ] Active state styling
- [ ] Responsive (mobile → hamburger menu)

---

### PHASE 3: FEATURES (5-7 ngày)

#### 3.1 Service Request (UC 8)
- [ ] Create `/service-request` page hoặc modal
- [ ] Form với Service Type, Description, Price
- [ ] List service requests
- [ ] Update status (Pending → In Progress → Completed)

#### 3.2 Check-in/Check-out (UC 9, 10)
- [ ] Create `/dashboard/receptionist/check-in` page
- [ ] Create `/dashboard/receptionist/check-out` page
- [ ] Form để nhập room number
- [ ] Display booking details
- [ ] Confirm check-in/check-out
- [ ] Update booking status

#### 3.3 Promotions Management (UC 12)
- [ ] Create `/dashboard/owner/promotions` page
- [ ] Create `/dashboard/manager/promotions` page
- [ ] CRUD form cho promotions
- [ ] List promotions với filters
- [ ] Apply promotion khi booking

#### 3.4 Employees Management (UC 13)
- [ ] Create `/dashboard/owner/employees` page
- [ ] Create `/dashboard/manager/employees` page
- [ ] CRUD form cho employees
- [ ] List employees với filters
- [ ] Activate/Deactivate employees
- [ ] Change password functionality

---

### PHASE 4: PAYMENT & INTEGRATION (2-3 ngày)

#### 4.1 PayOS Integration (UC 5)
- [ ] Replace Stripe với PayOS
- [ ] Create payment link
- [ ] Handle PayOS redirect
- [ ] Payment success/cancel pages
- [ ] Webhook handling (backend)

#### 4.2 Booking Flow Enhancement
- [ ] Apply promotion code
- [ ] Calculate total với promotion
- [ ] Payment confirmation
- [ ] Email notification (optional)

---

### PHASE 5: ROLE-BASED ACCESS (1-2 ngày)

#### 5.1 Route Protection
- [ ] Create `ProtectedRoute` component
- [ ] Role-based route protection
- [ ] Redirect based on role after login

#### 5.2 Permission Checks
- [ ] Check permissions trong components
- [ ] Hide/show buttons based on role
- [ ] Disable actions based on permissions

---

### PHASE 6: STYLING & UX (2-3 ngày)

#### 6.1 Neo Brutalism Styling
- [ ] Apply cho dashboards
- [ ] Bold borders (3px)
- [ ] High contrast colors
- [ ] Square corners (0px radius)
- [ ] No shadows, no gradients

#### 6.2 Responsive Design
- [ ] Mobile breakpoints
- [ ] Tablet breakpoints
- [ ] Sidebar → Hamburger menu
- [ ] Tables → Cards on mobile

#### 6.3 Loading States
- [ ] Skeleton loaders
- [ ] Spinners
- [ ] Error states
- [ ] Empty states

---

## 🎨 COMPONENTS CẦN TẠO

### Dashboard Components:
- [ ] `StatsCard.tsx` - Reusable stats card
- [ ] `Sidebar.tsx` - Navigation sidebar
- [ ] `DashboardLayout.tsx` - Layout cho dashboards
- [ ] `DataTable.tsx` - Reusable table component
- [ ] `ChartCard.tsx` - Wrapper cho charts

### Feature Components:
- [ ] `ServiceRequestForm.tsx`
- [ ] `CheckInForm.tsx`
- [ ] `CheckOutForm.tsx`
- [ ] `PromotionForm.tsx`
- [ ] `EmployeeForm.tsx`

### UI Components (Shadcn):
- [ ] `select.tsx` - Select dropdown
- [ ] `table.tsx` - Table component
- [ ] `tabs.tsx` - Tabs component
- [ ] `sheet.tsx` - Side sheet (mobile menu)

---

## 📁 FOLDER STRUCTURE ĐỀ XUẤT

```
frontend/src/
├── stores/              # Zustand stores
│   ├── authStore.ts
│   ├── userStore.ts
│   └── configStore.ts
├── pages/
│   ├── dashboard/
│   │   ├── owner/
│   │   │   ├── OwnerDashboard.tsx
│   │   │   ├── HotelsSection.tsx
│   │   │   ├── EmployeesSection.tsx
│   │   │   ├── PromotionsSection.tsx
│   │   │   └── AnalyticsSection.tsx
│   │   ├── manager/
│   │   │   └── ManagerDashboard.tsx
│   │   └── receptionist/
│   │       ├── ReceptionistDashboard.tsx
│   │       ├── CheckInPage.tsx
│   │       └── CheckOutPage.tsx
│   ├── service-request/
│   │   └── ServiceRequestPage.tsx
│   └── ... (existing pages)
├── components/
│   ├── dashboard/
│   │   ├── StatsCard.tsx
│   │   ├── Sidebar.tsx
│   │   ├── DataTable.tsx
│   │   └── ChartCard.tsx
│   └── ... (existing components)
└── hooks/
    ├── useAuth.ts
    ├── useRole.ts
    └── ... (existing hooks)
```

---

## 🚀 BẮT ĐẦU TỪ ĐÂU?

### Option 1: Bắt đầu với Dashboards (Recommended)
1. Setup Zustand store
2. Create Owner Dashboard
3. Create Manager Dashboard
4. Create Receptionist Dashboard
5. Add features từng bước

### Option 2: Bắt đầu với Features
1. Service Request page
2. Check-in/Check-out pages
3. Promotions Management
4. Employees Management

### Option 3: Setup Foundation trước
1. Upgrade dependencies
2. Setup Zustand
3. Migrate Context → Zustand
4. Setup React Query v5
5. Rồi mới làm features

---

## ✅ CHECKLIST TRƯỚC KHI BẮT ĐẦU

- [ ] Backend APIs đã test xong
- [ ] Environment variables đã setup (.env)
- [ ] API base URL đã config đúng
- [ ] Đã đọc rule.md để hiểu requirements
- [ ] Đã xem wireframe (nếu có)
- [ ] Đã setup development environment

---

## 🎯 PRIORITY ORDER

### High Priority (Làm trước):
1. ✅ Owner Dashboard
2. ✅ Manager Dashboard
3. ✅ Receptionist Dashboard
4. ✅ Service Request
5. ✅ Check-in/Check-out

### Medium Priority:
6. Promotions Management
7. Employees Management
8. PayOS Integration

### Low Priority:
9. Analytics enhancements
10. Advanced filters
11. Export features

---

## 📝 NOTES

- **State Management**: Nên migrate Context → Zustand để theo rule.md
- **React Query**: Nên upgrade lên v5 (@tanstack/react-query)
- **Styling**: Apply Neo Brutalism cho dashboards
- **Testing**: Test từng feature sau khi làm xong
- **API**: Đảm bảo backend APIs đã sẵn sàng

---

**BẮT ĐẦU NGAY ĐƯỢC! Chọn một option và bắt đầu code! 🚀**



