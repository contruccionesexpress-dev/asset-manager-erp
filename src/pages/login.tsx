import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button, Input, Card } from "@/components/ui/core";
import { useLocation } from "wouter";
import { Loader2, Lock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { loginUser, user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  if (user) {
    setLocation(user.role === 'cashier' ? '/pos' : '/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await loginUser({ username, password });
      toast({ title: "Bienvenido", description: "Has iniciado sesión exitosamente." });
    } catch (error: any) {
      toast({ 
        title: "Error de autenticación", 
        description: error?.message || "Credenciales inválidas",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={`${import.meta.env.BASE_URL}images/login-bg.png`} 
          alt="Abstract Background" 
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      <Card className="w-full max-w-md p-8 relative z-10 bg-card/60 backdrop-blur-xl border-white/10 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-4 border border-primary/30 shadow-lg shadow-primary/20">
            <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold font-display text-white">ERP Venezuela</h1>
          <p className="text-muted-foreground mt-2">Ingresa a tu cuenta para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Usuario</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin" 
                className="pl-10 bg-black/20 border-white/10 focus-visible:border-primary focus-visible:ring-primary/50 text-white"
                required 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="pl-10 bg-black/20 border-white/10 focus-visible:border-primary focus-visible:ring-primary/50 text-white"
                required 
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-12 text-base font-bold mt-4" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Iniciar Sesión"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
