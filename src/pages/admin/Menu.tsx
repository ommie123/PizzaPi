import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import MenuItemDialog from "@/components/admin/MenuItemDialog";
import { ActiveMenuItems } from "@/components/admin/menu/ActiveMenuItems";
import { ArchivedMenuItems } from "@/components/admin/menu/ArchivedMenuItems";
import AdminLayout from "@/components/admin/AdminLayout";

const AdminMenu = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const handleCreateNew = () => {
    setSelectedItem(null);
    setIsDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Menu Management</h1>
          <Button onClick={handleCreateNew} className="bg-pizza-red hover:bg-pizza-red/90">
            <Plus className="mr-2 h-4 w-4" /> Add Item
          </Button>
        </div>

        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">Active Items</TabsTrigger>
            <TabsTrigger value="archived">Archived Items</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <ActiveMenuItems
              onEdit={(item) => {
                setSelectedItem(item);
                setIsDialogOpen(true);
              }}
            />
          </TabsContent>

          <TabsContent value="archived">
            <ArchivedMenuItems />
          </TabsContent>
        </Tabs>

        <MenuItemDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          item={selectedItem}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminMenu;
