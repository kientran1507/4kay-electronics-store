export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  images?: string[];
  category: string;
  brand?: string;
  descriptionVi?: string;
  specs?: Record<string, string>;
  useCases?: string[];
  highlights?: LocalizedList;
  tradeoffs?: LocalizedList;
  rating?: number | null;
  reviewCount?: number;
  warranty?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LocalizedList {
  en?: string[];
  vi?: string[];
}

export interface OrderItem {
  productId: {
    _id: string;
    name: string;
    image: string;
    price: number;
  };
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  subtotal?: number;
  discountAmount?: number;
  voucherCode?: string;
  shippingFee?: number;
  shippingZone?: string;
  shippingLabel?: string;
  totalPrice: number;
  status: 'Chờ thanh toán' | 'Chờ xử lý' | 'Đang giao' | 'Hoàn thành' | 'Đã hủy';
  shippingAddress: string;
  paymentMethod: 'Tiền mặt' | 'Chuyển khoản';
  paymentStatus?: 'unpaid' | 'pending' | 'paid' | 'failed' | 'cancelled' | null;
  paymentProvider?: 'cash' | 'payos' | 'manual_bank_transfer';
  paymentOrderCode?: number;
  paymentLinkId?: string;
  paymentUrl?: string;
  paymentQrCode?: string;
  paymentAccount?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  _id: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  category: string;
  image: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  totalPrice: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Admin {
  _id: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RequestData {
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  descriptionVi?: string;
  stock?: number;
  specs?: Record<string, string>;
  useCases?: string[];
  highlights?: LocalizedList;
  tradeoffs?: LocalizedList;
  rating?: number | null;
  reviewCount?: number;
  warranty?: string;
}

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  token: string;
  phone?: string;
  address?: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  message?: string;
}

export interface LoginResponse extends AuthResponse {
  user: AuthUser;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface PaginatedCustomerResponse {
  customers: Customer[];
  currentPage: number;
  totalPages: number;
  totalCustomers: number;
}

export interface PaymentSchema {
  paymentMethod: 'Tiền mặt' | 'Chuyển khoản';
  shippingAddress: string;
  paymentAccount?: string;
  voucherCode?: string;
}

export interface PricingQuote {
  subtotal: number;
  discountAmount: number;
  voucherCode: string;
  shippingFee: number;
  shippingZone: string;
  shippingLabel: string;
  freeShippingMin: number;
  totalPrice: number;
}

export interface PaymentSession {
  orderId: string;
  orderCode?: number;
  paymentLinkId?: string;
  paymentUrl: string;
  qrCode: string;
  amount: number;
  status: 'unpaid' | 'pending' | 'paid' | 'failed' | 'cancelled';
  provider: 'cash' | 'payos' | 'manual_bank_transfer';
  message?: string;
}

export type AvatarState = 'idle' | 'listening' | 'thinking' | 'talking';
export type KioskState =
  | 'idle'
  | 'greeting'
  | 'listening'
  | 'thinking'
  | 'talking'
  | 'presenting'
  | 'comparing'
  | 'checkout'
  | 'error';

export type AssistantIntent =
  | 'recommend'
  | 'compare'
  | 'guided_discovery'
  | 'ask_follow_up'
  | 'product_detail'
  | 'add_to_cart'
  | 'general';

export interface AssistantNeeds {
  category: string;
  budget: number | null;
  useCases: string[];
  preferredBrands: string[];
  avoidedBrands?: string[];
  importantFactors: string[];
  specs?: Record<string, string>;
}

export interface RecommendedProduct {
  product: Product;
  score: number;
  scoreDetails?: Record<string, number>;
  reason: string;
  tradeoff: string;
  betterThan: string;
  comparisonNote?: string;
  bestFor: string;
  notBestFor?: string;
  nextAction?: string;
}

export interface AssistantAlternative {
  product: Product;
  reason: string;
}

export interface AssistantAction {
  type: 'view_detail' | 'add_to_cart' | 'compare' | string;
  label: string;
  productId?: string;
}

export interface AssistantRequest {
  message: string;
  conversationId?: string;
  userId?: string;
  locale?: 'en' | 'vi';
  context?: Record<string, unknown>;
}

export interface AssistantResponse {
  conversationId?: string;
  reply: string;
  intent: AssistantIntent;
  needs: AssistantNeeds;
  recommendedProducts: RecommendedProduct[];
  alternatives: AssistantAlternative[];
  followUpQuestion: string;
  avatarState: AvatarState;
  actions: AssistantAction[];
}

export interface KioskComparisonProduct {
  product: Product;
  scoreDetails: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  bestFor: string[];
}

export interface KioskComparison {
  products: KioskComparisonProduct[];
  summary: string;
  winnerByUseCase: Record<string, string>;
}

export interface KioskRequest {
  message: string;
  conversationId?: string;
  userId?: string;
  locale?: 'en' | 'vi';
  selectedProductIds?: string[];
  context?: Record<string, unknown>;
}

export interface KioskResponse {
  conversationId?: string;
  reply: string;
  spokenReply?: string;
  intent:
    | 'greeting'
    | 'recommend_product'
    | 'compare_products'
    | 'explain_product'
    | 'ask_follow_up'
    | 'refine_recommendation'
    | 'add_to_cart'
    | 'checkout'
    | 'payment_help'
    | 'general_question'
    | 'out_of_scope';
  needs: AssistantNeeds & {
    dislikedBrands?: string[];
    minSpecs?: Record<string, string>;
  };
  recommendedProducts: RecommendedProduct[];
  alternatives: AssistantAlternative[];
  comparison: KioskComparison;
  followUpQuestion: string;
  kioskState: KioskState;
  actions: AssistantAction[];
}
