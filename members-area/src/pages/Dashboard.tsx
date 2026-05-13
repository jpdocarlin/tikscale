import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Info, Search, Bell, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FULL_PLAYLIST } from "./Player";

const ALL_MODULES = [
  { 
    id: 1, 
    title: "Módulo 1: Primeiros Passos", 
    description: "Para quem ainda não tem conta no TikTok com 2 mil seguidores. Crie e prepare sua conta do zero.",
    thumb: "/mod1.png", 
    lessonCount: 4, 
    firstLessonId: 101 
  },
  { 
    id: 2, 
    title: "Módulo 2: Suas Primeiras Postagens", 
    description: "Para quem já tem 2 mil seguidores e está pronto para começar a postar os vídeos virais com a Influencer IA.",
    thumb: "/mod2.png", 
    lessonCount: 3, 
    firstLessonId: 201 
  }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [lastWatchedId, setLastWatchedId] = useState(101);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('@tikscale:last_watched');
    if (saved) {
      setLastWatchedId(parseInt(saved, 10));
    }

    const savedCompleted = localStorage.getItem('@tikscale:completed');
    if (savedCompleted) {
      setCompletedCount(JSON.parse(savedCompleted).length);
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const continueLesson = FULL_PLAYLIST.find(l => l.id === lastWatchedId) || FULL_PLAYLIST[0];
  const globalProgress = Math.round((completedCount / FULL_PLAYLIST.length) * 100) || 0;

  return (
    <div className="min-h-screen bg-black pb-20 overflow-x-hidden selection:bg-[#aa3bff]/30">
      {/* Navbar (Netflix style - transparent to solid) */}
      <nav 
        style={{ transform: 'translateZ(0)', willChange: 'background-color, backdrop-filter' }}
        className={`fixed top-0 w-full z-50 transition-all duration-300 px-8 py-4 flex justify-between items-center ${isScrolled ? 'bg-black/80 backdrop-blur-lg border-b border-white/5 shadow-2xl' : 'bg-gradient-to-b from-black/80 to-transparent'}`}
      >
        <div className="flex items-center gap-8">
          <div className="text-2xl font-bold tracking-tighter gradient-text cursor-pointer hover:scale-105 transition-transform" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Membros
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-white/70">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-white hover:text-[#17e8c3] transition-colors">Início</button>
            <button onClick={() => document.getElementById('modulos-section')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors">Módulos</button>
            <a href="https://chat.whatsapp.com/D8HgvgGPFJn2pgFNBnUYkw" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Comunidade</a>
          </div>
        </div>
        <div className="flex items-center gap-6 text-white/70">
          <Search className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
          <Bell className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
          
          {/* Avatar com Dropdown */}
          <div className="relative">
            <div 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#aa3bff] to-[#17e8c3] p-[2px] cursor-pointer hover:scale-105 hover:shadow-[0_0_15px_rgba(23,232,195,0.5)] transition-all"
            >
              <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-4 w-48 rounded-xl bg-black/60 backdrop-blur-2xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.8)] py-2"
                >
                  <button 
                    onClick={() => navigate("/")}
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

      {/* Hero Banner Animado Abstrato */}
      <div className="relative h-[85vh] w-full mb-12 flex items-center">
        <div className="absolute inset-0 overflow-hidden bg-[#050505]">
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            style={{ willChange: 'transform, opacity', transform: 'translateZ(0)' }}
            className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#aa3bff]/15 blur-[120px] pointer-events-none"
          />
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 14, repeat: Infinity, ease: "linear", delay: 2 }}
            style={{ willChange: 'transform, opacity', transform: 'translateZ(0)' }}
            className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#17e8c3]/8 blur-[100px] pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />
          {/* Removed redundant and extremely heavy 4-octave svg noise overlay for scroll performance optimization */}
        </div>

        <div className="absolute left-8 md:left-16 max-w-2xl z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest bg-gradient-to-r from-[#aa3bff] to-[#17e8c3] text-black rounded-sm shadow-[0_0_10px_rgba(23,232,195,0.4)]">Método Elite</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black text-white mb-6 leading-[1.1] tracking-tighter">
              A Nova Era do <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#17e8c3] to-[#aa3bff]">Conteúdo</span>
            </h1>

            {/* Barra de Progresso Global */}
            <div className="mb-10 max-w-sm bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <div className="flex justify-between items-center text-xs font-bold text-white/70 mb-3 uppercase tracking-wider">
                <span>Progresso da Formação</span>
                <span className="text-[#17e8c3] drop-shadow-[0_0_5px_rgba(23,232,195,0.5)]">{globalProgress}%</span>
              </div>
              <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${globalProgress}%` }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-[#aa3bff] to-[#17e8c3] rounded-full relative"
                  style={{ willChange: 'width', transform: 'translateZ(0)' }}
                >
                  <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)', transform: 'translateZ(0)' }}></div>
                </motion.div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(`/player/${continueLesson.id}`)}
                className="relative group flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-black transition-all hover:scale-105 bg-white z-10 shadow-xl"
              >
                {/* Neon Pulse Shadow Behind */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#aa3bff] to-[#17e8c3] rounded-xl blur-md opacity-40 group-hover:opacity-100 group-hover:animate-pulse transition-all -z-10"></div>
                <Play className="w-5 h-5 fill-black" />
                Continuar Aula
              </button>
              
              <button className="flex items-center gap-2 bg-white/5 text-white backdrop-blur-xl px-8 py-3.5 rounded-xl font-bold hover:bg-white/10 transition-colors border border-white/10 hover:border-white/30">
                <Info className="w-5 h-5" />
                Comunidade
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Seções de Conteúdo */}
      <div className="px-8 md:px-16 space-y-16">
        
        {/* Continue Assistindo (Aulas Específicas) */}
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-white mb-6 tracking-tight flex items-center gap-3">
            Continue Assistindo
            <span className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent ml-4"></span>
          </h2>
          
          <div className="flex gap-6 overflow-x-auto pb-8 pt-4 -mt-4 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -5, scale: 1.02 }}
              onClick={() => navigate(`/player/${continueLesson.id}`)}
              style={{ transform: 'translateZ(0)', willChange: 'transform' }}
              className="relative w-[280px] md:w-[320px] shrink-0 aspect-video rounded-2xl overflow-hidden cursor-pointer group snap-start bg-white/5 backdrop-blur-lg border border-white/10 shadow-2xl"
            >
              <img src={continueLesson.thumb} loading="lazy" alt={continueLesson.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-70" style={{ willChange: 'transform' }} />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              
              <div className="absolute bottom-0 left-0 w-full p-5">
                <span className="text-[10px] uppercase font-bold text-[#17e8c3] mb-2 block line-clamp-1 drop-shadow-md">{continueLesson.module}</span>
                <div className="flex justify-between items-end mb-4">
                  <h3 className="text-white font-bold text-base line-clamp-2 leading-tight drop-shadow-md" title={continueLesson.title}>{continueLesson.title}</h3>
                  <div className="w-10 h-10 shrink-0 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 border border-white/20 ml-3 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                    <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                  </div>
                </div>

                <div className="w-full bg-black/50 h-1.5 rounded-full overflow-hidden shadow-inner">
                  <div className="bg-gradient-to-r from-[#aa3bff] to-[#17e8c3] h-full rounded-full" style={{ width: `65%` }} />
                </div>
              </div>
              
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#17e8c3]/50 transition-colors duration-500 pointer-events-none" />
            </motion.div>
          </div>
        </div>

        {/* Todos os Módulos (Agrupados) */}
        <div className="relative z-10" id="modulos-section" style={{ scrollMarginTop: '100px' }}>
          <h2 className="text-2xl font-bold text-white mb-6 tracking-tight flex items-center gap-3">
            Todos os Módulos
            <span className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent ml-4"></span>
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 pt-4 -mt-4">
            {ALL_MODULES.map((module, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * idx }}
                whileHover={{ y: -8, scale: 1.02 }}
                key={module.id}
                onClick={() => navigate(`/player/${module.firstLessonId}`)}
                style={{ transform: 'translateZ(0)', willChange: 'transform' }}
                className="relative aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer group bg-white/5 backdrop-blur-lg border border-white/10 shadow-2xl"
              >
                <img src={module.thumb} loading="lazy" alt={module.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-50 group-hover:opacity-40 grayscale group-hover:grayscale-0" style={{ willChange: 'transform' }} />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                
                <div className="absolute top-6 right-6 text-[4.5rem] font-black text-white/5 leading-none group-hover:text-white/10 transition-colors pointer-events-none drop-shadow-2xl">
                  {module.id}
                </div>

                <div className="absolute bottom-0 left-0 w-full p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                  <h3 className="text-2xl text-white font-black mb-2 leading-tight drop-shadow-lg">{module.title}</h3>
                  <p className="text-white/60 text-sm line-clamp-3 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 leading-relaxed">
                    {module.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[#17e8c3] text-xs font-bold tracking-widest uppercase">{module.lessonCount} Aulas</p>
                  </div>
                  
                  <button className="w-full py-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold group-hover:bg-gradient-to-r group-hover:from-[#aa3bff] group-hover:to-[#17e8c3] group-hover:text-black group-hover:border-transparent transition-all duration-300 flex items-center justify-center gap-2 shadow-lg">
                    <Play className="w-4 h-4 fill-current" />
                    Iniciar Módulo
                  </button>
                </div>
                
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#aa3bff]/40 transition-colors duration-500 pointer-events-none" />
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
