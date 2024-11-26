import AdminLayout from "@/components/admin/AdminLayout";
import { useQuery } from "@tanstack/react-query";
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

const AdminPayments = () => {
  const { data: payments, isLoading } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: async () => {
      console.log("Fetching paid orders...");
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            quantity,
            unit_price,
            menu_item: menu_items (
              name
            )
          )
        `)
        .eq("status", "paid")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching paid orders:", error);
        throw error;
      }
      
      console.log("Fetched paid orders:", data);
      return data;
    },
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Table</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments?.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">
                    {payment.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>Table {payment.table_number}</TableCell>
                  <TableCell>
                    <ul className="list-disc list-inside">
                      {payment.order_items?.map((item, index) => (
                        <li key={index}>
                          {item.quantity}x {item.menu_item?.name}
                        </li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell>{formatCurrency(payment.total_amount)}</TableCell>
                  <TableCell>
                    {format(new Date(payment.created_at), "MMM d, yyyy HH:mm")}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-500">Paid</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {payments?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No payments found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPayments;