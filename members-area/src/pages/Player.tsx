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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#17e8c3]/30 border-t-[#17e8c3] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div 
      className="h-screen w-full bg-black flex overflow-hidden cursor-default"
      onMouseMove={handleMouseMove}
    >
      
      {/* Main Video Area */}
      <div className={`relative flex-1 h-full transition-all duration-500 ease-in-out ${showSidebar ? 'mr-0 md:mr-80' : 'mr-0'}`}>
        
        {/* Top Header Overlay */}
        <div 
          className={`absolute top-0 w-full p-6 z-20 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-center pointer-events-none transition-opacity duration-500 ${isIdle && !showSidebar ? 'opacity-0' : 'opacity-100'}`}
        >
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors pointer-events-auto"
            >
              <ArrowLeft className="w-6 h-6" />
              <span className="font-medium hidden sm:block">Dashboard</span>
            </button>
            <div className="hidden md:block w-px h-6 bg-white/20"></div>
            <h2 className="hidden md:block text-white font-medium opacity-80">{currentLesson.title}</h2>
          </div>
          
          <button 
            onClick={() => setShowSidebar(!showSidebar)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors pointer-events-auto"
          >
            <ListVideo className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Video Player Container with Ambilight */}
        <div className="w-full h-full flex items-center justify-center bg-[#050505] relative group p-4 sm:p-8">
          
          {/* Ambilight Glow Effect */}
          <div 
            style={{ willChange: 'opacity', transform: 'translate3d(-50%, -50%, 0)' }}
            className="absolute top-1/2 left-1/2 w-[60%] h-[60%] bg-gradient-to-br from-[#aa3bff]/20 to-[#17e8c3]/20 blur-[120px] pointer-events-none opacity-60"
          ></div>

          <div className="relative z-10 w-full max-w-5xl flex flex-col gap-6">
            
            {/* The Video */}
            <div className="w-full aspect-video rounded-xl overflow-hidden shadow-2xl bg-black border border-white/5 relative">
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
                <div className="w-full h-full bg-[#0a0a0a] flex items-center justify-center">
                  <p className="text-white/40">Vídeo não encontrado.</p>
                </div>
              )}
            </div>

            {/* Senior-Accessible Glowing Material Link Card */}
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
                    className="relative block group overflow-hidden rounded-2xl bg-gradient-to-r from-[#17e8c3] to-[#aa3bff] p-[2px] shadow-[0_0_30px_rgba(23,232,195,0.25)] hover:shadow-[0_0_40px_rgba(23,232,195,0.5)] transition-all duration-300 hover:scale-[1.015]"
                  >
                    {/* Pulsing neon highlight */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#17e8c3]/20 to-[#aa3bff]/20 animate-pulse rounded-2xl"></div>
                    
                    {/* Inner Content */}
                    <div className="relative bg-zinc-950/95 backdrop-blur-xl rounded-[14px] p-6 flex flex-col sm:flex-row items-center justify-between gap-6 transition-all duration-300 group-hover:bg-black/90">
                      <div className="flex items-center gap-5 flex-col sm:flex-row text-center sm:text-left">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-r from-[#17e8c3] to-[#aa3bff] flex items-center justify-center animate-bounce shadow-xl shrink-0">
                          <span className="text-3xl select-none">👉</span>
                        </div>
                        <div>
                          <div className="flex items-center justify-center sm:justify-start gap-2 mb-1.5">
                            <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-[#17e8c3] to-[#aa3bff] text-black rounded-sm shadow-md animate-pulse">
                              Acesso Liberado
                            </span>
                          </div>
                          <h3 className="text-white text-xl sm:text-2xl font-black tracking-tight group-hover:text-[#17e8c3] transition-colors leading-tight">
                            {mat.title}
                          </h3>
                          <p className="text-white/50 text-xs sm:text-sm mt-1 font-medium">
                            Toque no botão ao lado ou em qualquer parte deste card para abrir.
                          </p>
                        </div>
                      </div>
                      
                      <div className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#17e8c3] to-[#aa3bff] text-black font-black text-sm sm:text-base tracking-wider uppercase shadow-[0_0_20px_rgba(23,232,195,0.3)] group-hover:shadow-[0_0_30px_rgba(23,232,195,0.5)] group-hover:scale-105 transition-all duration-300 flex items-center gap-2 shrink-0 select-none">
                        Acessar Agora
                        <ArrowLeft className="w-4 h-4 rotate-180 stroke-[3px]" />
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
              <div className="flex gap-3">
                {prevLesson ? (
                  <button 
                    onClick={() => navigate(`/player/${prevLesson.id}`)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="text-sm font-medium hidden sm:block">Anterior</span>
                  </button>
                ) : (
                  <div className="w-24"></div> // Spacer to keep layout balanced
                )}
                {nextLesson && (
                  <button 
                    onClick={() => navigate(`/player/${nextLesson.id}`)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <span className="text-sm font-medium hidden sm:block">Próxima</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>

              <button 
                onClick={toggleComplete}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all duration-300 ${isCompleted ? 'bg-[#17e8c3] text-black shadow-[0_0_20px_rgba(23,232,195,0.3)]' : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'}`}
              >
                <CheckCircle2 className={`w-5 h-5 ${isCompleted ? 'text-black' : 'text-white'}`} />
                {isCompleted ? 'Concluída' : 'Marcar como Concluída'}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Sidebar Desktop */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-80 bg-[#111] border-l border-white/5 z-30 flex flex-col"
          >
            {/* Sidebar Header & Tabs */}
            <div className="flex flex-col bg-black/40 border-b border-white/5">
              <div className="p-6 flex justify-between items-center">
                <h3 className="text-white font-bold text-lg">Conteúdo</h3>
                <button onClick={() => setShowSidebar(false)} className="md:hidden text-white/50 hover:text-white">
                  <ArrowLeft className="w-5 h-5 rotate-180" />
                </button>
              </div>
              <div className="flex border-t border-white/5">
                <button 
                  onClick={() => setActiveTab('aulas')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'aulas' ? 'text-[#17e8c3] border-b-2 border-[#17e8c3] bg-white/5' : 'text-white/50 hover:text-white/80'}`}
                >
                  Playlist
                </button>
                <button 
                  onClick={() => setActiveTab('materiais')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'materiais' ? 'text-[#aa3bff] border-b-2 border-[#aa3bff] bg-white/5' : 'text-white/50 hover:text-white/80'}`}
                >
                  Materiais
                </button>
              </div>
            </div>
            
            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {activeTab === 'aulas' ? (
                Object.entries(
                  FULL_PLAYLIST.reduce((acc, item) => {
                    if (!acc[item.module]) acc[item.module] = [];
                    acc[item.module].push(item);
                    return acc;
                  }, {} as Record<string, typeof FULL_PLAYLIST>)
                ).map(([moduleName, lessons]) => (
                  <div key={moduleName} className="space-y-2">
                    <h4 className="text-[#17e8c3] text-[10px] font-bold uppercase tracking-wider px-2 pt-2 pb-1 opacity-80">{moduleName}</h4>
                    {lessons.map((item, idx) => {
                      const isActive = item.id.toString() === id;
                      const itemCompleted = completedLessons.includes(item.id);
                      return (
                        <div 
                          key={item.id}
                          onClick={() => navigate(`/player/${item.id}`)}
                          className={`p-3 rounded-lg cursor-pointer transition-all duration-200 flex items-center gap-3 group
                            ${isActive ? 'bg-[#aa3bff]/20 border border-[#aa3bff]/30' : 'hover:bg-white/5 border border-transparent'}
                          `}
                        >
                          <div className="flex-shrink-0 relative">
                            {isActive ? (
                              <div className="w-8 h-8 rounded-full bg-[#aa3bff]/30 flex items-center justify-center shadow-[0_0_15px_rgba(170,59,255,0.4)]">
                                <Play className="w-4 h-4 text-[#aa3bff] fill-[#aa3bff]" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                <span className="text-white/50 text-xs font-medium">{idx + 1}</span>
                              </div>
                            )}
                            {itemCompleted && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#17e8c3] rounded-full flex items-center justify-center border-2 border-[#111]">
                                <CheckCircle2 className="w-3 h-3 text-black" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-sm font-medium truncate ${isActive ? 'text-white' : (itemCompleted ? 'text-white/50 line-through' : 'text-white/80 group-hover:text-white')}`}>
                              {item.title}
                            </h4>
                            <p className="text-xs text-white/40 mt-0.5">{item.duration}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-white/60 mb-4 px-2">Baixe os materiais de apoio dessa aula.</p>
                  
                  {currentLesson.materials && currentLesson.materials.length > 0 ? (
                    currentLesson.materials.map((mat, idx) => (
                      <a 
                        key={idx}
                        href={mat.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-[#17e8c3]/30 transition-all flex items-start gap-4 cursor-pointer group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-[#17e8c3]/20 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-[#17e8c3]" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white text-sm font-medium mb-1 line-clamp-2">{mat.title}</h4>
                          <p className="text-white/50 text-xs mb-3">Link • Google Docs</p>
                          <button className="text-xs font-bold text-[#17e8c3] flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <Play className="w-3 h-3 fill-current" /> Acessar Link
                          </button>
                        </div>
                      </a>
                    ))
                  ) : (
                    <>
                      <div className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors flex items-start gap-4 cursor-pointer group">
                        <div className="w-10 h-10 rounded-lg bg-[#aa3bff]/20 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-[#aa3bff]" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white text-sm font-medium mb-1">Guia do Algoritmo</h4>
                          <p className="text-white/50 text-xs mb-3">PDF • 2.4 MB</p>
                          <button className="text-xs font-bold text-[#17e8c3] flex items-center gap-1 opacity-80 group-hover:opacity-100">
                            <Download className="w-3 h-3" /> Baixar Arquivo
                          </button>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors flex items-start gap-4 cursor-pointer group">
                        <div className="w-10 h-10 rounded-lg bg-[#17e8c3]/20 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-[#17e8c3]" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white text-sm font-medium mb-1">Prompts Virais</h4>
                          <p className="text-white/50 text-xs mb-3">TXT • 12 KB</p>
                          <button className="text-xs font-bold text-[#17e8c3] flex items-center gap-1 opacity-80 group-hover:opacity-100">
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
            className={`hidden md:flex absolute right-6 top-6 z-30 items-center justify-center w-12 h-12 rounded-full glass-card hover-glow transition-opacity duration-500 ${isIdle ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          >
            <ListVideo className="w-5 h-5 text-white" />
          </motion.button>
        )}
      </AnimatePresence>

    </div>
  );
}
