import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { playWaiterNotification } from "@/utils/notifications";

export const RecentOrder = () => {
  const tableNumber = new URLSearchParams(window.location.search).get("table") || 
    localStorage.getItem("tableNumber");

  const { data: recentOrder, isLoading } = useQuery({
    queryKey: ["recent-order", tableNumber],
    queryFn: async () => {
      console.log("Fetching recent order for table:", tableNumber);
      if (!tableNumber) return null;

      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            *,
            menu_item: menu_items (
              name
            )
          )
        `)
        .eq("table_number", parseInt(tableNumber))
        .neq("status", "paid") // Don't show paid orders
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error("Error fetching recent order:", error);
        return null;
      }
      
      console.log("Recent order data:", data);
      return data;
    },
    enabled: !!tableNumber,
    refetchInterval: 5000, // Refresh every 5 seconds to get status updates
  });

  const handleCallWaiter = async () => {
    if (!tableNumber) {
      console.error("No table number found");
      toast.error("Table number not found");
      return;
    }

    console.log("Calling waiter for table:", tableNumber);
    
    try {
      const { data: tableData, error: tableCheckError } = await supabase
        .from("tables")
        .select("id")
        .eq("number", parseInt(tableNumber))
        .single();

      if (tableCheckError) {
        console.error("Error checking table:", tableCheckError);
        toast.error("Could not verify table");
        return;
      }

      if (!tableData) {
        console.error("Table not found:", tableNumber);
        toast.error("Table not found");
        return;
      }

      const { error: updateError } = await supabase
        .from("tables")
        .update({ status: "needs_service" })
        .eq("number", parseInt(tableNumber));

      if (updateError) {
        console.error("Error updating table status:", updateError);
        toast.error("Failed to call waiter");
        return;
      }

      playWaiterNotification();
      toast.success("Waiter has been called", {
        description: "Someone will be with you shortly."
      });
    } catch (error) {
      console.error("Unexpected error calling waiter:", error);
      toast.error("An unexpected error occurred");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  // Don't render anything if there's no active order
  if (!recentOrder) {
    return null;
  }

  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Recent Order</CardTitle>
        <Button 
          onClick={handleCallWaiter}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Bell className="h-4 w-4" />
          Call Waiter
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Order Status</p>
            <p className="font-medium capitalize">{recentOrder.status}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Items</p>
            <ul className="list-disc list-inside">
              {recentOrder.order_items?.map((item) => (
                <li key={item.id} className="text-sm">
                  {item.quantity}x {item.menu_item?.name}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="font-medium">Total</span>
            <span className="font-bold">{formatCurrency(recentOrder.total_amount)}</span>
          </div>
          <div className="text-xs text-gray-500 text-right">
            Ordered at {format(new Date(recentOrder.created_at), "MMM d, yyyy HH:mm")}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};