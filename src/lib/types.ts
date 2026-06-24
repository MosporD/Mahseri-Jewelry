export type ProductCollection = "gold" | "silver" | "gems";
export type ProductGender = "Her" | "Him" | "Both";

export type Product = {
  id: string;
  sku: string;
  name: string;
  name_ar?: string | null;
  collection: ProductCollection;
  category: string;
  material: string;
  gender: ProductGender;
  price: number;
  weight: string;
  making_fee?: number | null;
  makingFee?: number | null;
  badge?: string | null;
  art?: string | null;
  image?: string | null;
  description?: string | null;
  description_ar?: string | null;
  in_stock?: boolean | null;
  inStock?: boolean | null;
  sort_order?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ProductInput = Omit<Product, "created_at" | "updated_at">;

export type CartItem = {
  productId: string;
  qty: number;
};

export type OrderItemInput = {
  product_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
};

export type OrderInput = {
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  city: string;
  address: string;
  payment_method: string;
  notes?: string | null;
  subtotal: number;
  shipping: number;
  total: number;
  deposit_due: number;
  balance_due: number;
  items: OrderItemInput[];
};

export type MetalSpot = {
  gold24: number;
  silver: number;
  xauUsd: number;
  xauUsdRaw: number;
  xagUsd: number;
  xauSource?: string;
  xagSource?: string;
  ts: number;
};
