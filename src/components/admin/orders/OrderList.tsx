import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

const ORDER_STATUSES = ["pending", "preparing", "ready", "completed", "paid"] as const;

type OrderWithItems = {
  id: string;
  table_number: number;
  status: string;
  total_amount: number;
  created_at: string;
  order_items: Array<{
    id: string;
    quantity: number;
    menu_item: Tables<"menu_items"> | null;
    menu_item_name?: string;
  }>;
};

export const OrderList = () => {
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      console.log("Fetching orders with menu items...");
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            *,
            menu_item: menu_items (
              name,
              deleted_at
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Transform the data to handle archived items
      const transformedData = (data as OrderWithItems[]).map(order => ({
        ...order,
        order_items: order.order_items.map(item => ({
          ...item,
          menu_item_name: item.menu_item?.deleted_at 
            ? `${item.menu_item.name} (Archived)`
            : item.menu_item?.name || '(Unknown item)'
        }))
      }));
      
      console.log("Transformed order data:", transformedData);
      return transformedData;
    },
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("table_number")
        .eq("id", orderId)
        .single();

      if (orderError) throw orderError;

      const { error: updateOrderError } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId);

      if (updateOrderError) throw updateOrderError;

      if (status === "paid") {
        const { error: tableError } = await supabase
          .from("tables")
          .update({ status: "available" })
          .eq("number", order.table_number);

        if (tableError) throw tableError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      toast.success("Status updated successfully");
    },
    onError: () => {
      toast.error("Failed to update status");
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "preparing":
        return "bg-blue-500";
      case "ready":
        return "bg-green-500";
      case "completed":
        return "bg-gray-500";
      case "paid":
        return "bg-green-700";
      default:
        return "bg-gray-500";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Table</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders?.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">
                {order.id.slice(0, 8)}...
              </TableCell>
              <TableCell>Table {order.table_number}</TableCell>
              <TableCell>
                <ul className="list-disc list-inside">
                  {order.order_items?.map((item) => (
                    <li key={item.id}>
                      {item.quantity}x {item.menu_item_name}
                    </li>
                  ))}
                </ul>
              </TableCell>
              <TableCell>{formatCurrency(order.total_amount)}</TableCell>
              <TableCell>
                <Select
                  defaultValue={order.status}
                  onValueChange={(value) =>
                    updateOrderStatus.mutate({ orderId: order.id, status: value })
                  }
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        <Badge className={getStatusColor(status)}>
                          {status}
                        </Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                {format(new Date(order.created_at), "MMM d, yyyy HH:mm")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
