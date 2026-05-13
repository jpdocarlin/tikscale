import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Mail, Lock, ArrowLeft, CheckCircle, BarChart3, TrendingUp, Zap, Shield, ImagePlus, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { motion } from "framer-motion";

type AuthView = "login" | "forgot-password" | "email-sent";

const features = [
  { icon: TrendingUp, text: "Produtos escalados com dados reais de vendas" },
  { icon: ImagePlus, text: "Gere criativos com IA em segundos" },
  { icon: Video, text: "Biblioteca de vídeos que mais convertem" },
  { icon: Zap, text: "Scripts otimizados para TikTok Shop" },
];

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [view, setView] = useState<AuthView>("login");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Redirect to dashboard if authenticated
        if (session?.user) {
          navigate("/");
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.email || !formData.password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }


    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "E-mail inválido",
        description: "Por favor, informe um e-mail válido.",
        variant: "destructive",
      });
      return;
    }

    // Password validation
    if (formData.password.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Login with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        let errorMessage = "Ocorreu um erro ao fazer login.";
        
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "E-mail ou senha incorretos.";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Por favor, confirme seu e-mail antes de fazer login.";
        }
        
        toast({
          title: "Erro no login",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Login realizado!",
        description: "Bem-vindo de volta!",
      });
      
      navigate("/");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe seu e-mail.",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "E-mail inválido",
        description: "Por favor, informe um e-mail válido.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          title: "Erro",
          description: error.message || "Ocorreu um erro ao enviar o e-mail.",
          variant: "destructive",
        });
        return;
      }

      setView("email-sent");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Hero side component — reused across views
  const HeroSide = () => (
    <div className="hidden lg:flex flex-col justify-center p-12 xl:p-16 relative overflow-hidden">
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 animate-mesh" />
      <div className="absolute inset-0 bg-background/30" />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
        backgroundSize: '64px 64px'
      }} />

      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-tiktok-cyan to-tiktok-pink flex items-center justify-center shadow-lg shadow-tiktok-cyan/25">
            <BarChart3 className="w-6 h-6 text-background" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">TikTok Shop</h2>
            <span className="text-xs text-muted-foreground">Plataforma TikTok Shop</span>
          </div>
        </div>

        <h1 className="text-3xl xl:text-4xl font-bold text-foreground mb-4 leading-tight">
          Escale suas vendas no{" "}
          <span className="gradient-text">TikTok Shop</span>
        </h1>

        <p className="text-base text-muted-foreground mb-8 max-w-md leading-relaxed">
          A plataforma completa para afiliados: encontre produtos, crie conteúdo com IA e maximize suas comissões.
        </p>

        <div className="space-y-4 mb-10">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm text-foreground/80">{feature.text}</span>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center gap-3 pt-6 border-t border-border/30">
          <div className="flex -space-x-2">
            {["from-tiktok-cyan to-tiktok-pink", "from-tiktok-pink to-tiktok-purple", "from-tiktok-green to-tiktok-cyan", "from-tiktok-yellow to-tiktok-pink"].map((gradient, i) => (
              <div key={i} className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradient} border-2 border-background flex items-center justify-center`}>
                <span className="text-[8px] font-bold text-background">{["JP", "AL", "MK", "LS"][i]}</span>
              </div>
            ))}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">+2.500 criadores</p>
            <p className="text-xs text-muted-foreground">já usam a plataforma</p>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Email sent confirmation view
  if (view === "email-sent") {
    return (
      <div className="min-h-screen bg-background flex">
        <HeroSide />
        <div className="flex-1 flex items-center justify-center p-4 md:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-border/50 shadow-xl">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-xl font-bold mb-2">E-mail Enviado!</h2>
                <p className="text-muted-foreground mb-4">
                  Enviamos um link para redefinir sua senha para <strong>{formData.email}</strong>
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Verifique sua caixa de entrada e siga as instruções para criar uma nova senha.
                </p>
                <Button
                  onClick={() => setView("login")}
                  variant="outline"
                  className="w-full"
                >
                  Voltar para o login
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Forgot password view
  if (view === "forgot-password") {
    return (
      <div className="min-h-screen bg-background flex">
        <HeroSide />
        <div className="flex-1 flex items-center justify-center p-4 md:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <button 
              onClick={() => setView("login")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Voltar ao login</span>
            </button>

            <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-xl">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl font-bold">
                  Esqueceu a senha?
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Digite seu e-mail e enviaremos um link para redefinir sua senha
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      E-mail
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-10 bg-muted/50 border-border/50 focus:border-primary/50 transition-colors"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-tiktok-cyan to-tiktok-pink text-background font-semibold py-2.5 transition-all duration-300 hover:opacity-90"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                        Enviando...
                      </span>
                    ) : (
                      "Enviar link de recuperação"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Login view (default) — split layout
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Hero Side */}
      <HeroSide />

      {/* Right Form Side */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 lg:p-8">
        {/* Mobile logo — only visible on small screens */}
        <div className="lg:hidden flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-tiktok-cyan to-tiktok-pink flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-background" />
          </div>
          <div>
            <h1 className="font-bold text-xl text-foreground">Plataforma</h1>
            <span className="text-[10px] text-muted-foreground">Plataforma TikTok Shop</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold">
                Bem-vindo de volta
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Entre com suas credenciais para acessar o painel
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleSubmit} className="space-y-4">

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    E-mail
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10 bg-muted/50 border-border/50 focus:border-primary/50 transition-colors"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 pr-10 bg-muted/50 border-border/50 focus:border-primary/50 transition-colors"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setView("forgot-password")}
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    Esqueceu a senha?
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-tiktok-cyan to-tiktok-pink text-background font-semibold py-2.5 transition-all duration-300 hover:opacity-90"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                      <span>Entrando...</span>
                    </span>
                  ) : (
                    <span>Entrar</span>
                  )}
                </Button>
              </form>

            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Ao continuar, você concorda com nossos{" "}
            <Link to="/termos-de-uso" className="text-primary hover:underline">
              Termos de Uso
            </Link>{" "}
            e{" "}
            <Link to="/politica-de-privacidade" className="text-primary hover:underline">
              Política de Privacidade
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
