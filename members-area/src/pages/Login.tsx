import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, Lock, Mail } from "lucide-react";
import { cn } from "../lib/utils";
import { supabase } from "../lib/supabase";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard", { replace: true });
      }
    });
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoggingIn(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setIsLoggingIn(false);
        if (authError.message.includes("Invalid login credentials")) {
          setError("E-mail ou senha incorretos.");
        } else {
          setError(authError.message);
        }
        return;
      }

      // Toca o som "Tudum" da Netflix
      const audio = new Audio("https://www.myinstants.com/media/sounds/tudum.mp3");
      audio.volume = 0.6;
      audio.play().catch((err) => console.log("Erro ao tocar áudio:", err));

      // Aguarda 2.5s para a animação rodar antes de navegar
      setTimeout(() => {
        navigate("/dashboard");
      }, 2500);
    } catch (err) {
      setIsLoggingIn(false);
      setError("Erro ao realizar login. Tente novamente.");
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
        {/* Background Otimizado (Sem animações pesadas no CSS) */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#17e8c3]/10 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#aa3bff]/10 blur-[120px] pointer-events-none" />
        </div>

        {/* Main Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-[420px] p-8 mx-4 glass-card card-gradient-border"
        >
          <div className="text-center mb-8">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#aa3bff] to-[#17e8c3] mx-auto mb-4 flex items-center justify-center shadow-[0_0_30px_rgba(170,59,255,0.4)]"
            >
              <LogIn className="w-8 h-8 text-black" strokeWidth={2.5} />
            </motion.div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
              Bem-vindo de volta
            </h1>
            <p className="text-muted-foreground text-sm">
              Acesse a sua área exclusiva de membros.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-500 text-sm text-center font-medium"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu e-mail"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#aa3bff]/50 transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#aa3bff]/50 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className={cn(
                "w-full py-3.5 rounded-xl text-black font-semibold mt-6 transition-all duration-300",
                "bg-gradient-to-r from-[#aa3bff] to-[#17e8c3]",
                "hover:shadow-[0_0_30px_rgba(170,59,255,0.5)] hover:scale-[1.02]",
                "active:scale-[0.98]"
              )}
            >
              Entrar na Plataforma
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="#" className="text-sm text-muted-foreground hover:text-white transition-colors">
              Esqueceu sua senha?
            </a>
          </div>
        </motion.div>
      </div>

      {/* Netflix-Style Intro Animation Overlay */}
      <AnimatePresence>
        {isLoggingIn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden"
          >
            <motion.div
              style={{ willChange: "transform, opacity" }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: [0.8, 1, 1.2, 20], 
                opacity: [0, 1, 1, 0] 
              }}
              transition={{ 
                duration: 2.5, 
                times: [0, 0.2, 0.7, 1],
                ease: "easeIn" 
              }}
              className="text-[#17e8c3]"
            >
              <h1 
                className="text-[12rem] font-black tracking-tighter italic" 
                style={{ 
                  fontFamily: 'var(--sans)',
                  textShadow: '0 0 40px rgba(23,232,195,0.6)'
                }}
              >
                T
              </h1>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
