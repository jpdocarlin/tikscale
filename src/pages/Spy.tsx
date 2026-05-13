import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Users, Eye, Heart, Play, TrendingUp, ChevronRight, Globe, Package, Tag, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// Import avatar images
import virginiaFonseca from "@/assets/virginia-fonseca.png";
import drPimenta from "@/assets/dr-pimenta.png";
import alwaysFit from "@/assets/always-fit.png";
import camillaPudim from "@/assets/camilla-pudim.png";
import vittareHome from "@/assets/vittare-home.png";
import yuriMeirelles from "@/assets/yuri-meirelles.png";
import maisonDeParfum from "@/assets/maisonde-parfum.png";
import wepink from "@/assets/wepink.png";
import viihTube from "@/assets/viih-tube.png";

// Import new creator avatars
import moisesLeal from "@/assets/moises-leal.jpg";
import nevinMourad from "@/assets/nevin-mourad.jpg";
import thaisFavero from "@/assets/thais-favero.jpg";
import robertRibeiro from "@/assets/robert-ribeiro.jpg";
import diogoBotti from "@/assets/diogo-bottino.jpg";
import lissCompartilha from "@/assets/liss-compartilha.jpg";
import anielleRosso from "@/assets/anielle-rosso.jpg";
import shigueoNakahara from "@/assets/shigueo-nakahara.jpg";
import karolFinkler from "@/assets/karol-finkler.jpg";

// Import product images (first product of each creator for the card)

// Avatar image mapping by creator ID
const avatarImages: Record<number, string> = {
  101: wepink,
  102: drPimenta,
  103: alwaysFit,
  105: viihTube,
  107: camillaPudim,
  108: vittareHome,
  109: yuriMeirelles,
  110: maisonDeParfum,
  // New creators
  201: moisesLeal,
  202: karolFinkler,
  203: thaisFavero,
  205: robertRibeiro,
  206: diogoBotti,
  207: lissCompartilha,
  208: anielleRosso,
  209: shigueoNakahara,
  215: thaisFavero,
};

// Product image mapping by creator ID (first/top product)
const productImages: Record<number, string> = {
  101: "/products/wepink-product-1.webp",
  102: "/products/drpimenta-product-1.webp",
  103: "/products/alwaysfit-product-1.webp",
  105: "/products/viihtube-product-1.webp",
  107: "/products/camillapudim-product-1.webp",
  108: "/products/vittarehome-product-1.webp",
  109: "/products/yurimeirelles-product-1.webp",
  110: "/products/maisondeparfum-product-1.webp",
};

interface Creator {
  id: number;
  name: string;
  username: string;
  avatar: string;
  niche: string;
  followers: string;
  views: string;
  likes: string;
  videos: number;
  engagement: number;
  topProduct: string;
  salesVolume: string;
  verified: boolean;
  location: string;
  tiktokUrl: string;
}

