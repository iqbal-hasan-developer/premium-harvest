export type ProductPackage = {
  weight: string;
  price: number;
  recommended?: boolean;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  packages?: ProductPackage[];
  description: string;
  shortDescription: string;
  featured: boolean;
  images: string[];
  stock?: number;
  createdAt?: string;
};

export type GalleryImage = {
  id: string;
  title: string;
  imageUrl: string;
  height?: "short" | "medium" | "tall";
  createdAt?: string;
};

export type OrderStatus = "pending" | "confirmed" | "delivered";

export type CustomerOrder = {
  id: string;
  productId: string;
  productName: string;
  source?: "cart" | string;
  items?: CartItem[];
  customerName: string;
  phone: string;
  address: string;
  quantity: number;
  selectedPackage?: string;
  packageWeight?: string;
  packagePrice?: number;
  deliveryCharge?: number;
  subtotal?: number;
  total?: number;
  totalPrice?: number;
  paymentMethod?: "cod" | string;
  note?: string;
  status: OrderStatus;
  createdAt?: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  createdAt?: string;
};

export type AdminStat = {
  label: string;
  value: number | string;
};

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  selectedPackageWeight: string;
  selectedPackagePrice: number;
  quantity: number;
  lineTotal: number;
};
