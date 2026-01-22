import { useContext } from "react";
import { SearchContext } from "../contexts/SearchContext";
import type { SearchContext as SearchContextType } from "../contexts/SearchContext";

/**
 * Hook tùy chỉnh để sử dụng SearchContext
 * 
 * @returns {SearchContextType} Context chứa thông tin tìm kiếm:
 *   - destination: Điểm đến (tỉnh/thành phố)
 *   - checkIn: Ngày nhận phòng
 *   - checkOut: Ngày trả phòng
 *   - adultCount: Số người lớn
 *   - childCount: Số trẻ em
 *   - hotelId: ID khách sạn (nếu có)
 *   - saveSearchValues: Hàm lưu giá trị tìm kiếm
 *   - clearSearchValues: Hàm xóa giá trị tìm kiếm
 * 
 * @example
 * const { destination, checkIn, saveSearchValues } = useSearchContext();
 */
const useSearchContext = () => {
  // Lấy context từ SearchContextProvider
  const context = useContext(SearchContext);
  
  // Trả về context với type đã được định nghĩa
  return context as SearchContextType;
};

export default useSearchContext;