// Top Creators Brasil
const creators: Creator[] = [
  // Creators originais com imagens
  { id: 101, name: "WePink", username: "@wepink_", avatar: "WP", niche: "Beleza", followers: "350K", views: "1.2B", likes: "120M", videos: 1200, engagement: 9.5, topProduct: "WePink Cosméticos", salesVolume: "R$ 750M+/ano", verified: true, location: "Brasil", tiktokUrl: "https://www.tiktok.com/@wepink_" },
  { id: 102, name: "Dr. Pimenta", username: "@drpimenta", avatar: "DP", niche: "Perfumes", followers: "238K", views: "280M", likes: "1.7M", videos: 456, engagement: 8.8, topProduct: "Perfumes Árabes", salesVolume: "R$ 15M+/ano", verified: true, location: "Brasil", tiktokUrl: "https://www.tiktok.com/@drpimenta" },
  { id: 103, name: "Always Fit (Zhang Ye)", username: "@alwaysfit.com.br", avatar: "AF", niche: "Fitness", followers: "33.3K", views: "240M", likes: "18.8K", videos: 678, engagement: 8.5, topProduct: "Suplementos", salesVolume: "R$ 100M/ano", verified: true, location: "Brasil", tiktokUrl: "https://www.tiktok.com/@alwaysfit.com.br" },
  { id: 105, name: "Viih Tube", username: "@viihtube", avatar: "VT", niche: "Beleza", followers: "15.7M", views: "780M", likes: "278.8M", videos: 567, engagement: 8.7, topProduct: "Cosméticos", salesVolume: "R$ 8M+/ano", verified: true, location: "Brasil", tiktokUrl: "https://www.tiktok.com/@viihtube" },
  { id: 107, name: "Camilla Pudim", username: "@camilapudim", avatar: "CP", niche: "Maquiagem", followers: "31.6M", views: "290M", likes: "783.5M", videos: 389, engagement: 8.2, topProduct: "Maquiagem", salesVolume: "R$ 5M+/ano", verified: true, location: "Brasil", tiktokUrl: "https://www.tiktok.com/@camilapudim" },
  { id: 108, name: "Vittare Home", username: "@vittarehome", avatar: "VH", niche: "Casa", followers: "15.8K", views: "45M", likes: "94.3K", videos: 234, engagement: 9.1, topProduct: "Cama, Mesa e Banho", salesVolume: "R$ 500K+/ano", verified: true, location: "Brasil", tiktokUrl: "https://www.tiktok.com/@vittarehome" },
  { id: 109, name: "Yuri Meirelles", username: "@_yurimeirelles", avatar: "YM", niche: "Fitness", followers: "1.6M", views: "150M", likes: "74.0M", videos: 420, engagement: 8.5, topProduct: "Suplementos", salesVolume: "R$ 3M+/ano", verified: true, location: "Brasil", tiktokUrl: "https://www.tiktok.com/@_yurimeirelles" },
  { id: 110, name: "Maisonde Parfum", username: "@maisondeparfum.store", avatar: "MP", niche: "Perfumes", followers: "34.6K", views: "95M", likes: "115.4K", videos: 312, engagement: 8.9, topProduct: "Perfumes", salesVolume: "R$ 2M+/ano", verified: true, location: "Brasil", tiktokUrl: "https://www.tiktok.com/@maisondeparfum.store" },
  
  // Novos creators adicionados
  { id: 201, name: "Moisés Leal", username: "@moisesleall", avatar: "ML", niche: "Eletrônicos", followers: "1.2M", views: "500M", likes: "45M", videos: 890, engagement: 9.8, topProduct: "Gadgets Eletrônicos", salesVolume: "R$ 24M+/ano", verified: true, location: "Brasil", tiktokUrl: "https://www.tiktok.com/@moisesleall" },
  { id: 202, name: "Nevin Mourad", username: "@nevinmourad", avatar: "NM", niche: "Utilidades", followers: "800K", views: "320M", likes: "28M", videos: 650, engagement: 9.2, topProduct: "Utilidades Domésticas", salesVolume: "R$ 6M+/ano", verified: true, location: "Brasil", tiktokUrl: "https://www.tiktok.com/@nevinmourad" },
  { id: 203, name: "Thais Favero", username: "@creatorthaisfavero", avatar: "TF", niche: "Casa", followers: "450K", views: "180M", likes: "15M", videos: 420, engagement: 8.9, topProduct: "Utensílios de Cozinha", salesVolume: "R$ 650K+/ano", verified: true, location: "Brasil", tiktokUrl: "https://www.tiktok.com/@creatorthaisfavero" },
  { id: 205, name: "Robert Ribeiro", username: "@robert.ribeiro12", avatar: "RR", niche: "Eletrônicos", followers: "520K", views: "200M", likes: "18M", videos: 450, engagement: 9.0, topProduct: "Gadgets Tech", salesVolume: "R$ 1.7M+/ano", verified: true, location: "Brasil", tiktokUrl: "https://www.tiktok.com/@robert.ribeiro12" },
  { id: 206, name: "Diogo Bottino", username: "@diogobotti", avatar: "DB", niche: "Tecnologia", followers: "680K", views: "280M", likes: "22M", videos: 520, engagement: 8.8, topProduct: "Cursos e Tech", salesVolume: "R$ 1.2M+/ano", verified: true, location: "Brasil", tiktokUrl: "https://www.tiktok.com/@diogobotti" },
  { id: 207, name: "Liss Compartilha", username: "@lisscompartilha", avatar: "LC", niche: "Utilidades", followers: "420K", views: "170M", likes: "14M", videos: 400, engagement: 8.6, topProduct: "UGC e Utilidades", salesVolume: "R$ 660K+/ano", verified: true, location: "Brasil", tiktokUrl: "https://www.tiktok.com/@lisscompartilha" },
  { id: 208, name: "Anielle Rosso", username: "@anielle.rosso5", avatar: "AR", niche: "Variedades", followers: "350K", views: "140M", likes: "11M", videos: 350, engagement: 8.5, topProduct: "Produtos Diversos", salesVolume: "R$ 600K+/ano", verified: true, location: "Brasil", tiktokUrl: "https://www.tiktok.com/@anielle.rosso5" },
  { id: 209, name: "Shigueo Nakahara", username: "@shigueo_nakahara", avatar: "SN", niche: "Educação", followers: "290K", views: "120M", likes: "9M", videos: 300, engagement: 8.4, topProduct: "Cursos Online", salesVolume: "R$ 360K+/ano", verified: true, location: "Brasil", tiktokUrl: "https://www.tiktok.com/@shigueo_nakahara" },
  { id: 215, name: "Karol Finkler", username: "@karolfinkler", avatar: "KF", niche: "Utilidades", followers: "220K", views: "85M", likes: "6M", videos: 240, engagement: 8.3, topProduct: "Dicas e Utilidades", salesVolume: "R$ 180K+/ano", verified: true, location: "Brasil", tiktokUrl: "https://www.tiktok.com/@karolfinkler" },
];

