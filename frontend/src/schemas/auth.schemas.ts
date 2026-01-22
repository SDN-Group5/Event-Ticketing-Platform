import { z } from "zod";

/**
 * AUTH SCHEMAS - Validation schemas cho authentication forms
 * 
 * ZOD LÀ GÌ?
 * - Thư viện TypeScript-first schema validation
 * - Giúp validate data trước khi gửi lên server
 * - Tự động infer TypeScript types từ schema
 * - Có thể dùng với React Hook Form
 * 
 * TẠI SAO DÙNG ZOD?
 * 1. Type-safe: Tự động tạo TypeScript types
 * 2. Runtime validation: Validate data khi runtime (không chỉ compile-time)
 * 3. Error messages: Tự động tạo error messages rõ ràng
 * 4. Composable: Có thể combine nhiều schemas lại
 * 5. Works với React Hook Form: Dùng zodResolver để integrate
 * 
 * CÁCH HOẠT ĐỘNG:
 * 1. Định nghĩa schema với z.object({...})
 * 2. Validate data: schema.parse(data) hoặc schema.safeParse(data)
 * 3. Infer type: type MyType = z.infer<typeof mySchema>
 * 4. Dùng với React Hook Form: resolver: zodResolver(mySchema)
 */

/**
 * SignIn Schema
 * 
 * Validate form đăng nhập:
 * - email: Phải là email hợp lệ
 * - password: Bắt buộc, ít nhất 6 ký tự
 */
export const signInSchema = z.object({
  email: z
    .string()
    .min(1, "Email là bắt buộc") // Không được để trống
    .email("Email không hợp lệ"), // Phải là format email đúng

  password: z
    .string()
    .min(1, "Mật khẩu là bắt buộc") // Không được để trống
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"), // Tối thiểu 6 ký tự
});

// Tự động tạo TypeScript type từ schema
export type SignInFormData = z.infer<typeof signInSchema>;

/**
 * Register Schema
 * 
 * Validate form đăng ký:
 * - firstName, lastName: Bắt buộc, ít nhất 1 ký tự
 * - email: Phải là email hợp lệ
 * - password: Bắt buộc, ít nhất 6 ký tự
 * - confirmPassword: Phải khớp với password
 */
export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "Tên là bắt buộc")
      .min(2, "Tên phải có ít nhất 2 ký tự"),

    lastName: z
      .string()
      .min(1, "Họ là bắt buộc")
      .min(2, "Họ phải có ít nhất 2 ký tự"),

    email: z
      .string()
      .min(1, "Email là bắt buộc")
      .email("Email không hợp lệ"),

    password: z
      .string()
      .min(1, "Mật khẩu là bắt buộc")
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số"
      ),

    confirmPassword: z.string().min(1, "Xác nhận mật khẩu là bắt buộc"),
  })
  .refine(
    // refine: Custom validation logic
    // Kiểm tra confirmPassword có khớp với password không
    (data) => data.password === data.confirmPassword,
    {
      message: "Mật khẩu xác nhận không khớp",
      path: ["confirmPassword"], // Error sẽ hiển thị ở field confirmPassword
    }
  );

// Tự động tạo TypeScript type từ schema
export type RegisterFormData = z.infer<typeof registerSchema>;









