import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { formatCurrency } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_available: boolean;
}

interface MenuCardProps {
  item: MenuItem;
}

const MenuCard = ({ item }: MenuCardProps) => {
  const { dispatch } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    dispatch({ type: "ADD_ITEM", payload: item });
    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your cart.`,
    });
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {item.image_url && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={item.image_url || "/placeholder.svg"}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{item.name}</CardTitle>
          <span className="text-lg font-bold text-pizza-red">
            {formatCurrency(item.price)}
          </span>
        </div>
        <CardDescription>{item.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {!item.is_available ? (
          <span className="text-sm text-red-500">Currently unavailable</span>
        ) : (
          <Button
            onClick={handleAddToCart}
            className="w-full bg-pizza-red hover:bg-pizza-red/90"
            disabled={!item.is_available}
          >
            <Plus className="mr-2 h-4 w-4" /> Add to Cart
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default MenuCard;