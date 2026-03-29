import { useState } from "react";
import { useListProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, Product } from "@workspace/api-client-react";
import { Button, Input, Card, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Badge, Modal } from "@/components/ui/core";
import { formatUsd, formatBs } from "@/lib/utils";
import { Search, Plus, Edit, Trash2, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const productSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  description: z.string().optional(),
  priceUsd: z.coerce.number().min(0.01, "Precio debe ser mayor a 0"),
  stock: z.coerce.number().min(0, "Stock inválido"),
  minStock: z.coerce.number().min(0, "Stock mínimo inválido"),
  category: z.string().optional(),
  barcode: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function Products() {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const token = localStorage.getItem('auth_token');
  const headers = { Authorization: `Bearer ${token}` };

  const { data: products, isLoading } = useListProducts(
    { search: search || undefined },
    { request: { headers } }
  );

  const createMut = useCreateProduct({ request: { headers } });
  const updateMut = useUpdateProduct({ request: { headers } });
  const deleteMut = useDeleteProduct({ request: { headers } });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  const openCreate = () => {
    setEditingId(null);
    reset({ name: "", description: "", priceUsd: 0, stock: 0, minStock: 5, category: "", barcode: "" });
    setIsModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setValue("name", p.name);
    setValue("description", p.description || "");
    setValue("priceUsd", p.priceUsd);
    setValue("stock", p.stock);
    setValue("minStock", p.minStock);
    setValue("category", p.category || "");
    setValue("barcode", p.barcode || "");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar este producto?")) {
      await deleteMut.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Producto eliminado" });
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      if (editingId) {
        await updateMut.mutateAsync({ id: editingId, data });
        toast({ title: "Producto actualizado" });
      } else {
        await createMut.mutateAsync({ data });
        toast({ title: "Producto creado" });
      }
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nombre o código..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={openCreate} className="w-full sm:w-auto">
          <Plus className="w-5 h-5 mr-2" /> Nuevo Producto
        </Button>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/50">
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead className="text-right">Precio ($)</TableHead>
              <TableHead className="text-right">Precio (Bs)</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Cargando...</TableCell></TableRow>
            ) : products?.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No se encontraron productos</TableCell></TableRow>
            ) : (
              products?.map(p => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.barcode || 'Sin código'}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{p.category || 'General'}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium text-emerald-400">{formatUsd(p.priceUsd)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{formatBs(p.priceBs)}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={p.stock <= p.minStock ? "destructive" : "secondary"}>
                      {p.stock}
                      {p.stock <= p.minStock && <AlertCircle className="w-3 h-3 ml-1 inline" />}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                        <Edit className="w-4 h-4 text-blue-400" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Editar Producto" : "Nuevo Producto"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">Nombre</label>
              <Input {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Precio USD</label>
              <Input type="number" step="0.01" {...register("priceUsd")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoría</label>
              <Input {...register("category")} />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Stock Actual</label>
              <Input type="number" {...register("stock")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Stock Mínimo</label>
              <Input type="number" {...register("minStock")} />
            </div>

            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">Código de Barras</label>
              <Input {...register("barcode")} />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>
              Guardar Producto
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