const niches = [
  { id: "beleza", name: "Beleza", icon: Sparkles },
  { id: "maquiagem", name: "Maquiagem", icon: Sparkles },
  { id: "moda", name: "Moda", icon: Package },
  { id: "fitness", name: "Fitness", icon: TrendingUp },
  { id: "eletronicos", name: "Eletrônicos", icon: Package },
  { id: "tecnologia", name: "Tecnologia", icon: Package },
  { id: "utilidades", name: "Utilidades", icon: Package },
  { id: "casa", name: "Casa", icon: Package },
  { id: "perfumes", name: "Perfumes", icon: Sparkles },
  { id: "saude", name: "Saúde", icon: TrendingUp },
  { id: "educacao", name: "Educação", icon: Package },
  { id: "marketing", name: "Marketing", icon: TrendingUp },
  { id: "lifestyle", name: "Lifestyle", icon: Sparkles },
  { id: "variedades", name: "Variedades", icon: Package },
];

const locations = [
  { id: "estados-unidos", name: "Estados Unidos", flag: "🇺🇸" },
  { id: "brasil", name: "Brasil", flag: "🇧🇷" },
];

// TikTok Logo Icon
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

// Radar Animation Component with TikTok colors
const RadarAnimation = () => (
  <div className="relative w-72 h-72 mx-auto">
    {/* Outer rings with TikTok gradient */}
    <div className="absolute inset-0 rounded-full border-2 border-tiktok-cyan/20 animate-pulse" />
    <div className="absolute inset-4 rounded-full border border-tiktok-pink/30" />
    <div className="absolute inset-8 rounded-full border border-tiktok-cyan/40" />
    <div className="absolute inset-12 rounded-full border border-tiktok-pink/50" />
    <div className="absolute inset-16 rounded-full border border-tiktok-cyan/60" />
    
    {/* Center circle with TikTok gradient */}
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-28 h-28 rounded-full bg-gradient-to-br from-tiktok-cyan via-white to-tiktok-pink flex items-center justify-center shadow-lg shadow-tiktok-pink/30">
        <TikTokIcon className="w-12 h-12 text-background" />
      </div>
    </div>
    
    {/* Rotating radar sweep - TikTok gradient */}
    <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
      <div className="absolute top-1/2 left-1/2 w-1/2 h-1 bg-gradient-to-r from-tiktok-cyan via-tiktok-pink to-transparent origin-left rounded-full" />
    </div>
    
    {/* Floating dots with TikTok colors */}
    <div className="absolute top-6 left-1/2 w-3 h-3 rounded-full bg-tiktok-cyan animate-pulse shadow-lg shadow-tiktok-cyan/50" />
    <div className="absolute top-1/4 right-6 w-2 h-2 rounded-full bg-tiktok-pink animate-pulse shadow-lg shadow-tiktok-pink/50" style={{ animationDelay: '0.5s' }} />
    <div className="absolute bottom-10 left-1/4 w-2.5 h-2.5 rounded-full bg-tiktok-cyan animate-pulse shadow-lg shadow-tiktok-cyan/50" style={{ animationDelay: '1s' }} />
    <div className="absolute bottom-1/4 right-1/4 w-2 h-2 rounded-full bg-tiktok-pink animate-pulse shadow-lg shadow-tiktok-pink/50" style={{ animationDelay: '1.5s' }} />
  </div>
);

