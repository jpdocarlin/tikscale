import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Info, Search, Bell, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FULL_PLAYLIST } from "./Player";
import { supabase } from "../lib/supabase";

const ALL_MODULES = [
  { 
    id: 1, 
    title: "Módulo 1: Primeiros Passos", 
    description: "Crie sua conta no TikTok, bata 2 mil seguidores e crie sua influencer IA do zero.",
    thumb: "/mod1.png", 
    lessonCount: 3, 
    firstLessonId: 101 
  },
  { 
    id: 2, 
    title: "Módulo 2: Suas Primeiras Postagens", 
    description: "Escolha os melhores nichos e comece a criar os vídeos virais com sua Influencer IA.",
    thumb: "/mod2.png", 
    lessonCount: 5, 
    firstLessonId: 201 
  }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [lastWatchedId, setLastWatchedId] = useState(101);
  const [completedCount, setCompletedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificação de Segurança da Sessão
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/", { replace: true });
      } else {
        setIsLoading(false);
      }
    });

    const saved = localStorage.getItem('@tikscale:last_watched');
    if (saved) {
      setLastWatchedId(parseInt(saved, 10));
    }

    const savedCompleted = localStorage.getItem('@tikscale:completed');
    if (savedCompleted) {
      setCompletedCount(JSON.parse(savedCompleted).length);
    }
  }, [navigate]);

  const handleLogout = async () => {
    try {
      supabase.auth.signOut().catch((e) => console.error("Erro no servidor:", e));
    } catch (e) {}
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("sb-")) {
          localStorage.removeItem(key);
        }
      });
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith("sb-")) {
          sessionStorage.removeItem(key);
        }
      });
      document.cookie.split(";").forEach((c) => {
        const cookieName = c.trim().split("=")[0];
        if (cookieName.startsWith("sb-")) {
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
          const domainParts = window.location.hostname.split('.');
          if (domainParts.length > 1) {
            const rootDomain = `.${domainParts.slice(-2).join('.')}`;
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${rootDomain};`;
          }
        }
      });
    } catch (err) {}
    // Redireciona com recarga para limpar completamente a memória
    window.location.href = "/";
  };

  const continueLesson = FULL_PLAYLIST.find(l => l.id === lastWatchedId) || FULL_PLAYLIST[0];
  const continueIndex = FULL_PLAYLIST.findIndex(l => l.id === lastWatchedId);
  const upcomingLessons = FULL_PLAYLIST.slice(
    Math.max(continueIndex, 0),
    Math.max(continueIndex, 0) + 3
  );
  const globalProgress = Math.round((completedCount / FULL_PLAYLIST.length) * 100) || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="w-12 h-12 border-4 border-[#8F8F8D]/30 border-t-[#F5F5F4] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: 'var(--bg)', color: 'var(--ink)' }}>

      {/* ── Topnav ── */}
      <nav
        className="flex items-center justify-between sticky top-0 z-50"
        style={{
          padding: '18px 48px',
          borderBottom: '1px solid var(--border-soft)',
          background: 'rgba(10,10,10,0.72)',
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        }}
      >
        <div className="flex items-center gap-[10px] font-display font-semibold text-lg" style={{ color: 'var(--ink)' }}>
          <span
            className="w-7 h-7 flex items-center justify-center font-display text-xs font-bold rounded-mark"
            style={{ background: 'var(--ink)', color: 'var(--bg)' }}
          >
            M
          </span>
          Membros
        </div>

        <div className="hidden md:flex items-center gap-9">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-sm font-medium pb-1 transition-colors duration-150"
            style={{ color: 'var(--ink)', borderBottom: '1px solid var(--ink)' }}
          >
            Início
          </button>
          <button
            onClick={() => document.getElementById('modulos-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-sm font-medium pb-1 transition-colors duration-150 hover:text-[#F5F5F4]"
            style={{ color: 'var(--ink-muted)', borderBottom: '1px solid transparent' }}
          >
            Módulos
          </button>
          <a
            href="https://chat.whatsapp.com/D8HgvgGPFJn2pgFNBnUYkw"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium pb-1 transition-colors duration-150 hover:text-[#F5F5F4]"
            style={{ color: 'var(--ink-muted)', borderBottom: '1px solid transparent', textDecoration: 'none' }}
          >
            Comunidade
          </a>
        </div>

        <div className="flex items-center gap-[22px]">
          <Search className="w-[18px] h-[18px] cursor-pointer" style={{ color: 'var(--ink)', opacity: 0.65 }} />
          <Bell className="w-[18px] h-[18px] cursor-pointer" style={{ color: 'var(--ink)', opacity: 0.65 }} />

          {/* Avatar com Dropdown */}
          <div className="relative">
            <div
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-[34px] h-[34px] rounded-pill flex items-center justify-center cursor-pointer text-xs transition-all"
              style={{ border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--ink)' }}
            >
              JP
            </div>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-4 w-48 py-2"
                  style={{
                    borderRadius: 'var(--radius-card)',
                    background: 'var(--surface)',
                    border: '1px solid var(--border-soft)',
                    boxShadow: '0 20px 40px -10px rgba(0,0,0,0.8)',
                  }}
                >
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 hover:text-red-300 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair da Área
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div style={{ padding: '88px 48px 40px', maxWidth: '900px' }}>
        {/* Eyebrow */}
        <div
          className="inline-flex items-center gap-2 font-mono uppercase mb-[30px]"
          style={{
            fontSize: '11px',
            letterSpacing: '0.1em',
            background: 'var(--surface-2)',
            color: 'var(--ink-muted)',
            padding: '6px 14px',
            borderRadius: '980px',
          }}
        >
          <span className="w-[5px] h-[5px] rounded-full" style={{ background: 'var(--ink-muted)' }} />
          Método Elite
        </div>

        <h1
          className="font-display font-semibold"
          style={{ fontSize: '68px', lineHeight: 1.04, letterSpacing: '-0.03em', color: 'var(--ink)' }}
        >
          A nova era do<br />
          <span className="font-semibold" style={{ color: 'var(--ink-muted)' }}>conteúdo</span>
        </h1>

        {/* Progress Card */}
        <div
          className="mt-[44px]"
          style={{
            border: '1px solid var(--border-soft)',
            background: 'var(--surface)',
            padding: '24px 28px',
            maxWidth: '620px',
            borderRadius: '18px',
            boxShadow: '0 20px 40px -20px rgba(0,0,0,0.5)',
          }}
        >
          <div className="flex justify-between items-baseline mb-4">
            <span
              className="font-semibold uppercase"
              style={{ fontSize: '11px', letterSpacing: '0.14em', color: 'var(--ink-muted)' }}
            >
              Progresso da formação
            </span>
            <span className="font-mono" style={{ color: 'var(--ink)', fontSize: '15px' }}>
              {String(globalProgress).padStart(2, '0')}%
            </span>
          </div>

          {/* Tick Ledger */}
          <div className="flex gap-1">
            {Array.from({ length: FULL_PLAYLIST.length }).map((_, i) => (
              <div
                key={i}
                className="flex-1 rounded-pill"
                style={{
                  height: '5px',
                  background: i < completedCount ? 'var(--ink-muted)' : 'var(--surface-3)',
                }}
              />
            ))}
          </div>
          <div className="font-mono mt-3" style={{ fontSize: '12px', color: 'var(--ink-faint)' }}>
            {completedCount} de {FULL_PLAYLIST.length} aulas concluídas
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-[14px] mt-[36px]">
          <button
            onClick={() => navigate(`/player/${continueLesson.id}`)}
            className="flex items-center gap-[10px] font-semibold cursor-pointer transition-all duration-150 hover:scale-[1.015]"
            style={{
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
            <Play className="w-[13px] h-[13px] fill-current" />
            Continuar aula
          </button>
          <button
            className="flex items-center gap-[10px] font-semibold cursor-pointer transition-all duration-150"
            style={{
              padding: '14px 26px',
              fontSize: '14.5px',
              borderRadius: '980px',
              background: 'var(--surface-2)',
              color: 'var(--ink)',
              border: '1px solid var(--border-soft)',
              letterSpacing: '-0.01em',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-3)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface-2)')}
          >
            <Info className="w-[15px] h-[15px]" />
            Comunidade
          </button>
        </div>
      </div>

      {/* ── Continue Assistindo ── */}
      <div style={{ padding: '8px 48px 70px' }}>
        <h2 className="font-display font-semibold mb-[22px]" style={{ fontSize: '21px', color: 'var(--ink)' }}>
          Continue assistindo
        </h2>

        <div className="flex gap-5">
          {upcomingLessons.map((lesson) => (
            <div
              key={lesson.id}
              onClick={() => navigate(`/player/${lesson.id}`)}
              className="cursor-pointer transition-all duration-[180ms] hover:-translate-y-[3px]"
              style={{
                width: '260px',
                border: '1px solid var(--border-soft)',
                background: 'var(--surface)',
                borderRadius: '16px',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--ink-muted)';
                e.currentTarget.style.boxShadow = '0 20px 40px -20px rgba(0,0,0,0.6)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border-soft)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Thumb */}
              <div
                className="relative flex items-center justify-center"
                style={{
                  height: '145px',
                  background: 'linear-gradient(155deg, #202020, #121212)',
                  borderBottom: '1px solid var(--border-soft)',
                }}
              >
                <div
                  className="w-[38px] h-[38px] rounded-full flex items-center justify-center"
                  style={{ border: '1px solid var(--ink-muted)', color: 'var(--ink)' }}
                >
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </div>
                <span
                  className="absolute bottom-2 right-[10px] font-mono"
                  style={{
                    fontSize: '11px',
                    color: 'var(--ink-muted)',
                    background: 'rgba(0,0,0,0.5)',
                    padding: '2px 6px',
                    borderRadius: '2px',
                  }}
                >
                  {lesson.duration}
                </span>
              </div>

              {/* Card Body */}
              <div style={{ padding: '14px 16px' }}>
                <div
                  className="font-semibold uppercase"
                  style={{ fontSize: '10px', letterSpacing: '0.1em', color: 'var(--ink-muted)', marginBottom: '6px' }}
                >
                  {lesson.module}
                </div>
                <div className="font-semibold" style={{ fontSize: '14px', color: 'var(--ink)', lineHeight: 1.35 }}>
                  {lesson.title}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Todos os Módulos ── */}
      <div className="relative z-10" id="modulos-section" style={{ scrollMarginTop: '100px', padding: '0 48px 70px' }}>
        <h2 className="font-display font-semibold mb-[22px]" style={{ fontSize: '21px', color: 'var(--ink)' }}>
          Todos os Módulos
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {ALL_MODULES.map((module) => (
            <div
              key={module.id}
              onClick={() => navigate(`/player/${module.firstLessonId}`)}
              className="cursor-pointer transition-all duration-[180ms] hover:-translate-y-[3px] overflow-hidden relative"
              style={{
                border: '1px solid var(--border-soft)',
                background: 'var(--surface)',
                borderRadius: '16px',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--ink-muted)';
                e.currentTarget.style.boxShadow = '0 20px 40px -20px rgba(0,0,0,0.6)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border-soft)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Thumb with module image */}
              <div
                className="relative flex items-center justify-center"
                style={{
                  height: '180px',
                  borderBottom: '1px solid var(--border-soft)',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={module.thumb}
                  loading="lazy"
                  alt={module.title}
                  className="w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-transparent to-transparent" />
              </div>

              {/* Card Body */}
              <div style={{ padding: '14px 16px' }}>
                <div
                  className="font-semibold uppercase"
                  style={{ fontSize: '10px', letterSpacing: '0.1em', color: 'var(--ink-muted)', marginBottom: '6px' }}
                >
                  {module.lessonCount} Aulas
                </div>
                <div className="font-semibold" style={{ fontSize: '14px', color: 'var(--ink)', lineHeight: 1.35 }}>
                  {module.title}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
