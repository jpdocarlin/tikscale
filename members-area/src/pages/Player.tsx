import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, ListVideo, CheckCircle2, FileText, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";

interface PlaylistItem {
  id: number;
  module: string;
  title: string;
  duration: string;
  videoId?: string;
  videoUrl?: string;
  thumb: string;
  materials?: Array<{ title: string; url: string }>;
}

export const FULL_PLAYLIST: PlaylistItem[] = [
  { id: 101, module: "Módulo 1: Primeiros Passos", title: "Criando Perfil do TikTok", duration: "03:42", videoId: "PnrT3gRCmcM", thumb: "/mod1.png" },
  { id: 102, module: "Módulo 1: Primeiros Passos", title: "Como Criar os Vídeos Para Bater 2 Mil Seguidores", duration: "09:17", videoId: "7RV9iXsCzYk", thumb: "/mod1.png" },
  { id: 103, module: "Módulo 1: Primeiros Passos", title: "Como Usar a Ferramenta da Forma Certa", duration: "08:33", videoId: "XqHjh_CGyW4", thumb: "/mod1.png" },
  { id: 201, module: "Módulo 2: Suas Primeiras Postagens", title: "Como Fazer Sua Influencer e Seus Vídeos Com Ela", duration: "13:25", videoId: "MEEyA6mCLqc", thumb: "/mod2.png" },
  { id: 202, module: "Módulo 2: Suas Primeiras Postagens", title: "Como Usar o Algoritmo do TikTok e Viralizar Mais", duration: "08:24", videoId: "MHLJqKlz_eA", thumb: "/mod2.png" },
  { id: 203, module: "Módulo 2: Suas Primeiras Postagens", title: "Estratégias de Vendas", duration: "08:04", videoId: "sppdl7s-F58", thumb: "/mod2.png" }
];

