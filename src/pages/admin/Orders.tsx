import AdminLayout from "@/components/admin/AdminLayout";
import { OrderList } from "@/components/admin/orders/OrderList";

const AdminOrders = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        </div>
        <OrderList />
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;