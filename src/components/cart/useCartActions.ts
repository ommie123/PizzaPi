import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";

export const useCartActions = () => {
  const { state, dispatch } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      dispatch({ type: "REMOVE_ITEM", payload: id });
    } else {
      dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
    }
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      // First check URL for table parameter
      const searchParams = new URLSearchParams(location.search);
      const tableFromUrl = searchParams.get("table");
      // Fallback to localStorage if not in URL
      const tableFromStorage = localStorage.getItem("tableNumber");
      const tableNumber = tableFromUrl || tableFromStorage;

      console.log("Table number from URL:", tableFromUrl);
      console.log("Table number from storage:", tableFromStorage);
      console.log("Using table number:", tableNumber);

      if (!tableNumber) {
        toast("Table number required", {
          description: "Please select a table number before placing an order."
        });
        setIsProcessing(false);
        return;
      }

      // Check table status before proceeding
      const { data: tableData, error: tableError } = await supabase
        .from("tables")
        .select("status")
        .eq("number", parseInt(tableNumber))
        .single();

      if (tableError) throw tableError;

      if (tableData.status === "paid") {
        toast("Table session expired", {
          description: "This table's session has ended. Please scan the QR code again."
        });
        setIsProcessing(false);
        return;
      }

      // Update table status to occupied when placing an order
      const { error: tableUpdateError } = await supabase
        .from("tables")
        .update({ status: "occupied" })
        .eq("number", parseInt(tableNumber));

      if (tableUpdateError) throw tableUpdateError;

      // Check for existing pending order for the table
      const { data: existingOrders, error: fetchError } = await supabase
        .from("orders")
        .select("id")
        .eq("table_number", parseInt(tableNumber))
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      let orderId: string;

      if (existingOrders && existingOrders.length > 0) {
        orderId = existingOrders[0].id;
        console.log("Adding items to existing order:", orderId);

        const orderItems = state.items.map((item) => ({
          order_id: orderId,
          menu_item_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
        }));

        const { error: itemsError } = await supabase
          .from("order_items")
          .insert(orderItems);

        if (itemsError) throw itemsError;

        const { error: updateError } = await supabase
          .rpc("update_order_total", { order_id: orderId });

        if (updateError) throw updateError;
      } else {
        console.log("Creating new order");
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .insert({
            table_number: parseInt(tableNumber),
            total_amount: state.total,
            status: "pending",
          })
          .select()
          .single();

        if (orderError) throw orderError;

        orderId = order.id;

        const orderItems = state.items.map((item) => ({
          order_id: orderId,
          menu_item_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
        }));

        const { error: itemsError } = await supabase
          .from("order_items")
          .insert(orderItems);

        if (itemsError) throw itemsError;
      }

      dispatch({ type: "CLEAR_CART" });
      toast.success("Order placed successfully", {
        description: "Your order has been sent to the kitchen."
      });
      navigate("/menu");
    } catch (error) {
      console.error("Error processing order:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    updateQuantity,
    handleCheckout,
  };
};