// Loading Animation Component with TikTok theme
const LoadingAnimation = () => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    "Conectando ao TikTok...",
    "Analisando creators virais...",
    "Filtrando anúncios escalados...",
    "Identificando top performers...",
    "Carregando resultados..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + 2;
      });
    }, 60);

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 600);

    return () => {
      clearInterval(interval);
      clearInterval(stepInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <RadarAnimation />
      
      <div className="mt-8 w-full max-w-md">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-tiktok-cyan via-white to-tiktok-pink transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-center mt-4 text-tiktok-cyan animate-pulse font-medium">
          {steps[currentStep]}
        </p>
        <p className="text-center text-sm text-muted-foreground mt-2">
          {progress}% concluído
        </p>
      </div>
    </div>
  );
};

const CreatorCard = ({ creator, onClick }: { creator: Creator; onClick: () => void }) => (
  <div 
    onClick={onClick}
    className="glass-card p-5 hover-glow group transition-all duration-300 hover:scale-[1.01] cursor-pointer"
  >
    <div className="flex items-start gap-4">
      <div className="relative">
        {avatarImages[creator.id] ? (
          <img 
            src={avatarImages[creator.id]} 
            alt={creator.name}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-tiktok-cyan to-tiktok-pink flex items-center justify-center text-lg font-bold text-background">
            {creator.avatar}
          </div>
        )}
        {creator.verified && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-tiktok-cyan flex items-center justify-center">
            <svg className="w-3 h-3 text-background" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold truncate">{creator.name}</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{creator.niche}</span>
        </div>
        <p className="text-sm text-muted-foreground">{creator.username}</p>
        
        <div className="flex items-center gap-4 mt-3 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{creator.followers}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Heart className="w-4 h-4" />
            <span>{creator.likes}</span>
          </div>
        </div>
      </div>

      <div className="text-right">
        <p className="text-lg font-bold text-tiktok-green">{creator.salesVolume}</p>
        <p className="text-xs text-muted-foreground">volume de vendas</p>
      </div>

      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
    </div>

    <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
      <div className="flex items-center gap-3">
        {productImages[creator.id] && (
          <img 
            src={productImages[creator.id]} 
            alt={creator.topProduct}
            className="w-10 h-10 rounded-lg object-cover"
          />
        )}
        <div>
          <span className="text-xs text-muted-foreground">Produto top:</span>
          <p className="text-sm font-medium">{creator.topProduct}</p>
        </div>
      </div>
      <a 
        href={creator.tiktokUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-tiktok-cyan to-tiktok-pink text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
      >
        <TikTokIcon className="w-4 h-4" />
        Ver no TikTok
      </a>
    </div>
  </div>
);

type ViewState = 'landing' | 'loading' | 'results';

const Spy = () => {
  const navigate = useNavigate();
  const [viewState, setViewState] = useState<ViewState>('landing');
  const [searchProduct, setSearchProduct] = useState("");
  const [selectedNiche, setSelectedNiche] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  const handleSearch = () => {
    setViewState('loading');
    // Simulate loading time
    setTimeout(() => {
      setViewState('results');
    }, 3500);
  };

  const handleReset = () => {
    setViewState('landing');
    setSearchProduct("");
    setSelectedNiche(null);
    setSelectedLocation(null);
  };

  const filteredCreators = creators.filter(creator => {
    const matchesSearch = !searchProduct || 
      creator.topProduct.toLowerCase().includes(searchProduct.toLowerCase()) ||
      creator.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
      creator.username.toLowerCase().includes(searchProduct.toLowerCase());
    const matchesNiche = !selectedNiche || 
      creator.niche.toLowerCase() === niches.find(n => n.id === selectedNiche)?.name.toLowerCase();
    const matchesLocation = !selectedLocation || 
      creator.location === locations.find(l => l.id === selectedLocation)?.name;
    return matchesSearch && matchesNiche && matchesLocation;
  });

  return (
    <div className="min-h-screen bg-background">
      
      <main className="p-4 md:p-6 lg:p-8 max-w-[1200px] mx-auto">
        {viewState === 'landing' && (
          <div className="animate-fade-in">
            {/* Hero Section */}
            <div className="text-center mb-8 md:mb-12">
              <div className="inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-gradient-to-r from-tiktok-cyan/10 to-tiktok-pink/10 border border-tiktok-cyan/30 mb-4 md:mb-6">
                <TikTokIcon className="w-4 h-4 text-tiktok-cyan" />
                <span className="text-xs md:text-sm bg-gradient-to-r from-tiktok-cyan to-tiktok-pink bg-clip-text text-transparent font-medium">Espionagem TikTok</span>
              </div>
              
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-tiktok-cyan via-white to-tiktok-pink bg-clip-text text-transparent">
                Encontre anúncios escalados
              </h1>
              <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto px-4">
                Descubra os creators do TikTok que mais vendem e analise suas estratégias de sucesso
              </p>
            </div>

            {/* Radar Animation */}
            <div className="mb-8 md:mb-12 scale-75 md:scale-100 origin-center">
              <RadarAnimation />
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 md:mb-12">
              <div className="glass-card p-6 border-tiktok-cyan/20 hover:border-tiktok-cyan/40 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-tiktok-cyan/20 to-tiktok-pink/10 flex items-center justify-center mb-4">
                  <Search className="w-6 h-6 text-tiktok-cyan" />
                </div>
                <h3 className="font-semibold mb-2">Busca Inteligente</h3>
                <p className="text-sm text-muted-foreground">Encontre exatamente o que precisa com filtros avançados</p>
              </div>
              <div 
                onClick={() => setViewState('results')}
                className="glass-card p-6 border-tiktok-pink/20 hover:border-tiktok-pink/40 transition-colors cursor-pointer hover:scale-[1.02]"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-tiktok-pink/20 to-tiktok-cyan/10 flex items-center justify-center mb-4">
                  <TikTokIcon className="w-6 h-6 text-tiktok-pink" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-2">Creators Verificados</h3>
                    <p className="text-sm text-muted-foreground">Clique para ver {creators.length} creators</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-tiktok-pink" />
                </div>
              </div>
              <div className="glass-card p-6 border-tiktok-cyan/20 hover:border-tiktok-cyan/40 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-tiktok-cyan/20 to-tiktok-pink/10 flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-tiktok-cyan" />
                </div>
                <h3 className="font-semibold mb-2">Alcance Global</h3>
                <p className="text-sm text-muted-foreground">Creators de diversos países no TikTok</p>
              </div>
            </div>

            {/* Filters Section */}
            <div className="space-y-6">
              {/* Search */}
              <div className="glass-card p-6 border-tiktok-cyan/10">
                <label className="block text-sm font-medium mb-4 flex items-center gap-2">
                  <Search className="w-4 h-4 text-tiktok-cyan" />
                  Buscar Produtos ou Creators
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                    placeholder="Ex: Virgínia Fonseca, Maquiagem, Ring Light..."
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-tiktok-cyan/50"
                  />
                </div>
              </div>

              {/* Niche Selection */}
              <div className="glass-card p-6 border-tiktok-pink/10">
                <label className="block text-sm font-medium mb-4 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-tiktok-pink" />
                  Selecione o Nicho
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {niches.map((niche) => {
                    const Icon = niche.icon;
                    return (
                      <button
                        key={niche.id}
                        onClick={() => setSelectedNiche(selectedNiche === niche.id ? null : niche.id)}
                        className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
                          selectedNiche === niche.id
                            ? "bg-gradient-to-br from-tiktok-cyan/20 to-tiktok-pink/20 border-tiktok-cyan text-foreground"
                            : "bg-muted/50 border-border hover:border-tiktok-cyan/50 text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Icon className={cn("w-6 h-6", selectedNiche === niche.id && "text-tiktok-cyan")} />
                        <span className="text-sm">{niche.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Location Selection */}
              <div className="glass-card p-6 border-tiktok-cyan/10">
                <label className="block text-sm font-medium mb-4 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-tiktok-cyan" />
                  Localização do Creator
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {locations.map((location) => (
                    <button
                      key={location.id}
                      onClick={() => setSelectedLocation(selectedLocation === location.id ? null : location.id)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
                        selectedLocation === location.id
                          ? "bg-gradient-to-br from-tiktok-cyan/20 to-tiktok-pink/20 border-tiktok-pink text-foreground"
                          : "bg-muted/50 border-border hover:border-tiktok-pink/50 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span className="text-2xl">{location.flag}</span>
                      <span className="text-xs">{location.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleReset}
                  className="flex-1 py-4 rounded-xl bg-muted border border-border text-muted-foreground font-medium hover:bg-muted/80 transition-all"
                >
                  Limpar Filtros
                </button>
                <button
                  onClick={handleSearch}
                  className="flex-1 py-4 rounded-xl bg-gradient-to-r from-tiktok-cyan via-tiktok-pink to-tiktok-cyan text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-tiktok-pink/20"
                >
                  <TikTokIcon className="w-5 h-5" />
                  Buscar no TikTok
                  <ArrowRight className="w-5 h-5" />
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {viewState === 'loading' && <LoadingAnimation />}

        {viewState === 'results' && (
          <div className="animate-fade-in">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Resultados da Busca</h2>
                <p className="text-muted-foreground">{filteredCreators.length} creators encontrados</p>
              </div>
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-lg bg-muted border border-border text-sm hover:bg-muted/80 transition-all"
              >
                Nova Busca
              </button>
            </div>

            {/* Active Filters */}
            {(searchProduct || selectedNiche || selectedLocation) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {searchProduct && (
                  <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm">
                    Busca: {searchProduct}
                  </span>
                )}
                {selectedNiche && (
                  <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm">
                    Nicho: {niches.find(n => n.id === selectedNiche)?.name}
                  </span>
                )}
                {selectedLocation && (
                  <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm">
                    {locations.find(l => l.id === selectedLocation)?.flag} {locations.find(l => l.id === selectedLocation)?.name}
                  </span>
                )}
              </div>
            )}

            {/* Brasil Section */}
            {filteredCreators.some(c => c.location === "Brasil") && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">🇧🇷</span>
                  <h3 className="text-xl font-bold">Brasil</h3>
                  <span className="text-sm text-muted-foreground">Top {filteredCreators.filter(c => c.location === "Brasil").length}</span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredCreators
                    .filter(c => c.location === "Brasil")
                    .map((creator, index) => (
                      <div key={creator.id} className="relative">
                        <div className="absolute -left-2 -top-2 w-8 h-8 rounded-full bg-gradient-to-br from-tiktok-cyan to-tiktok-pink flex items-center justify-center text-sm font-bold text-background z-10">
                          {index + 1}
                        </div>
                        <CreatorCard 
                          creator={creator} 
                          onClick={() => navigate(`/creator/${creator.id}`)}
                        />
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Estados Unidos Section */}
            {filteredCreators.some(c => c.location === "Estados Unidos") && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">🇺🇸</span>
                  <h3 className="text-xl font-bold">Estados Unidos</h3>
                  <span className="text-sm text-muted-foreground">Top {filteredCreators.filter(c => c.location === "Estados Unidos").length}</span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredCreators
                    .filter(c => c.location === "Estados Unidos")
                    .map((creator, index) => (
                      <div key={creator.id} className="relative">
                        <div className="absolute -left-2 -top-2 w-8 h-8 rounded-full bg-gradient-to-br from-tiktok-cyan to-tiktok-pink flex items-center justify-center text-sm font-bold text-background z-10">
                          {index + 1}
                        </div>
                        <CreatorCard 
                          creator={creator} 
                          onClick={() => navigate(`/creator/${creator.id}`)}
                        />
                      </div>
                    ))}
                </div>
              </div>
            )}

            {filteredCreators.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum creator encontrado com esses filtros</p>
                <button
                  onClick={handleReset}
                  className="mt-4 px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm"
                >
                  Tentar novamente
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Spy;
