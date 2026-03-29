import { useListUsers } from "@workspace/api-client-react";
import { Card, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Badge, Button } from "@/components/ui/core";
import { formatDate } from "@/lib/utils";
import { Shield, User as UserIcon, Store } from "lucide-react";

export default function Users() {
  const token = localStorage.getItem('auth_token');
  const { data: users, isLoading } = useListUsers({ request: { headers: { Authorization: `Bearer ${token}` } } });

  const getRoleIcon = (role: string) => {
    switch(role) {
      case 'admin': return <Shield className="w-4 h-4 mr-1 text-purple-400" />;
      case 'owner': return <Store className="w-4 h-4 mr-1 text-blue-400" />;
      case 'cashier': return <UserIcon className="w-4 h-4 mr-1 text-emerald-400" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold font-display">Gestión de Usuarios</h2>
          <p className="text-muted-foreground">Administra los accesos al sistema</p>
        </div>
        <Button>Nuevo Usuario</Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Creado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">Cargando...</TableCell></TableRow>
            ) : users?.map(u => (
              <TableRow key={u.id}>
                <TableCell className="font-semibold">{u.name}</TableCell>
                <TableCell className="text-muted-foreground">{u.username}</TableCell>
                <TableCell>
                  <div className="flex items-center capitalize bg-secondary/50 w-max px-3 py-1 rounded-md border text-sm">
                    {getRoleIcon(u.role)}
                    {u.role}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={u.active ? "success" : "destructive"}>{u.active ? "Activo" : "Inactivo"}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDate(u.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
