import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

/**
 * ErrorBoundary Component
 * 
 * MỤC ĐÍCH:
 * - Bắt và xử lý lỗi JavaScript trong React component tree
 * - Hiển thị UI thân thiện thay vì crash toàn bộ app
 * - Log lỗi để developer debug
 * 
 * CÁCH HOẠT ĐỘNG:
 * 1. React Error Boundary chỉ bắt lỗi trong:
 *    - Render methods
 *    - Lifecycle methods
 *    - Constructors của components bên dưới
 * 
 * 2. KHÔNG bắt lỗi trong:
 *    - Event handlers (phải dùng try-catch)
 *    - Async code (setTimeout, promises)
 *    - Server-side rendering
 *    - Lỗi trong chính ErrorBoundary component
 * 
 * CÁCH SỬ DỤNG:
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 */

interface Props {
    children: ReactNode; // Các component con sẽ được bảo vệ
    fallback?: ReactNode; // UI tùy chỉnh khi có lỗi (optional)
}

interface State {
    hasError: boolean; // Có lỗi xảy ra không?
    error: Error | null; // Thông tin lỗi
    errorInfo: ErrorInfo | null; // Stack trace và component stack
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);

        // Khởi tạo state: chưa có lỗi
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    /**
     * getDerivedStateFromError
     * 
     * Được gọi khi component con throw error
     * Cập nhật state để hiển thị fallback UI
     * 
     * @param error - Lỗi được throw
     * @returns State mới với hasError = true
     */
    static getDerivedStateFromError(error: Error): State {
        // Cập nhật state để render fallback UI
        return {
            hasError: true,
            error,
            errorInfo: null,
        };
    }

    /**
     * componentDidCatch
     * 
     * Được gọi sau khi getDerivedStateFromError
     * Dùng để log lỗi, gửi lên error tracking service (Sentry, etc.)
     * 
     * @param error - Lỗi được throw
     * @param errorInfo - Thông tin về component stack
     */
    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log lỗi ra console (trong production có thể gửi lên Sentry, LogRocket, etc.)
        console.error("❌ ErrorBoundary caught an error:", error);
        console.error("📍 Component stack:", errorInfo.componentStack);

        // Cập nhật state với errorInfo để hiển thị chi tiết
        this.setState({
            errorInfo,
        });

        // TODO: Có thể gửi lỗi lên error tracking service
        // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
    }

    /**
     * handleReset
     * 
     * Reset ErrorBoundary về trạng thái ban đầu
     * Cho phép user thử lại
     */
    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    /**
     * handleReload
     * 
     * Reload toàn bộ trang
     */
    handleReload = () => {
        window.location.reload();
    };

    render() {
        // Nếu có lỗi → hiển thị fallback UI
        if (this.state.hasError) {
            // Nếu có custom fallback → dùng nó
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Nếu không → hiển thị default error UI
            return (
                <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
                    <Card className="max-w-2xl w-full border-4 border-red-500">
                        <CardHeader className="bg-red-50">
                            <CardTitle className="flex items-center gap-3 text-red-800">
                                <AlertTriangle className="h-6 w-6" />
                                Đã xảy ra lỗi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                            {/* Thông báo lỗi */}
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-gray-700 font-medium mb-2">
                                    Rất tiếc, đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.
                                </p>
                                {this.state.error && (
                                    <details className="mt-3">
                                        <summary className="cursor-pointer text-sm text-gray-600 font-semibold">
                                            Chi tiết lỗi (dành cho developer)
                                        </summary>
                                        <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
                                            {this.state.error.toString()}
                                            {this.state.errorInfo?.componentStack && (
                                                <div className="mt-2 text-gray-600">
                                                    {this.state.errorInfo.componentStack}
                                                </div>
                                            )}
                                        </pre>
                                    </details>
                                )}
                            </div>

                            {/* Action buttons */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button
                                    onClick={this.handleReset}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                                >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Thử lại
                                </Button>
                                <Button
                                    onClick={this.handleReload}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Tải lại trang
                                </Button>
                                <Button
                                    onClick={() => (window.location.href = "/")}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    <Home className="h-4 w-4 mr-2" />
                                    Về trang chủ
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        // Nếu không có lỗi → render children bình thường
        return this.props.children;
    }
}

export default ErrorBoundary;

