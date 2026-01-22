// Common TypeScript types

export type UserRole = 'customer' | 'receptionist' | 'manager';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

export interface SearchData {
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}






