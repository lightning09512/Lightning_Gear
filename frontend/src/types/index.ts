// ===== API Response Types =====
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    products?: T[];
    orders?: T[];
    users?: T[];
    reviews?: T[];
    pagination: PaginationInfo;
  };
}

// ===== User =====
export interface User {
  id: number;
  username: string;
  email: string;
  phone: string | null;
  address: string | null;
  role: 'user' | 'admin';
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthData {
  token: string;
  user: User;
}

// ===== Category =====
export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  parentId: number | null;
  children?: Category[];
  parent?: Category;
  createdAt: string;
}

// ===== Brand =====
export interface Brand {
  id: number;
  name: string;
  logo: string | null;
  createdAt: string;
}

// ===== Product =====
export interface ProductImage {
  id: number;
  productId: number;
  imageUrl: string;
  isPrimary: boolean;
}

export interface ProductSpec {
  id: number;
  productId: number;
  specKey: string;
  specValue: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice: number | null;
  stock: number;
  categoryId: number | null;
  brandId: number | null;
  isActive: boolean;
  images: ProductImage[];
  specs?: ProductSpec[];
  Category?: Category;
  Brand?: Brand;
  reviews?: Review[];
  avgRating?: number;
  totalReviews?: number;
  createdAt: string;
  updatedAt: string;
}

// ===== Order =====
export type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  priceAtOrder: number;
  Product?: Product;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city?: string;
  district?: string;
  ward?: string;
}

export interface Order {
  id: number;
  userId: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: 'cod' | 'bank_transfer';
  shippingAddress: ShippingAddress;
  note: string | null;
  items: OrderItem[];
  User?: User;
  createdAt: string;
  updatedAt: string;
}

// ===== Cart =====
export interface CartItem {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  Product: Product;
}

export interface LocalCartItem {
  productId: number;
  quantity: number;
}

// ===== Review =====
export interface Review {
  id: number;
  userId: number;
  productId: number;
  rating: number;
  comment: string | null;
  User?: { id: number; username: string };
  createdAt: string;
}

// ===== Dashboard =====
export interface DashboardStats {
  totalRevenue: number;
  todayOrders: number;
  totalProducts: number;
  newUsersToday: number;
  ordersByStatus: Array<{ status: string; count: number }>;
}

export interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}