export default function Player() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState<'aulas' | 'materiais'>('aulas');
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [isIdle, setIsIdle] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Proteção de Rota - Verifica sessão ativa
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/", { replace: true });
      } else {
        setIsLoading(false);
      }
    });

    if (id) {
      localStorage.setItem('@tikscale:last_watched', id);
    }
    const savedCompleted = localStorage.getItem('@tikscale:completed');
    if (savedCompleted) {
      setCompletedLessons(JSON.parse(savedCompleted));
    }
  }, [id, navigate]);

  // Lógica de Mouse Idle (Esconder UI)
  const handleMouseMove = () => {
    setIsIdle(false);
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    idleTimeoutRef.current = setTimeout(() => {
      setIsIdle(true);
    }, 3000); // 3 segundos para esconder
  };

  useEffect(() => {
    handleMouseMove();
    return () => {
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    };
  }, []);

  const toggleComplete = () => {
    if (!id) return;
    const lessonId = parseInt(id, 10);
    const newCompleted = completedLessons.includes(lessonId) 
      ? completedLessons.filter(l => l !== lessonId)
      : [...completedLessons, lessonId];
    
    setCompletedLessons(newCompleted);
    localStorage.setItem('@tikscale:completed', JSON.stringify(newCompleted));
  };

  const currentLessonIndex = FULL_PLAYLIST.findIndex(l => l.id.toString() === id);
  const currentLesson = FULL_PLAYLIST[currentLessonIndex] || FULL_PLAYLIST[0];
  const prevLesson = FULL_PLAYLIST[currentLessonIndex - 1];
  const nextLesson = FULL_PLAYLIST[currentLessonIndex + 1];
  const isCompleted = completedLessons.includes(currentLesson.id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="w-12 h-12 border-4 border-[#8F8F8D]/30 border-t-[#F5F5F4] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div 
      className="h-screen w-full flex overflow-hidden cursor-default"
      style={{ background: 'var(--bg)', color: 'var(--ink)' }}
      onMouseMove={handleMouseMove}
    >
      
      {/* Main Video Area */}
      <div className={`relative flex-1 h-full transition-all duration-500 ease-in-out ${showSidebar ? 'mr-0 md:mr-80' : 'mr-0'}`}>
        
        {/* Top Header Overlay */}
        <div 
          className={`absolute top-0 w-full p-6 z-20 flex justify-between items-center pointer-events-none transition-opacity duration-500 ${isIdle && !showSidebar ? 'opacity-0' : 'opacity-100'}`}
          style={{ background: 'linear-gradient(180deg, rgba(10,10,10,0.8) 0%, transparent 100%)' }}
        >
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 transition-colors pointer-events-auto"
              style={{ color: 'var(--ink-muted)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-muted)')}
            >
              <ArrowLeft className="w-6 h-6" />
              <span className="font-medium hidden sm:block">Dashboard</span>
            </button>
            <div className="hidden md:block w-px h-6" style={{ background: 'rgba(255,255,255,0.14)' }}></div>
            <h2 className="hidden md:block font-medium opacity-80" style={{ color: 'var(--ink)' }}>{currentLesson.title}</h2>
          </div>
          
          <button 
            onClick={() => setShowSidebar(!showSidebar)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full transition-colors pointer-events-auto"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border-soft)' }}
          >
            <ListVideo className="w-5 h-5" style={{ color: 'var(--ink)' }} />
          </button>
        </div>

        {/* Video Player Container */}
        <div className="w-full h-full flex items-center justify-center relative group p-4 sm:p-8" style={{ background: 'var(--bg)' }}>

          <div className="relative z-10 w-full max-w-5xl flex flex-col gap-6">
            
            {/* The Video */}
            <div
              className="w-full aspect-video overflow-hidden relative"
              style={{
                borderRadius: '20px',
                border: '1px solid var(--border-soft)',
                boxShadow: '0 30px 60px -30px rgba(0,0,0,0.7)',
                background: 'linear-gradient(160deg,#1c1c1c,#0d0d0d)',
              }}
            >
              {currentLesson.videoUrl ? (
                <iframe
                  className="w-full h-full border-none"
                  src={currentLesson.videoUrl}
                  title={currentLesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : currentLesson.videoId ? (
                <iframe
                  className="w-full h-full border-none"
                  src={`https://www.youtube.com/embed/${currentLesson.videoId}?autoplay=1&rel=0&modestbranding=1&showinfo=0`}
                  title={currentLesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--bg)' }}>
                  <p style={{ color: 'var(--ink-faint)' }}>Vídeo não encontrado.</p>
                </div>
              )}
            </div>

            {/* Senior-Accessible Material Link Card */}
            {currentLesson.materials && currentLesson.materials.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full relative z-10"
              >
                {currentLesson.materials.map((mat, idx) => (
                  <a
                    key={idx}
                    href={mat.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block transition-all duration-300 hover:scale-[1.01]"
                    style={{
                      borderRadius: '16px',
                      background: 'var(--surface)',
                      border: '1px solid var(--border-soft)',
                      padding: '24px',
                      textDecoration: 'none',
                      boxShadow: '0 20px 40px -20px rgba(0,0,0,0.5)',
                    }}
                  >
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-5 flex-col sm:flex-row text-center sm:text-left">
                        <div
                          className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: 'var(--surface-2)' }}
                        >
                          <span className="text-3xl select-none">👉</span>
                        </div>
                        <div>
                          <div className="flex items-center justify-center sm:justify-start gap-2 mb-1.5">
                            <span
                              className="font-mono uppercase font-semibold"
                              style={{
                                fontSize: '10px',
                                letterSpacing: '0.1em',
                                padding: '4px 10px',
                                borderRadius: '980px',
                                background: 'var(--surface-3)',
                                color: 'var(--ink-muted)',
                              }}
                            >
                              Acesso Liberado
                            </span>
                          </div>
                          <h3
                            className="font-display text-xl sm:text-2xl font-semibold tracking-tight leading-tight"
                            style={{ color: 'var(--ink)' }}
                          >
                            {mat.title}
                          </h3>
                          <p className="text-xs sm:text-sm mt-1 font-medium" style={{ color: 'var(--ink-faint)' }}>
                            Toque no botão ao lado ou em qualquer parte deste card para abrir.
                          </p>
                        </div>
                      </div>
                      
                      <div
                        className="flex items-center gap-2 shrink-0 select-none font-semibold transition-all duration-150"
                        style={{
                          padding: '14px 26px',
                          borderRadius: '980px',
                          background: 'var(--white)',
                          color: '#0A0A0A',
                          fontSize: '14px',
                        }}
                      >
                        Acessar Agora
                        <ArrowLeft className="w-4 h-4 rotate-180 stroke-[2px]" />
                      </div>
                    </div>
                  </a>
                ))}
              </motion.div>
            )}

            {/* Controls Below Video */}
            <div 
              className={`flex justify-between items-center transition-opacity duration-500 ${isIdle && !showSidebar ? 'opacity-0' : 'opacity-100'}`}
            >
              <div className="flex gap-[10px]">
                {prevLesson ? (
                  <button 
                    onClick={() => navigate(`/player/${prevLesson.id}`)}
                    className="flex items-center gap-2 cursor-pointer transition-all duration-150"
                    style={{
                      padding: '12px 18px',
                      border: '1px solid var(--border-soft)',
                      background: 'var(--surface)',
                      color: 'var(--ink-muted)',
                      fontSize: '13px',
                      fontWeight: 500,
                      borderRadius: '980px',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--ink)'; e.currentTarget.style.background = 'var(--surface-2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--ink-muted)'; e.currentTarget.style.background = 'var(--surface)'; }}
                  >
                    <ChevronLeft className="w-[13px] h-[13px]" />
                    <span className="hidden sm:block">Anterior</span>
                  </button>
                ) : (
                  <div className="w-24"></div> // Spacer to keep layout balanced
                )}
                {nextLesson && (
                  <button 
                    onClick={() => navigate(`/player/${nextLesson.id}`)}
                    className="flex items-center gap-2 cursor-pointer transition-all duration-150"
                    style={{
                      padding: '12px 18px',
                      border: '1px solid var(--border-soft)',
                      background: 'var(--surface)',
                      color: 'var(--ink-muted)',
                      fontSize: '13px',
                      fontWeight: 500,
                      borderRadius: '980px',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--ink)'; e.currentTarget.style.background = 'var(--surface-2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--ink-muted)'; e.currentTarget.style.background = 'var(--surface)'; }}
                  >
                    <span className="hidden sm:block">Próxima</span>
                    <ChevronRight className="w-[13px] h-[13px]" />
                  </button>
                )}
              </div>

              <button 
                onClick={toggleComplete}
                className="flex items-center gap-[9px] cursor-pointer transition-all duration-150"
                style={{
                  padding: '12px 20px',
                  background: isCompleted ? 'var(--ink-muted)' : 'var(--surface-2)',
                  border: '1px solid var(--border-soft)',
                  color: isCompleted ? '#0A0A0A' : 'var(--ink)',
                  fontSize: '13px',
                  fontWeight: 600,
                  borderRadius: '980px',
                }}
                onMouseEnter={e => { if (!isCompleted) e.currentTarget.style.background = 'var(--surface-3)'; }}
                onMouseLeave={e => { if (!isCompleted) e.currentTarget.style.background = 'var(--surface-2)'; }}
              >
                <CheckCircle2 className={`w-[14px] h-[14px] ${isCompleted ? 'text-[#0A0A0A]' : 'text-[#F5F5F4]'}`} />
                {isCompleted ? 'Concluída' : 'Marcar como concluída'}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-80 z-30 flex flex-col"
            style={{
              background: 'var(--bg)',
              borderLeft: '1px solid var(--border-soft)',
            }}
          >
            {/* Sidebar Header & Tabs */}
            <div className="flex flex-col" style={{ borderBottom: '1px solid var(--border-soft)' }}>
              <div className="flex justify-between items-center" style={{ padding: '0 0 18px 24px', paddingTop: '24px' }}>
                <h3 className="font-display font-semibold text-lg" style={{ color: 'var(--ink)' }}>Conteúdo</h3>
                <button onClick={() => setShowSidebar(false)} className="md:hidden pr-4" style={{ color: 'var(--ink-faint)' }}>
                  <ArrowLeft className="w-5 h-5 rotate-180" />
                </button>
              </div>
              <div className="flex gap-6" style={{ padding: '0 0 14px 24px', borderBottom: '1px solid var(--border-soft)' }}>
                <span
                  onClick={() => setActiveTab('aulas')}
                  className="cursor-pointer pb-3 transition-colors duration-150"
                  style={{
                    fontSize: '13px',
                    color: activeTab === 'aulas' ? 'var(--ink)' : 'var(--ink-muted)',
                    borderBottom: activeTab === 'aulas' ? '1px solid var(--ink)' : '1px solid transparent',
                  }}
                >
                  Playlist
                </span>
                <span
                  onClick={() => setActiveTab('materiais')}
                  className="cursor-pointer pb-3 transition-colors duration-150"
                  style={{
                    fontSize: '13px',
                    color: activeTab === 'materiais' ? 'var(--ink)' : 'var(--ink-muted)',
                    borderBottom: activeTab === 'materiais' ? '1px solid var(--ink)' : '1px solid transparent',
                  }}
                >
                  Materiais
                </span>
              </div>
            </div>
            
            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'aulas' ? (
                Object.entries(
                  FULL_PLAYLIST.reduce((acc, item) => {
                    if (!acc[item.module]) acc[item.module] = [];
                    acc[item.module].push(item);
                    return acc;
                  }, {} as Record<string, typeof FULL_PLAYLIST>)
                ).map(([moduleName, lessons]) => (
                  <div key={moduleName} style={{ padding: '18px 0 4px 24px' }}>
                    <div
                      className="font-mono uppercase"
                      style={{
                        fontSize: '10.5px',
                        letterSpacing: '0.12em',
                        color: 'var(--ink-muted)',
                        marginBottom: '10px',
                        paddingRight: '24px',
                      }}
                    >
                      {moduleName}
                    </div>
                    {lessons.map((item, idx) => {
                      const isActive = item.id.toString() === id;
                      const itemCompleted = completedLessons.includes(item.id);
                      return (
                        <div 
                          key={item.id}
                          onClick={() => navigate(`/player/${item.id}`)}
                          className="flex items-center gap-[14px] cursor-pointer transition-all duration-150"
                          style={{
                            padding: '11px 14px',
                            margin: '0 10px 2px 10px',
                            borderRadius: '12px',
                            background: isActive ? 'var(--surface-2)' : 'transparent',
                          }}
                          onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--surface-2)'; }}
                          onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                        >
                          {/* Lesson Number Circle */}
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center font-mono shrink-0"
                            style={{
                              fontSize: '11px',
                              ...(itemCompleted
                                ? {
                                    background: 'var(--ink-muted)',
                                    borderColor: 'var(--ink-muted)',
                                    border: '1px solid var(--ink-muted)',
                                    color: '#0A0A0A',
                                  }
                                : isActive
                                ? {
                                    border: '1px solid var(--white)',
                                    color: 'var(--white)',
                                    background: 'var(--surface-3)',
                                  }
                                : {
                                    border: '1px solid var(--border)',
                                    color: 'var(--ink-muted)',
                                    background: 'transparent',
                                  }),
                            }}
                          >
                            {itemCompleted ? '✓' : idx + 1}
                          </div>

                          {/* Lesson Text */}
                          <div className="flex-1 min-w-0">
                            <div
                              className="font-medium"
                              style={{
                                fontSize: '13.5px',
                                lineHeight: 1.3,
                                color: isActive ? 'var(--white)' : 'var(--ink)',
                                marginBottom: '3px',
                              }}
                            >
                              {item.title}
                            </div>
                            <div
                              className="font-mono"
                              style={{ fontSize: '11px', color: 'var(--ink-faint)' }}
                            >
                              {item.duration}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
              ) : (
                <div className="space-y-4 p-4">
                  <p className="text-sm px-2" style={{ color: 'var(--ink-faint)' }}>Baixe os materiais de apoio dessa aula.</p>
                  
                  {currentLesson.materials && currentLesson.materials.length > 0 ? (
                    currentLesson.materials.map((mat, idx) => (
                      <a 
                        key={idx}
                        href={mat.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-4 cursor-pointer transition-all duration-150"
                        style={{
                          padding: '16px',
                          borderRadius: '12px',
                          border: '1px solid var(--border-soft)',
                          background: 'var(--surface)',
                          textDecoration: 'none',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface)')}
                      >
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: 'var(--surface-2)' }}
                        >
                          <FileText className="w-5 h-5" style={{ color: 'var(--ink-muted)' }} />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium mb-1 line-clamp-2" style={{ color: 'var(--ink)' }}>{mat.title}</h4>
                          <p className="text-xs mb-3" style={{ color: 'var(--ink-faint)' }}>Link • Google Docs</p>
                          <button className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--ink-muted)' }}>
                            <Play className="w-3 h-3 fill-current" /> Acessar Link
                          </button>
                        </div>
                      </a>
                    ))
                  ) : (
                    <>
                      <div
                        className="flex items-start gap-4 cursor-pointer transition-all duration-150"
                        style={{
                          padding: '16px',
                          borderRadius: '12px',
                          border: '1px solid var(--border-soft)',
                          background: 'var(--surface)',
                        }}
                      >
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: 'var(--surface-2)' }}
                        >
                          <FileText className="w-5 h-5" style={{ color: 'var(--ink-muted)' }} />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium mb-1" style={{ color: 'var(--ink)' }}>Guia do Algoritmo</h4>
                          <p className="text-xs mb-3" style={{ color: 'var(--ink-faint)' }}>PDF • 2.4 MB</p>
                          <button className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--ink-muted)' }}>
                            <Download className="w-3 h-3" /> Baixar Arquivo
                          </button>
                        </div>
                      </div>

                      <div
                        className="flex items-start gap-4 cursor-pointer transition-all duration-150"
                        style={{
                          padding: '16px',
                          borderRadius: '12px',
                          border: '1px solid var(--border-soft)',
                          background: 'var(--surface)',
                        }}
                      >
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: 'var(--surface-2)' }}
                        >
                          <FileText className="w-5 h-5" style={{ color: 'var(--ink-muted)' }} />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium mb-1" style={{ color: 'var(--ink)' }}>Prompts Virais</h4>
                          <p className="text-xs mb-3" style={{ color: 'var(--ink-faint)' }}>TXT • 12 KB</p>
                          <button className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--ink-muted)' }}>
                            <Download className="w-3 h-3" /> Baixar Arquivo
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Button to show sidebar if hidden */}
      <AnimatePresence>
        {!showSidebar && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onClick={() => setShowSidebar(true)}
            className={`hidden md:flex absolute right-6 top-6 z-30 items-center justify-center w-12 h-12 rounded-full transition-opacity duration-500 ${isIdle ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border-soft)',
              boxShadow: '0 20px 40px -20px rgba(0,0,0,0.5)',
            }}
          >
            <ListVideo className="w-5 h-5" style={{ color: 'var(--ink)' }} />
          </motion.button>
        )}
      </AnimatePresence>

    </div>
  );
}
