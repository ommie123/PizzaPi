import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingCart, ShieldBan } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import { CartItem } from "./CartItem";
import { CartSummary } from "./CartSummary";
import { useCartActions } from "./useCartActions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Cart = () => {
  const { state, dispatch } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const { isProcessing, updateQuantity, handleCheckout } = useCartActions();

  // Check if user is admin
  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return null;
      
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      
      return data;
    }
  });

  const isAdmin = profile?.role === 'admin';

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          {isAdmin ? (
            <div className="relative">
              <ShoppingCart className="h-5 w-5 opacity-50" />
              <ShieldBan className="h-4 w-4 text-pizza-red absolute -top-2 -right-2" />
            </div>
          ) : (
            <>
              <ShoppingCart className="h-5 w-5" />
              {state.items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-pizza-red text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {state.items.length}
                </span>
              )}
            </>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Your Cart</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-full">
          {isAdmin ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <ShieldBan className="h-12 w-12 text-pizza-red" />
              <p className="text-center text-gray-500">Administrators cannot place orders</p>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-grow my-4">
                {state.items.length === 0 ? (
                  <p className="text-center text-gray-500 my-4">Your cart is empty</p>
                ) : (
                  <div className="space-y-4">
                    {state.items.map((item) => (
                      <CartItem
                        key={item.id}
                        item={item}
                        onUpdateQuantity={updateQuantity}
                        onRemoveItem={(id) => dispatch({ type: "REMOVE_ITEM", payload: id })}
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>
              <CartSummary
                total={state.total}
                onCheckout={handleCheckout}
                isProcessing={isProcessing}
                itemCount={state.items.length}
              />
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Cart;