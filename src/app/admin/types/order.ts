export type OrderItem = {
  productId: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
};

export type Order = {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  address: string;
  paymentId: string;
  paymentStatus: "pending" | "paid" | "failed";
  orderStatus: "place" | "shipped" | "delivered" | "cancelled" | "confirmed";
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    email: string;
    avatar?: string;
    _id: string;
  };
};
