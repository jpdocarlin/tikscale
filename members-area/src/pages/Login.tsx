import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, Lock, Mail } from "lucide-react";
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
      <div
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{ background: 'var(--bg)' }}
      >
        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-[420px] mx-4"
          style={{
            padding: '40px 36px',
            background: 'var(--surface)',
            border: '1px solid var(--border-soft)',
            borderRadius: '20px',
            boxShadow: '0 30px 60px -30px rgba(0,0,0,0.7)',
          }}
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
              className="w-14 h-14 mx-auto mb-5 flex items-center justify-center"
              style={{
                background: 'var(--surface-3)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
              }}
            >
              <LogIn className="w-6 h-6" style={{ color: 'var(--ink)' }} strokeWidth={2} />
            </motion.div>
            <h1
              className="font-display font-semibold tracking-tight mb-2"
              style={{ fontSize: '28px', color: 'var(--ink)' }}
            >
              Bem-vindo de volta
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--ink-muted)' }}>
              Acesse a sua área exclusiva de membros.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-center font-medium"
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  color: '#ef4444',
                }}
              >
                {error}
              </motion.div>
            )}

            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px]"
                style={{ color: 'var(--ink-faint)' }}
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu e-mail"
                className="w-full font-sans transition-all duration-150"
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border-soft)',
                  borderRadius: '12px',
                  padding: '14px 16px 14px 44px',
                  fontSize: '14px',
                  color: 'var(--ink)',
                  outline: 'none',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = 'var(--ink-faint)';
                  e.currentTarget.style.background = 'var(--surface-3)';
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'var(--border-soft)';
                  e.currentTarget.style.background = 'var(--surface-2)';
                }}
              />
            </div>

            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px]"
                style={{ color: 'var(--ink-faint)' }}
              />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                className="w-full font-sans transition-all duration-150"
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border-soft)',
                  borderRadius: '12px',
                  padding: '14px 16px 14px 44px',
                  fontSize: '14px',
                  color: 'var(--ink)',
                  outline: 'none',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = 'var(--ink-faint)';
                  e.currentTarget.style.background = 'var(--surface-3)';
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'var(--border-soft)';
                  e.currentTarget.style.background = 'var(--surface-2)';
                }}
              />
            </div>

            <button
              type="submit"
              className="w-full font-semibold cursor-pointer transition-all duration-150 hover:scale-[1.015] active:scale-[0.98]"
              style={{
                marginTop: '20px',
                padding: '14px 26px',
                fontSize: '14.5px',
                borderRadius: '980px',
                background: 'var(--white)',
                color: '#0A0A0A',
                border: '1px solid transparent',
                letterSpacing: '-0.01em',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#E4E4E2')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--white)')}
            >
              Entrar na Plataforma
            </button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="#"
              className="transition-colors duration-150"
              style={{ fontSize: '13px', color: 'var(--ink-faint)', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-faint)')}
            >
              Esqueceu sua senha?
            </a>
          </div>
        </motion.div>
      </div>

      {/* Intro Animation Overlay */}
      <AnimatePresence>
        {isLoggingIn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
            style={{ background: 'var(--bg)' }}
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
            >
              <h1
                className="font-display font-black tracking-tighter italic"
                style={{
                  fontSize: '12rem',
                  color: 'var(--ink)',
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
