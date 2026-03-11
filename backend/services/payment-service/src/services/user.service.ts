import axios from 'axios';

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:4001';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
}

/**
 * Fetch user information from auth service
 */
export const getUserFromAuthService = async (userId: string): Promise<User | null> => {
  try {
    // Call the public endpoint GET /api/users/{userId} to get user data
    const response = await axios.get(`${AUTH_SERVICE_URL}/api/users/${userId}`, {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Handle both response formats: { data: {...} } and { success: true, data: {...} }
    const userData = response.data.data || response.data;
    
    if (!userData) {
      return null;
    }

    return {
      id: userData._id || userId,
      email: userData.email,
      firstName: userData.firstName || 'Khách hàng',
      lastName: userData.lastName || '',
      phone: userData.phone,
      avatar: userData.avatar,
    };
  } catch (err: any) {
    console.warn(`[getUserFromAuthService] Failed to fetch user ${userId}:`, err?.message);
    return null;
  }
};
