import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface AdvancedSearchState {
  // Basic search
  destination: string;
  checkIn: Date;
  checkOut: Date;
  adultCount: number;
  childCount: number;
  
  // Advanced filters
  minPrice: string;
  maxPrice: string;
  starRating: string;
  hotelType: string;
  facilities: string[];
  sortBy: string;
  radius: string;
  instantBooking: boolean;
  freeCancellation: boolean;
  breakfast: boolean;
  wifi: boolean;
  parking: boolean;
  pool: boolean;
  gym: boolean;
  spa: boolean;
  
  // UI state
  showAdvanced: boolean;
  showDatePicker: boolean;
  showDropdown: boolean;
  
  // Actions
  setDestination: (destination: string) => void;
  setCheckIn: (checkIn: Date) => void;
  setCheckOut: (checkOut: Date) => void;
  setAdultCount: (count: number) => void;
  setChildCount: (count: number) => void;
  setMinPrice: (price: string) => void;
  setMaxPrice: (price: string) => void;
  setStarRating: (rating: string) => void;
  setHotelType: (type: string) => void;
  setFacilities: (facilities: string[]) => void;
  toggleFacility: (facilityId: string) => void;
  setSortBy: (sortBy: string) => void;
  setRadius: (radius: string) => void;
  setShowAdvanced: (show: boolean) => void;
  setShowDatePicker: (show: boolean) => void;
  setShowDropdown: (show: boolean) => void;
  updateDateRange: (start: Date | null, end: Date | null) => void;
  resetSearch: () => void;
}

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

// đoạn này nhằm mục đích để xử lý khi chọn date range
// nếu chọn start date sau end date hiện tại, reset end date
// nếu chọn end date sau start date hiện tại, reset start date
// nếu chọn start date sau end date hiện tại, reset end date
export const useAdvancedSearchStore = create<AdvancedSearchState>()(
  devtools(
    (set, get) => ({
      // Initial state
      destination: "",
      checkIn: today,
      checkOut: tomorrow,
      adultCount: 1,
      childCount: 0,
      minPrice: "",
      maxPrice: "",
      starRating: "",
      hotelType: "",
      facilities: [],
      sortBy: "relevance",
      radius: "50",
      instantBooking: false,
      freeCancellation: false,
      breakfast: false,
      wifi: false,
      parking: false,
      pool: false,
      gym: false,
      spa: false,
      showAdvanced: false,
      showDatePicker: false,
      showDropdown: false,

      // Actions
      setDestination: (destination) => set({ destination }),
      // setCheckIn: Chỉ set checkIn, không tự động reset checkOut
      // Logic validation sẽ được xử lý trong updateDateRange
      setCheckIn: (checkIn) => set({ checkIn }),
      // setCheckOut: Chỉ set checkOut, không tự động reset checkIn
      // Logic validation sẽ được xử lý trong updateDateRange
      setCheckOut: (checkOut) => set({ checkOut }),
      setAdultCount: (count) => set({ adultCount: count }),
      setChildCount: (count) => set({ childCount: count }),
      setMinPrice: (price) => set({ minPrice: price }),
      setMaxPrice: (price) => set({ maxPrice: price }),
      setStarRating: (rating) => set({ starRating: rating }),
      setHotelType: (type) => set({ hotelType: type }),
      setFacilities: (facilities) => set({ facilities }),
      toggleFacility: (facilityId) => {
        const state = get();
        const facilities = state.facilities.includes(facilityId)
          ? state.facilities.filter((f) => f !== facilityId)
          : [...state.facilities, facilityId];
        set({ facilities });
      },
      setSortBy: (sortBy) => set({ sortBy }),
      setRadius: (radius) => set({ radius }),
      setShowAdvanced: (show) => set({ showAdvanced: show }),
      setShowDatePicker: (show) => set({ showDatePicker: show }),
      setShowDropdown: (show) => set({ showDropdown: show }),
      
      // Update date range với validation - Logic giống Agoda
      // Clean code: Chỉ chọn 1 ngày khi click lần đầu, không tự động set checkOut
      updateDateRange: (start, end) => {
        // Reset time về 00:00:00 để so sánh chính xác
        const normalizeDate = (date: Date) => {
          const normalized = new Date(date);
          normalized.setHours(0, 0, 0, 0);
          return normalized;
        };
        
        // Case 1: Có cả start và end → Đã chọn xong cả 2 ngày (click lần 2)
        if (start && end) {
          const normalizedStart = normalizeDate(start);
          const normalizedEnd = normalizeDate(end);
          
          // Validate: end phải sau start
          if (normalizedEnd > normalizedStart) {
            set({ checkIn: normalizedStart, checkOut: normalizedEnd, showDatePicker: false });
          }
          // Nếu end <= start → Không hợp lệ, không làm gì
          return;
        }
        
        // Case 2: Chỉ có start → Đang chọn ngày nhận phòng (click lần 1)
        // QUAN TRỌNG: CHỈ set checkIn, KHÔNG tự động set checkOut
        if (start) {
          const normalizedStart = normalizeDate(start);
          // Chỉ update checkIn, giữ nguyên checkOut hiện tại (hoặc có thể set null)
          // KHÔNG tự động set checkOut = start + 1 để tránh chọn 2 ngày liên tục
          set({ checkIn: normalizedStart });
          // KHÔNG đóng picker để cho phép chọn end date
          return;
        }
        
        // Case 3: Chỉ có end (trường hợp đặc biệt)
        if (end) {
          const currentState = get();
          const normalizedEnd = normalizeDate(end);
          const normalizedCheckIn = normalizeDate(currentState.checkIn);
          
          // Nếu end > checkIn → Set làm checkOut và đóng picker
          if (normalizedEnd > normalizedCheckIn) {
            set({ checkOut: normalizedEnd, showDatePicker: false });
          } else {
            // Nếu end <= checkIn → Set làm checkIn mới, không set checkOut
            set({ checkIn: normalizedEnd });
          }
        }
      },
      
      resetSearch: () => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        set({
          destination: "",
          checkIn: today,
          checkOut: tomorrow,
          adultCount: 1,
          childCount: 0,
          minPrice: "",
          maxPrice: "",
          starRating: "",
          hotelType: "",
          facilities: [],
          sortBy: "relevance",
          radius: "50",
          instantBooking: false,
          freeCancellation: false,
          breakfast: false,
          wifi: false,
          parking: false,
          pool: false,
          gym: false,
          spa: false,
          showAdvanced: false,
          showDatePicker: false,
          showDropdown: false,
        });
      },
    }),
    { name: "AdvancedSearchStore" }
  )
);

