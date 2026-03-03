/**
 * Auth API Service for Mobile
 * Handles all authentication-related API calls
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: string;
  message: string;
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'customer' | 'organizer' | 'staff' | 'admin';
  };
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  requiresEmailVerification: boolean;
  email: string;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface VerifyEmailResponse {
  message: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface VerifyResetCodeRequest {
  email: string;
  code: string;
}

export interface VerifyResetCodeResponse {
  message: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface ValidateTokenResponse {
  userId: string;
  role: string;
}

/**
 * Make API request with error handling
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || `API Error: ${response.status}`);
    }

    return data as T;
  } catch (error: any) {
    if (error.message) {
      throw error;
    }
    throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
  }
}

/**
 * Make authenticated API request with token
 */
async function authenticatedRequest<T>(
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  return apiRequest<T>(endpoint, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
}

export const AuthAPI = {
  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    return apiRequest<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return apiRequest<RegisterResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Verify email with OTP code
   */
  async verifyEmail(data: VerifyEmailRequest): Promise<VerifyEmailResponse> {
    return apiRequest<VerifyEmailResponse>('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Resend verification code
   */
  async resendVerification(email: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>('/api/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Request password reset
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    return apiRequest<ForgotPasswordResponse>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Verify reset code
   */
  async verifyResetCode(data: VerifyResetCodeRequest): Promise<VerifyResetCodeResponse> {
    return apiRequest<VerifyResetCodeResponse>('/api/auth/verify-reset-code', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Reset password with code
   */
  async resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    return apiRequest<ResetPasswordResponse>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Validate token
   */
  async validateToken(token: string): Promise<ValidateTokenResponse> {
    return authenticatedRequest<ValidateTokenResponse>('/api/auth/validate-token', token, {
      method: 'GET',
    });
  },

  /**
   * Logout (client-side only, token removed from storage)
   */
  async logout(): Promise<{ message: string }> {
    return apiRequest<{ message: string }>('/api/auth/logout', {
      method: 'POST',
    });
  },
};
