import React, { useState } from "react";

/**
 * Type định nghĩa cho SearchContext
 * Chứa tất cả thông tin liên quan đến tìm kiếm khách sạn
 */
export type SearchContext = {
  destination: string; // Điểm đến (tỉnh/thành phố)
  checkIn: Date; // Ngày nhận phòng
  checkOut: Date; // Ngày trả phòng
  adultCount: number; // Số người lớn
  childCount: number; // Số trẻ em
  hotelId: string; // ID khách sạn (nếu tìm kiếm từ trang chi tiết)
  saveSearchValues: (
    destination: string,
    checkIn: Date,
    checkOut: Date,
    adultCount: number,
    childCount: number
  ) => void; // Hàm lưu giá trị tìm kiếm
  clearSearchValues: () => void; // Hàm xóa tất cả giá trị tìm kiếm
};

/**
 * Context để quản lý state tìm kiếm khách sạn
 * Cho phép các component chia sẻ thông tin tìm kiếm
 */
export const SearchContext = React.createContext<SearchContext | undefined>(
  undefined
);

/**
 * Props cho SearchContextProvider
 */
type SearchContextProviderProps = {
  children: React.ReactNode;
};

/**
 * Provider component để cung cấp SearchContext cho toàn bộ ứng dụng
 * 
 * Chức năng:
 * - Lưu trữ thông tin tìm kiếm (điểm đến, ngày, số khách)
 * - Đồng bộ với sessionStorage để giữ state khi refresh trang
 * - Cung cấp functions để save/clear search values
 */
export const SearchContextProvider = ({
  children,
}: SearchContextProviderProps) => {
  // State: Điểm đến - Lấy từ sessionStorage hoặc rỗng
  const [destination, setDestination] = useState<string>(
    () => sessionStorage.getItem("destination") || ""
  );
  
  // State: Ngày nhận phòng - Lấy từ sessionStorage hoặc ngày hiện tại
  const [checkIn, setCheckIn] = useState<Date>(
    () =>
      new Date(sessionStorage.getItem("checkIn") || new Date().toISOString())
  );
  
  // State: Ngày trả phòng - Lấy từ sessionStorage hoặc ngày hiện tại
  const [checkOut, setCheckOut] = useState<Date>(
    () =>
      new Date(sessionStorage.getItem("checkOut") || new Date().toISOString())
  );
  
  // State: Số người lớn - Lấy từ sessionStorage hoặc mặc định 1
  const [adultCount, setAdultCount] = useState<number>(() =>
    parseInt(sessionStorage.getItem("adultCount") || "1")
  );
  
  // State: Số trẻ em - Lấy từ sessionStorage hoặc mặc định 0
  const [childCount, setChildCount] = useState<number>(() =>
    parseInt(sessionStorage.getItem("childCount") || "0")
  );
  
  // State: ID khách sạn - Lấy từ sessionStorage hoặc rỗng
  const [hotelId, setHotelId] = useState<string>(
    () => sessionStorage.getItem("hotelID") || ""
  );

  /**
   * Hàm lưu giá trị tìm kiếm vào state và sessionStorage
   * 
   * @param destination - Điểm đến (tỉnh/thành phố)
   * @param checkIn - Ngày nhận phòng
   * @param checkOut - Ngày trả phòng
   * @param adultCount - Số người lớn
   * @param childCount - Số trẻ em
   * @param hotelId - ID khách sạn (optional)
   * 
   * Lưu vào sessionStorage để giữ state khi refresh trang
   */
  const saveSearchValues = (
    destination: string,
    checkIn: Date,
    checkOut: Date,
    adultCount: number,
    childCount: number,
    hotelId?: string
  ) => {
    // Cập nhật state
    setDestination(destination);
    setCheckIn(checkIn);
    setCheckOut(checkOut);
    setAdultCount(adultCount);
    setChildCount(childCount);
    
    // Nếu có hotelId thì cập nhật
    if (hotelId) {
      setHotelId(hotelId);
    }

    // Lưu vào sessionStorage để persist khi refresh trang
    sessionStorage.setItem("destination", destination);
    sessionStorage.setItem("checkIn", checkIn.toISOString());
    sessionStorage.setItem("checkOut", checkOut.toISOString());
    sessionStorage.setItem("adultCount", adultCount.toString());
    sessionStorage.setItem("childCount", childCount.toString());

    // Lưu hotelId nếu có
    if (hotelId) {
      sessionStorage.setItem("hotelId", hotelId);
    }
  };

  /**
   * Hàm xóa tất cả giá trị tìm kiếm
   * 
   * Reset về giá trị mặc định và xóa khỏi sessionStorage
   * Đồng thời xóa cache danh sách địa điểm nếu quá 5 phút
   */
  const clearSearchValues = () => {
    // Reset state về giá trị mặc định
    setDestination("");
    setCheckIn(new Date());
    setCheckOut(new Date());
    setAdultCount(1);
    setChildCount(0);
    setHotelId("");

    // Xóa khỏi sessionStorage
    sessionStorage.removeItem("destination");
    sessionStorage.removeItem("checkIn");
    sessionStorage.removeItem("checkOut");
    sessionStorage.removeItem("adultCount");
    sessionStorage.removeItem("childCount");
    sessionStorage.removeItem("hotelId");

    // Xóa cache danh sách địa điểm nếu đã quá 5 phút
    const cacheTime = localStorage.getItem("hotelPlacesTime");
    if (cacheTime) {
      const now = Date.now();
      // Nếu cache cũ hơn 5 phút thì xóa
      if (now - parseInt(cacheTime) > 5 * 60 * 1000) {
        localStorage.removeItem("hotelPlaces");
        localStorage.removeItem("hotelPlacesTime");
      }
    }
  };

  // Cung cấp context value cho các component con
  return (
    <SearchContext.Provider
      value={{
        destination,
        checkIn,
        checkOut,
        adultCount,
        childCount,
        hotelId,
        saveSearchValues,
        clearSearchValues,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

// ...existing code...
