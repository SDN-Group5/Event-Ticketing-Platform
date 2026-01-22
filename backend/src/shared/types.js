// "use strict": Bật chế độ strict mode trong JavaScript
// Strict mode giúp:
// - Bắt lỗi sớm hơn (ví dụ: dùng biến chưa khai báo)
// - Tăng hiệu suất (JavaScript engine có thể tối ưu tốt hơn)
// - Ngăn một số tính năng không an toàn
"use strict";

// Object.defineProperty: Định nghĩa một property mới cho object exports
// exports: Object chứa các module được export (CommonJS module system)
// "__esModule": Tên property (dấu hiệu đặc biệt)
// { value: true }: Giá trị của property là true
// 
// Mục đích: Đánh dấu module này là ES Module (ECMAScript Module)
// Tại sao cần?: Khi TypeScript compile sang JavaScript, nó cần đánh dấu để:
// - Các tool khác biết đây là ES Module
// - Có thể import/export đúng cách
// - Tương thích với cả CommonJS và ES Module
Object.defineProperty(exports, "__esModule", { value: true });
