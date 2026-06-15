"use client";
import { ShoppingCart } from "lucide-react";
import { Product } from "@/types";
import { Button } from "../ui/button";
import useCart from "@/hooks/use-cart";
import { useAuth } from "@/app/utils/authContext";
import { toast } from "react-hot-toast";
import formatVND from "@/app/utils/formatCurrency";

interface InfoProps {
  data: Product;
}

const Info: React.FC<InfoProps> = ({ data }) => {
  const cart = useCart();
  const { user, isAuthenticated } = useAuth();

  const onAddToCart = () => {
    if (!isAuthenticated || !user) {
      toast.error("Please login to add items to cart");
      return;
    }

    if (data.stock <= 0) {
      toast.error("Product is out of stock");
      return;
    }

    cart.addItem(data._id);
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-gray-900">{data.name}</h1>
      <p className="text-2xl text-gray-900">
        {formatVND(data.price)}
      </p>
      <p className="text-gray-600 text-lg">{data.description}</p>
      
      <div className="mt-10 flex items-center gap-x-3">
        <Button
          onClick={onAddToCart}
          className="flex items-center gap-x-2"
          disabled={data.stock <= 0}
        >
          {data.stock > 0 ? 'Add To Cart' : 'Out of Stock'}
          <ShoppingCart size={20} />
        </Button>
      </div>
    </div>
  );
};

export default Info;
