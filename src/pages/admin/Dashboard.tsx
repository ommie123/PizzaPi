import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Menu, ShoppingCart, CreditCard, Table } from "lucide-react";

const AdminDashboard = () => {
  const stats = [
    {
      name: "Menu Items",
      value: "24",
      icon: Menu,
      description: "Active menu items",
    },
    {
      name: "Orders Today",
      value: "12",
      icon: ShoppingCart,
      description: "Pending orders",
    },
    {
      name: "Revenue Today",
      value: "$1,234",
      icon: CreditCard,
      description: "From 8 orders",
    },
    {
      name: "Active Tables",
      value: "6",
      icon: Table,
      description: "Out of 10 tables",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.name} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.name}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-pizza-red" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;