import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Sparkles, CheckCircle, User, Zap, Target, TrendingUp, Users, Star, Bot, Video, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type AuthView = "landing" | "login" | "register" | "forgot-password" | "email-sent";

const InfluencerIA = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<AuthView>("landing");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
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
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
          },
        },
      });

      if (error) {
        let errorMessage = "Ocorreu um erro ao criar sua conta.";
        
        if (error.message.includes("User already registered")) {
          errorMessage = "Este e-mail já está cadastrado.";
        }
        
        toast({
          title: "Erro no cadastro",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Conta criada!",
        description: "Bem-vindo ao Pro Suite!",
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

  const features = [
    {
      icon: <Bot className="w-6 h-6" />,
      title: "IA Geradora de Conteúdo",
      description: "Crie roteiros virais automaticamente com inteligência artificial avançada"
    },
    {
      icon: <Video className="w-6 h-6" />,
      title: "Análise de Tendências",
      description: "Descubra o que está em alta no TikTok Shop em tempo real"
    },
    {
      icon: <Wand2 className="w-6 h-6" />,
      title: "Templates Prontos",
      description: "Modelos de legendas e hashtags otimizados para vendas"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Produtos Rentáveis",
      description: "Encontre os melhores produtos para promover e maximizar suas comissões"
    }
  ];

  const stats = [
    { value: "10K+", label: "Criadores Ativos" },
    { value: "500K+", label: "Vídeos Gerados" },
    { value: "R$2M+", label: "Em Comissões" },
  ];

  // Header component shared across all views
  const Header = ({ showBack = false, onBack }: { showBack?: boolean; onBack?: () => void }) => (
    <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 h-16 flex items-center">
        {showBack ? (
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Voltar</span>
          </button>
        ) : (
          <Link 
            to="/" 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Voltar para início</span>
          </Link>
        )}
        <div className="flex-1 flex justify-center items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-tiktok-cyan to-tiktok-pink flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-background" />
          </div>
          <span className="text-xl font-bold">Pro Suite</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-tiktok-pink/20 text-tiktok-pink font-medium">IA</span>
        </div>
        <div className="w-24" />
      </div>
    </header>
  );

  // Footer component shared across all views
  const Footer = () => (
    <footer className="border-t border-border/50 py-4">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8">
        <p className="text-center text-xs text-muted-foreground">
          Ao continuar, você concorda com nossos{" "}
          <Link to="/termos-de-uso" className="text-primary hover:underline">
            Termos de Uso
          </Link>{" "}
          e{" "}
          <Link to="/politica-de-privacidade" className="text-primary hover:underline">
            Política de Privacidade
          </Link>
        </p>
      </div>
    </footer>
  );

  // Email sent confirmation view
  if (view === "email-sent") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header showBack onBack={() => setView("login")} />

        <main className="flex-1 flex items-center justify-center p-4 md:p-6 lg:p-8">
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
        </main>
      </div>
    );
  }

  // Forgot password view
  if (view === "forgot-password") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header showBack onBack={() => setView("login")} />

        <main className="flex-1 flex items-center justify-center p-4 md:p-6 lg:p-8">
          <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-border/50 shadow-xl">
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
        </main>

        <Footer />
      </div>
    );
  }

  // Register view
  if (view === "register") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header showBack onBack={() => setView("landing")} />

        <main className="flex-1 flex items-center justify-center p-4 md:p-6 lg:p-8">
          <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-border/50 shadow-xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold">
                Crie sua conta
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Comece a gerar conteúdo viral com IA
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Nome completo
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Seu nome"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="pl-10 bg-muted/50 border-border/50 focus:border-primary/50 transition-colors"
                      disabled={isLoading}
                    />
                  </div>
                </div>

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
                  <p className="text-xs text-muted-foreground">Mínimo de 6 caracteres</p>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-tiktok-cyan to-tiktok-pink text-background font-semibold py-2.5 transition-all duration-300 hover:opacity-90"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                      Criando conta...
                    </span>
                  ) : (
                    "Criar conta grátis"
                  )}
                </Button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setView("login")}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Já tem uma conta? <span className="text-primary font-medium">Faça login</span>
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    );
  }

  // Login view
  if (view === "login") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header showBack onBack={() => setView("landing")} />

        <main className="flex-1 flex items-center justify-center p-4 md:p-6 lg:p-8">
          <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-border/50 shadow-xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold">
                Bem-vindo de volta!
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Acesse sua conta para continuar gerando conteúdo viral
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleLogin} className="space-y-4">
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
                    Esqueci minha senha
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
                      Entrando...
                    </span>
                  ) : (
                    "Entrar"
                  )}
                </Button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setView("register")}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Não tem uma conta? <span className="text-primary font-medium">Cadastre-se</span>
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    );
  }

  // Landing view (default)
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-b from-tiktok-cyan/5 via-transparent to-tiktok-pink/5" />
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-tiktok-cyan/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-tiktok-pink/10 rounded-full blur-3xl" />
          
          <div className="relative max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
            <div className="text-center max-w-3xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-tiktok-cyan/10 to-tiktok-pink/10 border border-tiktok-cyan/20 mb-6">
                <Zap className="w-4 h-4 text-tiktok-cyan" />
                <span className="text-sm font-medium bg-gradient-to-r from-tiktok-cyan to-tiktok-pink bg-clip-text text-transparent">
                  Potencializado por Inteligência Artificial
                </span>
              </div>

              {/* Heading */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Crie conteúdo viral com{" "}
                <span className="bg-gradient-to-r from-tiktok-cyan to-tiktok-pink bg-clip-text text-transparent">
                  Influencer IA
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                A plataforma completa para afiliados do TikTok Shop. Gere roteiros virais, encontre produtos rentáveis e maximize suas comissões com inteligência artificial.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => setView("register")}
                  size="lg"
                  className="bg-gradient-to-r from-tiktok-cyan to-tiktok-pink text-background font-semibold px-8 py-6 text-lg transition-all duration-300 hover:opacity-90 hover:scale-105"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Começar Grátis
                </Button>
                <Button
                  onClick={() => setView("login")}
                  variant="outline"
                  size="lg"
                  className="border-border/50 px-8 py-6 text-lg hover:bg-muted/50"
                >
                  Já tenho conta
                </Button>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap justify-center gap-8 md:gap-12 mt-12 pt-8 border-t border-border/50">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-tiktok-cyan to-tiktok-pink bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative py-16 md:py-24 bg-card/30">
          <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Tudo que você precisa para{" "}
                <span className="bg-gradient-to-r from-tiktok-cyan to-tiktok-pink bg-clip-text text-transparent">
                  vender mais
                </span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Ferramentas poderosas impulsionadas por IA para criar conteúdo que converte
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card 
                  key={index}
                  className="bg-card/50 border-border/50 hover:border-tiktok-cyan/30 transition-all duration-300 hover:shadow-lg hover:shadow-tiktok-cyan/5"
                >
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-tiktok-cyan/10 to-tiktok-pink/10 flex items-center justify-center mb-4 text-tiktok-cyan">
                      {feature.icon}
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-16 md:py-24">
          <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8">
            <Card className="bg-gradient-to-r from-tiktok-cyan/10 to-tiktok-pink/10 border-border/50 overflow-hidden">
              <CardContent className="p-8 md:p-12 text-center relative">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-tiktok-cyan/5 to-tiktok-pink/5" />
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-tiktok-cyan to-tiktok-pink flex items-center justify-center mx-auto mb-6">
                    <Star className="w-8 h-8 text-background" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">
                    Pronto para viralizar?
                  </h2>
                  <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                    Junte-se a milhares de criadores que já estão usando a IA para criar conteúdo viral e aumentar suas vendas.
                  </p>
                  <Button
                    onClick={() => setView("register")}
                    size="lg"
                    className="bg-gradient-to-r from-tiktok-cyan to-tiktok-pink text-background font-semibold px-8 py-6 text-lg transition-all duration-300 hover:opacity-90"
                  >
                    Criar Conta Grátis
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default InfluencerIA;
