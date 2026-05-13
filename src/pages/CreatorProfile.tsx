import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Eye, Heart, Play, TrendingUp, ExternalLink, Share2, Star, ShoppingCart } from "lucide-react";

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
import nevinMourad from "@/assets/karol-finkler.jpg";
import thaisFavero from "@/assets/thais-favero.jpg";
import robertRibeiro from "@/assets/robert-ribeiro.jpg";
import diogoBotti from "@/assets/diogo-bottino.jpg";
import lissCompartilha from "@/assets/liss-compartilha.jpg";
import anielleRosso from "@/assets/anielle-rosso.jpg";
import shigueoNakahara from "@/assets/shigueo-nakahara.jpg";
import karolFinkler from "@/assets/thais-favero.jpg";

// Import product images - WePink
// Import product images - Dr. Pimenta
// Import product images - AlwaysFit
// Import product images - Viih Tube
// Import product images - Camilla Pudim
// Import product images - Vittare Home
// Import product images - Yuri Meirelles
// Import product images - Maisonde Parfum

// Import video thumbnails - Dr. Pimenta
import drpimentaVideo1 from "@/assets/videos/drpimenta-video-1.jpg";
import drpimentaVideo2 from "@/assets/videos/drpimenta-video-2.jpg";
import drpimentaVideo3 from "@/assets/videos/drpimenta-video-3.jpg";
// Import video thumbnails - AlwaysFit
import alwaysfitVideo1 from "@/assets/videos/alwaysfit-video-1.jpg";
import alwaysfitVideo2 from "@/assets/videos/alwaysfit-video-2.jpg";
import alwaysfitVideo3 from "@/assets/videos/alwaysfit-video-3.jpg";
// Import video thumbnails - Viih Tube
import viihtubeVideo1 from "@/assets/videos/viihtube-video-1.jpg";
import viihtubeVideo2 from "@/assets/videos/viihtube-video-2.jpg";
import viihtubeVideo3 from "@/assets/videos/viihtube-video-3.jpg";
// Import video thumbnails - Camilla Pudim
import camillapudimVideo1 from "@/assets/videos/camillapudim-video-1.jpg";
import camillapudimVideo2 from "@/assets/videos/camillapudim-video-2.jpg";
import camillapudimVideo3 from "@/assets/videos/camillapudim-video-3.jpg";
// Import video thumbnails - Vittare Home
import vittarehomeVideo1 from "@/assets/videos/vittarehome-video-1.jpg";
import vittarehomeVideo2 from "@/assets/videos/vittarehome-video-2.jpg";
import vittarehomeVideo3 from "@/assets/videos/vittarehome-video-3.jpg";
// Import video thumbnails - Yuri Meirelles
import yurimeirellesVideo1 from "@/assets/videos/yurimeirelles-video-1.jpg";
import yurimeirellesVideo2 from "@/assets/videos/yurimeirelles-video-2.jpg";
import yurimeirellesVideo3 from "@/assets/videos/yurimeirelles-video-3.jpg";
// Import video thumbnails - Maisonde Parfum
import maisondeparfumVideo1 from "@/assets/videos/maisondeparfum-video-1.jpg";
import maisondeparfumVideo2 from "@/assets/videos/maisondeparfum-video-2.jpg";
import maisondeparfumVideo3 from "@/assets/videos/maisondeparfum-video-3.jpg";

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
  111: virginiaFonseca,
  // New creators
  201: moisesLeal,
  202: nevinMourad,
  203: thaisFavero,
  205: robertRibeiro,
  206: diogoBotti,
  207: lissCompartilha,
  208: anielleRosso,
  209: shigueoNakahara,
  215: karolFinkler,
};

// Product images mapping by creator ID and product index
const productImages: Record<number, string[]> = {
  101: ["/products/wepink-product-1.webp", "/products/wepink-product-2.webp", "/products/wepink-product-3.webp"],
  102: ["/products/drpimenta-product-1.webp", "/products/drpimenta-product-2.webp", "/products/drpimenta-product-3.webp"],
  103: ["/products/alwaysfit-product-1.webp", "/products/alwaysfit-product-2.webp", "/products/alwaysfit-product-3.webp"],
  105: ["/products/viihtube-product-1.webp", "/products/viihtube-product-2.webp", "/products/viihtube-product-3.webp"],
  107: ["/products/camillapudim-product-1.webp", "/products/camillapudim-product-2.webp", "/products/camillapudim-product-3.webp"],
  108: ["/products/vittarehome-product-1.webp", "/products/vittarehome-product-2.webp", "/products/vittarehome-product-3.webp"],
  109: ["/products/yurimeirelles-product-1.webp", "/products/yurimeirelles-product-2.webp", "/products/yurimeirelles-product-3.webp"],
  110: ["/products/maisondeparfum-product-1.webp", "/products/maisondeparfum-product-2.webp", "/products/maisondeparfum-product-3.webp"],
};

// Video thumbnail images mapping by creator ID
const videoImages: Record<number, string[]> = {
  102: [drpimentaVideo1, drpimentaVideo2, drpimentaVideo3],
  103: [alwaysfitVideo1, alwaysfitVideo2, alwaysfitVideo3],
  105: [viihtubeVideo1, viihtubeVideo2, viihtubeVideo3],
  107: [camillapudimVideo1, camillapudimVideo2, camillapudimVideo3],
  108: [vittarehomeVideo1, vittarehomeVideo2, vittarehomeVideo3],
  109: [yurimeirellesVideo1, yurimeirellesVideo2, yurimeirellesVideo3],
  110: [maisondeparfumVideo1, maisondeparfumVideo2, maisondeparfumVideo3],
};
const creatorsData: Record<number, any> = {
  // Top 15 Estados Unidos
  1: {
    id: 1,
    name: "Ty",
    username: "@dealswithty",
    avatar: "TY",
    niche: "Produtos Diversos",
    bio: "Maior vendedor de ofertas do TikTok Shop. Especialista em encontrar os melhores deals.",
    followers: "15M",
    views: "500M",
    likes: "45M",
    videos: 892,
    engagement: 9.2,
    verified: true,
    salesVolume: "$2.5M",
    topProducts: [{
      name: "Mystery Box Premium",
      sales: 45000,
      commission: "$450K"
    }, {
      name: "Gadget Deal Pack",
      sales: 32000,
      commission: "$320K"
    }, {
      name: "Home Essentials Kit",
      sales: 28000,
      commission: "$280K"
    }],
    recentVideos: [{
      title: "BEST DEAL I've ever found! 😱",
      views: "12M",
      likes: "980K",
      date: "1 dia"
    }, {
      title: "You NEED this for $5",
      views: "8.5M",
      likes: "720K",
      date: "3 dias"
    }, {
      title: "Amazon vs TikTok Shop prices",
      views: "15M",
      likes: "1.2M",
      date: "5 dias"
    }]
  },
  2: {
    id: 2,
    name: "Jeffree Star",
    username: "@jeffreestar",
    avatar: "JS",
    niche: "Maquiagem",
    bio: "Beauty mogul e ícone do YouTube. Fundador da Jeffree Star Cosmetics.",
    followers: "12M",
    views: "380M",
    likes: "38M",
    videos: 654,
    engagement: 8.8,
    verified: true,
    salesVolume: "$3.2M",
    topProducts: [{
      name: "Velvet Trap Lipstick",
      sales: 89000,
      commission: "$890K"
    }, {
      name: "Blood Money Palette",
      sales: 67000,
      commission: "$670K"
    }, {
      name: "Supreme Frost Highlighter",
      sales: 45000,
      commission: "$450K"
    }],
    recentVideos: [{
      title: "NEW Palette Reveal ✨",
      views: "18M",
      likes: "1.5M",
      date: "2 dias"
    }, {
      title: "Full Glam Tutorial",
      views: "9.2M",
      likes: "780K",
      date: "4 dias"
    }, {
      title: "Rating TikTok Beauty Hacks",
      views: "11M",
      likes: "920K",
      date: "1 semana"
    }]
  },
  3: {
    id: 3,
    name: "Josh Morris",
    username: "@myfamilypov",
    avatar: "JM",
    niche: "Conteúdo Familiar",
    bio: "Pai de família compartilhando momentos divertidos e produtos úteis para o dia a dia.",
    followers: "8.5M",
    views: "290M",
    likes: "28M",
    videos: 445,
    engagement: 8.5,
    verified: true,
    salesVolume: "$1.8M",
    topProducts: [{
      name: "Family Game Night Set",
      sales: 23000,
      commission: "$230K"
    }, {
      name: "Kitchen Gadget Bundle",
      sales: 19000,
      commission: "$190K"
    }, {
      name: "Kids Learning Toys",
      sales: 15000,
      commission: "$150K"
    }],
    recentVideos: [{
      title: "Kids LOVE this toy! 🎮",
      views: "6.8M",
      likes: "580K",
      date: "1 dia"
    }, {
      title: "Family prank gone wrong 😂",
      views: "12M",
      likes: "1.1M",
      date: "3 dias"
    }, {
      title: "Our morning routine",
      views: "5.2M",
      likes: "420K",
      date: "5 dias"
    }]
  },
  4: {
    id: 4,
    name: "LUSH🪴",
    username: "@be.lush",
    avatar: "LU",
    niche: "Beleza",
    bio: "Beauty influencer focada em skincare natural e cuidados pessoais sustentáveis.",
    followers: "7.2M",
    views: "210M",
    likes: "22M",
    videos: 389,
    engagement: 8.1,
    verified: true,
    salesVolume: "$1.5M",
    topProducts: [{
      name: "Skincare Routine Kit",
      sales: 34000,
      commission: "$340K"
    }, {
      name: "Natural Face Mask Set",
      sales: 28000,
      commission: "$280K"
    }, {
      name: "Organic Body Butter",
      sales: 21000,
      commission: "$210K"
    }],
    recentVideos: [{
      title: "Glass skin in 5 steps ✨",
      views: "8.9M",
      likes: "780K",
      date: "2 dias"
    }, {
      title: "My holy grail products",
      views: "6.2M",
      likes: "520K",
      date: "4 dias"
    }, {
      title: "Nighttime skincare routine",
      views: "7.5M",
      likes: "640K",
      date: "1 semana"
    }]
  },
  5: {
    id: 5,
    name: "Trending TT",
    username: "@trending_ttok",
    avatar: "TT",
    niche: "Tendências",
    bio: "Curador das maiores tendências do TikTok. Sempre na frente das novidades.",
    followers: "6.8M",
    views: "195M",
    likes: "19M",
    videos: 567,
    engagement: 7.9,
    verified: true,
    salesVolume: "$1.2M",
    topProducts: [{
      name: "Viral Product Bundle",
      sales: 18000,
      commission: "$180K"
    }, {
      name: "Trending Tech Gadgets",
      sales: 15000,
      commission: "$150K"
    }, {
      name: "TikTok Famous Items",
      sales: 12000,
      commission: "$120K"
    }],
    recentVideos: [{
      title: "Products going VIRAL 🚀",
      views: "9.1M",
      likes: "820K",
      date: "1 dia"
    }, {
      title: "Is this worth the hype?",
      views: "7.3M",
      likes: "610K",
      date: "3 dias"
    }, {
      title: "Testing viral products",
      views: "8.8M",
      likes: "750K",
      date: "5 dias"
    }]
  },
  6: {
    id: 6,
    name: "jessyjewelry1",
    username: "@jessyjewelry",
    avatar: "JJ",
    niche: "Joias",
    bio: "Designer de joias e especialista em acessórios elegantes.",
    followers: "5.4M",
    views: "160M",
    likes: "16M",
    videos: 412,
    engagement: 8.3,
    verified: true,
    salesVolume: "$980K",
    topProducts: [{
      name: "Gold Layer Necklace Set",
      sales: 28000,
      commission: "$280K"
    }, {
      name: "Diamond Stud Earrings",
      sales: 22000,
      commission: "$220K"
    }, {
      name: "Charm Bracelet Collection",
      sales: 18000,
      commission: "$180K"
    }],
    recentVideos: [{
      title: "Jewelry haul ✨💎",
      views: "4.2M",
      likes: "380K",
      date: "2 dias"
    }, {
      title: "How to layer necklaces",
      views: "3.8M",
      likes: "320K",
      date: "4 dias"
    }, {
      title: "Affordable luxury finds",
      views: "5.1M",
      likes: "450K",
      date: "1 semana"
    }]
  },
  7: {
    id: 7,
    name: "Carlie",
    username: "@carliejimenez",
    avatar: "CJ",
    niche: "Moda",
    bio: "Fashion influencer e stylist. Trazendo looks incríveis para todos os bolsos.",
    followers: "4.9M",
    views: "145M",
    likes: "14M",
    videos: 378,
    engagement: 7.8,
    verified: true,
    salesVolume: "$890K",
    topProducts: [{
      name: "Trendy Outfit Set",
      sales: 19000,
      commission: "$190K"
    }, {
      name: "Accessories Bundle",
      sales: 15000,
      commission: "$150K"
    }, {
      name: "Shoes Collection",
      sales: 12000,
      commission: "$120K"
    }],
    recentVideos: [{
      title: "OOTD on a budget 👗",
      views: "3.8M",
      likes: "340K",
      date: "1 dia"
    }, {
      title: "Fall fashion haul",
      views: "4.5M",
      likes: "390K",
      date: "3 dias"
    }, {
      title: "Styling tips for petites",
      views: "3.2M",
      likes: "280K",
      date: "5 dias"
    }]
  },
  8: {
    id: 8,
    name: "Highland Fashion",
    username: "@highland.fashion",
    avatar: "HF",
    niche: "Moda",
    bio: "Boutique de moda com as últimas tendências direto das passarelas.",
    followers: "4.5M",
    views: "130M",
    likes: "13M",
    videos: 298,
    engagement: 8.0,
    verified: true,
    salesVolume: "$820K",
    topProducts: [{
      name: "Designer Dress Replica",
      sales: 15000,
      commission: "$150K"
    }, {
      name: "Luxury Bag Collection",
      sales: 12000,
      commission: "$120K"
    }, {
      name: "Statement Pieces",
      sales: 9000,
      commission: "$90K"
    }],
    recentVideos: [{
      title: "New arrivals! 🛍️",
      views: "3.2M",
      likes: "290K",
      date: "2 dias"
    }, {
      title: "How to style blazers",
      views: "2.8M",
      likes: "250K",
      date: "4 dias"
    }, {
      title: "Runway to reality",
      views: "3.5M",
      likes: "310K",
      date: "1 semana"
    }]
  },
  9: {
    id: 9,
    name: "Crippen Rippen",
    username: "@crippenrippen",
    avatar: "CR",
    niche: "Produtos Diversos",
    bio: "Encontrando os melhores produtos em todas as categorias.",
    followers: "4.1M",
    views: "118M",
    likes: "11M",
    videos: 456,
    engagement: 7.5,
    verified: true,
    salesVolume: "$750K",
    topProducts: [{
      name: "Home Gadget Set",
      sales: 12000,
      commission: "$120K"
    }, {
      name: "Tech Accessories",
      sales: 10000,
      commission: "$100K"
    }, {
      name: "Lifestyle Bundle",
      sales: 8000,
      commission: "$80K"
    }],
    recentVideos: [{
      title: "Things you didn't know existed",
      views: "5.2M",
      likes: "450K",
      date: "1 dia"
    }, {
      title: "Best Amazon finds",
      views: "4.1M",
      likes: "360K",
      date: "3 dias"
    }, {
      title: "Unboxing mystery items",
      views: "3.8M",
      likes: "330K",
      date: "5 dias"
    }]
  },
  10: {
    id: 10,
    name: "Alle",
    username: "@allure_fashion",
    avatar: "AL",
    niche: "Moda",
    bio: "Moda e beleza para mulheres modernas. Elegância acessível.",
    followers: "3.8M",
    views: "105M",
    likes: "10M",
    videos: 345,
    engagement: 8.2,
    verified: true,
    salesVolume: "$680K",
    topProducts: [{
      name: "Makeup Essentials Kit",
      sales: 14000,
      commission: "$140K"
    }, {
      name: "Fashion Accessories",
      sales: 11000,
      commission: "$110K"
    }, {
      name: "Beauty Tools Set",
      sales: 9000,
      commission: "$90K"
    }],
    recentVideos: [{
      title: "Get ready with me 💄",
      views: "2.9M",
      likes: "260K",
      date: "2 dias"
    }, {
      title: "Summer lookbook",
      views: "3.4M",
      likes: "300K",
      date: "4 dias"
    }, {
      title: "My beauty favorites",
      views: "2.6M",
      likes: "230K",
      date: "1 semana"
    }]
  },
  11: {
    id: 11,
    name: "Mikayla Nogueira",
    username: "@mikaylanogueira",
    avatar: "MN",
    niche: "Maquiagem",
    bio: "Makeup artist profissional. Tutoriais honestos e reviews reais.",
    followers: "3.5M",
    views: "98M",
    likes: "9.5M",
    videos: 289,
    engagement: 8.6,
    verified: true,
    salesVolume: "$620K",
    topProducts: [{
      name: "Foundation Collection",
      sales: 11000,
      commission: "$110K"
    }, {
      name: "Lip Product Bundle",
      sales: 9000,
      commission: "$90K"
    }, {
      name: "Eye Palette Set",
      sales: 7500,
      commission: "$75K"
    }],
    recentVideos: [{
      title: "HONEST product review",
      views: "4.8M",
      likes: "420K",
      date: "1 dia"
    }, {
      title: "Drugstore vs High-end",
      views: "3.9M",
      likes: "350K",
      date: "3 dias"
    }, {
      title: "Full coverage tutorial",
      views: "3.2M",
      likes: "290K",
      date: "5 dias"
    }]
  },
  12: {
    id: 12,
    name: "POP MART US SHOP",
    username: "@popmart.usshop",
    avatar: "PM",
    niche: "Colecionáveis",
    bio: "Loja oficial de blind boxes e colecionáveis POP MART.",
    followers: "3.2M",
    views: "88M",
    likes: "8.8M",
    videos: 234,
    engagement: 7.9,
    verified: true,
    salesVolume: "$580K",
    topProducts: [{
      name: "Molly Blind Box",
      sales: 18000,
      commission: "$180K"
    }, {
      name: "Dimoo Collection",
      sales: 14000,
      commission: "$140K"
    }, {
      name: "SKULLPANDA Series",
      sales: 11000,
      commission: "$110K"
    }],
    recentVideos: [{
      title: "Unboxing new release! 📦",
      views: "2.8M",
      likes: "250K",
      date: "2 dias"
    }, {
      title: "Rare find opening",
      views: "3.5M",
      likes: "310K",
      date: "4 dias"
    }, {
      title: "Full collection reveal",
      views: "2.4M",
      likes: "210K",
      date: "1 semana"
    }]
  },
  13: {
    id: 13,
    name: "simplymandys",
    username: "@simplymandys",
    avatar: "SM",
    niche: "Produtos Diversos",
    bio: "Encontrando produtos incríveis para simplificar sua vida.",
    followers: "2.9M",
    views: "78M",
    likes: "7.8M",
    videos: 412,
    engagement: 7.6,
    verified: true,
    salesVolume: "$520K",
    topProducts: [{
      name: "Organization Set",
      sales: 9000,
      commission: "$90K"
    }, {
      name: "Kitchen Helpers",
      sales: 7500,
      commission: "$75K"
    }, {
      name: "Cleaning Bundle",
      sales: 6000,
      commission: "$60K"
    }],
    recentVideos: [{
      title: "Products that changed my life",
      views: "3.1M",
      likes: "280K",
      date: "1 dia"
    }, {
      title: "Amazon must-haves",
      views: "2.6M",
      likes: "230K",
      date: "3 dias"
    }, {
      title: "Home organization tips",
      views: "2.2M",
      likes: "200K",
      date: "5 dias"
    }]
  },
  14: {
    id: 14,
    name: "Ty (Conta Secundária)",
    username: "@dealswithty_2",
    avatar: "T2",
    niche: "Produtos Diversos",
    bio: "Conta secundária de @dealswithty. Mais deals incríveis!",
    followers: "2.6M",
    views: "68M",
    likes: "6.8M",
    videos: 198,
    engagement: 8.1,
    verified: true,
    salesVolume: "$480K",
    topProducts: [{
      name: "Flash Sale Items",
      sales: 8000,
      commission: "$80K"
    }, {
      name: "Limited Edition Deals",
      sales: 6500,
      commission: "$65K"
    }, {
      name: "Exclusive Bundles",
      sales: 5000,
      commission: "$50K"
    }],
    recentVideos: [{
      title: "Deals of the day! 🔥",
      views: "2.4M",
      likes: "210K",
      date: "2 dias"
    }, {
      title: "Hidden gems on TikTok Shop",
      views: "2.1M",
      likes: "190K",
      date: "4 dias"
    }, {
      title: "Price drops alert!",
      views: "1.9M",
      likes: "170K",
      date: "1 semana"
    }]
  },
  15: {
    id: 15,
    name: "Jeffree Star (Conta Secundária)",
    username: "@jeffreestar_2",
    avatar: "J2",
    niche: "Maquiagem",
    bio: "Conta secundária de @jeffreestar. Mais conteúdo de beleza!",
    followers: "2.3M",
    views: "58M",
    likes: "5.8M",
    videos: 156,
    engagement: 7.8,
    verified: true,
    salesVolume: "$420K",
    topProducts: [{
      name: "Mini Lip Collection",
      sales: 7000,
      commission: "$70K"
    }, {
      name: "Travel Size Set",
      sales: 5500,
      commission: "$55K"
    }, {
      name: "Exclusive Shades",
      sales: 4500,
      commission: "$45K"
    }],
    recentVideos: [{
      title: "Quick glam look ✨",
      views: "2.2M",
      likes: "200K",
      date: "1 dia"
    }, {
      title: "New lip swatches",
      views: "1.9M",
      likes: "170K",
      date: "3 dias"
    }, {
      title: "Behind the scenes",
      views: "1.7M",
      likes: "150K",
      date: "5 dias"
    }]
  },
  // Top 10 Brasil
  101: {
    id: 101,
    name: "WePink",
    username: "@wepink_",
    avatar: "WP",
    niche: "Beleza",
    bio: "Marca de cosméticos fundada por Virgínia Fonseca. Uma das maiores operações de beleza no TikTok Brasil.",
    followers: "350K",
    views: "1.2B",
    likes: "120M",
    videos: 1200,
    engagement: 9.5,
    verified: true,
    salesVolume: "R$ 750M+",
    topProducts: [{
      name: "Gloss Labial My Lips",
      sales: 850000,
      commission: "R$ 25M"
    }, {
      name: "Batom Líquido WeLips Matte",
      sales: 620000,
      commission: "R$ 18M"
    }, {
      name: "Paleta de Sombras We",
      sales: 480000,
      commission: "R$ 14M"
    }],
    recentVideos: [{
      title: "Novidades WePink! 💗",
      views: "45M",
      likes: "4.2M",
      date: "1 dia",
      url: "https://vt.tiktok.com/ZSP9bP5SR/"
    }, {
      title: "Maquiagem do dia",
      views: "32M",
      likes: "2.9M",
      date: "2 dias",
      url: "https://vt.tiktok.com/ZSP9bq2kh/"
    }, {
      title: "Rotina com as Marias",
      views: "28M",
      likes: "2.5M",
      date: "4 dias",
      url: "https://vt.tiktok.com/ZSP9b3bjR/"
    }]
  },
  111: {
    id: 111,
    name: "Virgínia Fonseca",
    username: "@virginiafonseca",
    avatar: "VF",
    niche: "Beleza",
    bio: "Empresária, influenciadora e mãe. Fundadora da WePink.",
    followers: "48M",
    views: "1.2B",
    likes: "120M",
    videos: 1200,
    engagement: 9.5,
    verified: true,
    salesVolume: "R$ 750M+",
    topProducts: [{
      name: "Gloss Labial My Lips",
      sales: 850000,
      commission: "R$ 25M"
    }, {
      name: "Batom Líquido WeLips Matte",
      sales: 620000,
      commission: "R$ 18M"
    }, {
      name: "Paleta de Sombras We",
      sales: 480000,
      commission: "R$ 14M"
    }],
    recentVideos: [{
      title: "Novidades WePink! 💗",
      views: "45M",
      likes: "4.2M",
      date: "1 dia"
    }, {
      title: "Maquiagem do dia",
      views: "32M",
      likes: "2.9M",
      date: "2 dias"
    }, {
      title: "Rotina com as Marias",
      views: "28M",
      likes: "2.5M",
      date: "4 dias"
    }]
  },
  102: {
    id: 102,
    name: "Dr. Pimenta",
    username: "@drpimenta",
    avatar: "DP",
    niche: "Perfumes",
    bio: "Especialista em perfumes e fragrâncias. Fundador da marca Dr. Pimenta.",
    followers: "8.5M",
    views: "280M",
    likes: "28M",
    videos: 456,
    engagement: 8.8,
    verified: true,
    salesVolume: "R$ 15M+",
    topProducts: [{
      name: "Lattafa Yara EDP",
      sales: 125000,
      commission: "R$ 6.2M"
    }, {
      name: "Lattafa Najdia",
      sales: 98000,
      commission: "R$ 4.9M"
    }, {
      name: "Kit Perfumes Árabes",
      sales: 75000,
      commission: "R$ 3.7M"
    }],
    recentVideos: [{
      title: "Perfume que mais vende!",
      views: "8.2M",
      likes: "720K",
      date: "2 dias",
      url: "https://vt.tiktok.com/ZSPVe845v/"
    }, {
      title: "Review perfume árabe",
      views: "6.5M",
      likes: "580K",
      date: "4 dias",
      url: "https://vt.tiktok.com/ZSPVeM7GB/"
    }, {
      title: "Top 5 fragrâncias 2024",
      views: "9.1M",
      likes: "810K",
      date: "1 semana",
      url: "https://vt.tiktok.com/ZSPVeBMtN/"
    }]
  },
  103: {
    id: 103,
    name: "Always Fit (Zhang Ye)",
    username: "@alwaysfit.com.br",
    avatar: "AF",
    niche: "Fitness",
    bio: "Empresário fitness e especialista em suplementos. R$ 100M de faturamento anual.",
    followers: "7.2M",
    views: "240M",
    likes: "24M",
    videos: 678,
    engagement: 8.5,
    verified: true,
    salesVolume: "R$ 100M/ano",
    topProducts: [{
      name: "ProCurcumin C3",
      sales: 180000,
      commission: "R$ 18M"
    }, {
      name: "Whey Protein Premium",
      sales: 145000,
      commission: "R$ 14.5M"
    }, {
      name: "Colágeno Verisol",
      sales: 112000,
      commission: "R$ 11.2M"
    }],
    recentVideos: [{
      title: "Suplemento que funciona!",
      views: "7.8M",
      likes: "690K",
      date: "1 dia",
      url: "https://vt.tiktok.com/ZSP9pP8KG/"
    }, {
      title: "Como ganhar massa muscular",
      views: "5.4M",
      likes: "480K",
      date: "3 dias",
      url: "https://vt.tiktok.com/ZSP9pNkHp/"
    }, {
      title: "Treino completo em casa",
      views: "6.2M",
      likes: "550K",
      date: "5 dias",
      url: "https://vt.tiktok.com/ZSP9p5n3v/"
    }]
  },
  104: {
    id: 104,
    name: "Tirulipa",
    username: "@tiirulipaa",
    avatar: "TI",
    niche: "Humor",
    bio: "Humorista e influenciador. Filho do Tiririca. Conteúdo de humor e produtos diversos.",
    followers: "32M",
    views: "890M",
    likes: "89M",
    videos: 890,
    engagement: 8.9,
    verified: true,
    salesVolume: "R$ 8M+",
    topProducts: [{
      name: "Produtos Virais",
      sales: 45000,
      commission: "R$ 2.2M"
    }, {
      name: "Gadgets Divertidos",
      sales: 38000,
      commission: "R$ 1.9M"
    }, {
      name: "Itens de Pegadinha",
      sales: 29000,
      commission: "R$ 1.4M"
    }],
    recentVideos: [{
      title: "PEGADINHA com produto viral 😂",
      views: "25M",
      likes: "2.2M",
      date: "1 dia"
    }, {
      title: "Testando gadgets estranhos",
      views: "18M",
      likes: "1.6M",
      date: "3 dias"
    }, {
      title: "Comprando tudo que aparece",
      views: "21M",
      likes: "1.9M",
      date: "5 dias"
    }]
  },
  105: {
    id: 105,
    name: "Viih Tube",
    username: "@viihtube",
    avatar: "VT",
    niche: "Beleza",
    bio: "Influenciadora digital, ex-BBB e empresária. Mãe da Lua.",
    followers: "28M",
    views: "780M",
    likes: "78M",
    videos: 567,
    engagement: 8.7,
    verified: true,
    salesVolume: "R$ 8M+",
    topProducts: [{
      name: "Kit Skincare Hidratante",
      sales: 58000,
      commission: "R$ 2.9M"
    }, {
      name: "Sérum Vitamina C",
      sales: 45000,
      commission: "R$ 2.2M"
    }, {
      name: "Máscara Capilar Nutrição",
      sales: 36000,
      commission: "R$ 1.8M"
    }],
    recentVideos: [{
      title: "Rotina de beleza da mamãe 💕",
      views: "15M",
      likes: "1.3M",
      date: "2 dias",
      url: "https://vt.tiktok.com/ZSP9srWDv/"
    }, {
      title: "Favoritos do mês",
      views: "12M",
      likes: "1.1M",
      date: "4 dias",
      url: "https://vt.tiktok.com/ZSP9seMV5/"
    }, {
      title: "Get ready comigo",
      views: "18M",
      likes: "1.6M",
      date: "1 semana",
      url: "https://vt.tiktok.com/ZSP9seps4/"
    }]
  },
  106: {
    id: 106,
    name: "Mari Saad",
    username: "@marisaad",
    avatar: "MS",
    niche: "Maquiagem",
    bio: "Maquiadora profissional e influenciadora. Fundadora da Mascavo.",
    followers: "12M",
    views: "350M",
    likes: "35M",
    videos: 445,
    engagement: 8.4,
    verified: true,
    salesVolume: "R$ 5M+",
    topProducts: [{
      name: "Batom Líquido Mascavo",
      sales: 48000,
      commission: "R$ 2.4M"
    }, {
      name: "Base HD",
      sales: 39000,
      commission: "R$ 1.9M"
    }, {
      name: "Paleta de Contorno",
      sales: 31000,
      commission: "R$ 1.5M"
    }],
    recentVideos: [{
      title: "Tutorial maquiagem completa",
      views: "8.5M",
      likes: "750K",
      date: "1 dia"
    }, {
      title: "Lançamentos Mascavo",
      views: "6.2M",
      likes: "550K",
      date: "3 dias"
    }, {
      title: "Dicas de make para iniciantes",
      views: "7.8M",
      likes: "690K",
      date: "5 dias"
    }]
  },
  107: {
    id: 107,
    name: "Camilla Pudim",
    username: "@camilapudim",
    avatar: "CP",
    niche: "Maquiagem",
    bio: "Makeup artist e influenciadora. Especialista em makes coloridas e criativas.",
    followers: "10M",
    views: "290M",
    likes: "29M",
    videos: 389,
    engagement: 8.2,
    verified: true,
    salesVolume: "R$ 5M+",
    topProducts: [{
      name: "Paleta Arco-Íris 24 Cores",
      sales: 45000,
      commission: "R$ 2.2M"
    }, {
      name: "Kit Glitter Holográfico",
      sales: 35000,
      commission: "R$ 1.7M"
    }, {
      name: "Base HD Full Coverage",
      sales: 28000,
      commission: "R$ 1.4M"
    }],
    recentVideos: [{
      title: "Make arco-íris 🌈",
      views: "5.8M",
      likes: "510K",
      date: "2 dias",
      url: "https://vt.tiktok.com/ZSP9seps4/"
    }, {
      title: "Transformação incrível",
      views: "7.2M",
      likes: "640K",
      date: "4 dias",
      url: "https://vt.tiktok.com/ZSP9GevfB/"
    }, {
      title: "Trend makeup tutorial",
      views: "4.9M",
      likes: "430K",
      date: "1 semana",
      url: "https://vt.tiktok.com/ZSP9G1y3X/"
    }]
  },
  108: {
    id: 108,
    name: "Vittare Home",
    username: "@vittarehome",
    avatar: "VH",
    niche: "Casa",
    bio: "Loja de cama, mesa e banho. Produtos de qualidade para sua casa.",
    followers: "1.5M",
    views: "45M",
    likes: "4.5M",
    videos: 234,
    engagement: 9.1,
    verified: true,
    salesVolume: "R$ 500K+",
    topProducts: [{
      name: "Jogo de Cama Pima 400 Fios",
      sales: 12000,
      commission: "R$ 180K"
    }, {
      name: "Kit Toalhas Egípcias",
      sales: 9500,
      commission: "R$ 142K"
    }, {
      name: "Cobre-Leito Bordado",
      sales: 7200,
      commission: "R$ 108K"
    }],
    recentVideos: [{
      title: "Transforme seu quarto 🛏️",
      views: "1.8M",
      likes: "160K",
      date: "1 dia",
      url: "https://vt.tiktok.com/ZSP9GoU34/"
    }, {
      title: "Novidades na loja",
      views: "1.4M",
      likes: "125K",
      date: "3 dias",
      url: "https://vt.tiktok.com/ZSP9tNpPE/"
    }, {
      title: "Como arrumar a cama",
      views: "2.1M",
      likes: "190K",
      date: "5 dias",
      url: "https://vt.tiktok.com/ZSP9t1YQ5/"
    }]
  },
  109: {
    id: 109,
    name: "Yuri Meirelles",
    username: "@_yurimeirelles",
    avatar: "YM",
    niche: "Fitness",
    bio: "Atleta e influenciador fitness. Especialista em treinos e suplementação.",
    followers: "1.6M",
    views: "150M",
    likes: "74.0M",
    videos: 420,
    engagement: 8.5,
    verified: true,
    salesVolume: "R$ 3M+",
    topProducts: [{
      name: "Whey Protein Isolado",
      sales: 32000,
      commission: "R$ 1.6M"
    }, {
      name: "Creatina Monohidratada",
      sales: 25000,
      commission: "R$ 1.2M"
    }, {
      name: "Pré-Treino Extreme",
      sales: 18000,
      commission: "R$ 900K"
    }],
    recentVideos: [{
      title: "Treino pesado do dia 💪",
      views: "5.2M",
      likes: "460K",
      date: "2 dias",
      url: "https://vt.tiktok.com/ZSP9tvdf2/"
    }, {
      title: "Suplementação correta",
      views: "6.8M",
      likes: "600K",
      date: "4 dias",
      url: "https://vt.tiktok.com/ZSP9tgp2L/"
    }, {
      title: "Dieta de cutting",
      views: "4.5M",
      likes: "400K",
      date: "1 semana",
      url: "https://vt.tiktok.com/ZSP9nd9bd/"
    }]
  },
  110: {
    id: 110,
    name: "Maisonde Parfum",
    username: "@maisondeparfum.store",
    avatar: "MP",
    niche: "Perfumes",
    bio: "Especialista em perfumaria. Os melhores perfumes importados e nacionais.",
    followers: "34.6K",
    views: "95M",
    likes: "115.4K",
    videos: 312,
    engagement: 8.9,
    verified: true,
    salesVolume: "R$ 2M+",
    topProducts: [{
      name: "Lattafa Asad EDP",
      sales: 18000,
      commission: "R$ 900K"
    }, {
      name: "Afnan 9PM EDP",
      sales: 14000,
      commission: "R$ 700K"
    }, {
      name: "Armaf Club de Nuit",
      sales: 11000,
      commission: "R$ 550K"
    }],
    recentVideos: [{
      title: "Perfume viral do momento 🔥",
      views: "890K",
      likes: "78K",
      date: "1 dia",
      url: "https://vt.tiktok.com/ZSP9vrULg/"
    }, {
      title: "Top 5 perfumes masculinos",
      views: "1.2M",
      likes: "105K",
      date: "3 dias",
      url: "https://vt.tiktok.com/ZSP9vrkyD/"
    }, {
      title: "Contratipos que valem a pena",
      views: "650K",
      likes: "58K",
      date: "5 dias",
      url: "https://vt.tiktok.com/ZSP97KFwV/"
    }]
  },
  // Novos creators adicionados
  201: {
    id: 201,
    name: "Moisés Leal",
    username: "@moisesleall",
    avatar: "ML",
    niche: "Eletrônicos",
    bio: "Maior vendedor do TikTok Shop Brasil. Especialista em gadgets e eletrônicos virais.",
    followers: "1.2M",
    views: "500M",
    likes: "45M",
    videos: 890,
    engagement: 9.8,
    verified: true,
    salesVolume: "R$ 24M+",
    topProducts: [{
      name: "Fone Bluetooth TWS Pro",
      sales: 28000,
      commission: "R$ 2.8M"
    }, {
      name: "Smartwatch D20 Pro",
      sales: 22000,
      commission: "R$ 1.5M"
    }, {
      name: "Carregador Portátil 20000mAh",
      sales: 18000,
      commission: "R$ 1.2M"
    }],
    recentVideos: [{
      title: "64 MIL produtos vendidos na Black Friday 🔥",
      views: "22M",
      likes: "1.8M",
      date: "nov 2025",
      url: "https://www.tiktok.com/@moisesleall"
    }, {
      title: "Fone TWS que mais vende no TikTok Shop",
      views: "18M",
      likes: "1.5M",
      date: "nov 2025",
      url: "https://www.tiktok.com/@moisesleall"
    }, {
      title: "R$2,5 MILHÕES em um mês - RECORDE 💰",
      views: "15M",
      likes: "1.2M",
      date: "dez 2025",
      url: "https://www.tiktok.com/@moisesleall"
    }]
  },
  202: {
    id: 202,
    name: "Nevin Mourad",
    username: "@nevinmourad",
    avatar: "NM",
    niche: "Utilidades",
    bio: "Top 10 criadores TikTok Shop Brasil. Especialista em utilidades domésticas e achados incríveis.",
    followers: "800K",
    views: "320M",
    likes: "28M",
    videos: 650,
    engagement: 9.2,
    verified: true,
    salesVolume: "R$ 6M+",
    topProducts: [{
      name: "Organizador Multiuso 360°",
      sales: 15000,
      commission: "R$ 750K"
    }, {
      name: "Aspirador Portátil USB",
      sales: 12000,
      commission: "R$ 600K"
    }, {
      name: "Luminária LED Recarregável",
      sales: 10000,
      commission: "R$ 450K"
    }],
    recentVideos: [{
      title: "Top 10 Criadores TikTok Shop: Desafio e Gratidão",
      views: "6.5M",
      likes: "520K",
      date: "dez 2025",
      url: "https://www.tiktok.com/@nevinmourad/video/7505152641375227191"
    }, {
      title: "Organizador giratório 360° que ESGOTOU",
      views: "5.8M",
      likes: "465K",
      date: "nov 2025",
      url: "https://www.tiktok.com/@nevinmourad"
    }, {
      title: "Achados que TODO MUNDO precisa ter",
      views: "7.2M",
      likes: "580K",
      date: "nov 2025",
      url: "https://www.tiktok.com/@nevinmourad"
    }]
  },
  203: {
    id: 203,
    name: "Thais Favero",
    username: "@creatorthaisfavero",
    avatar: "TF",
    niche: "Casa",
    bio: "Especialista em utilidades domésticas e produtos para cozinha. Encontrando os melhores achados.",
    followers: "450K",
    views: "180M",
    likes: "15M",
    videos: 420,
    engagement: 8.9,
    verified: true,
    salesVolume: "R$ 650K+",
    topProducts: [{
      name: "Cortador de Legumes 12 em 1",
      sales: 8500,
      commission: "R$ 255K"
    }, {
      name: "Panela Elétrica Multifuncional",
      sales: 6200,
      commission: "R$ 186K"
    }, {
      name: "Organizador de Pia Inox",
      sales: 5800,
      commission: "R$ 145K"
    }],
    recentVideos: [{
      title: "Cortador de legumes 12 em 1 - VIRAL 🍳",
      views: "3.8M",
      likes: "305K",
      date: "nov 2025",
      url: "https://www.tiktok.com/@creatorthaisfavero"
    }, {
      title: "Panela elétrica que cozinha TUDO sozinha",
      views: "2.9M",
      likes: "232K",
      date: "nov 2025",
      url: "https://www.tiktok.com/@creatorthaisfavero"
    }, {
      title: "Organizador de pia que viralizou",
      views: "4.1M",
      likes: "328K",
      date: "out 2025",
      url: "https://www.tiktok.com/@creatorthaisfavero"
    }]
  },
  205: {
    id: 205,
    name: "Robert Ribeiro",
    username: "@robert.ribeiro12",
    avatar: "RR",
    niche: "Eletrônicos",
    bio: "Tech reviewer e afiliado. Testando os melhores gadgets e eletrônicos do TikTok Shop.",
    followers: "520K",
    views: "200M",
    likes: "18M",
    videos: 450,
    engagement: 9.0,
    verified: true,
    salesVolume: "R$ 1.7M+",
    topProducts: [{
      name: "Drone Mini 4K",
      sales: 4500,
      commission: "R$ 540K"
    }, {
      name: "Fone Gamer RGB",
      sales: 7200,
      commission: "R$ 360K"
    }, {
      name: "Ring Light Profissional",
      sales: 5800,
      commission: "R$ 290K"
    }],
    recentVideos: [{
      title: "Drone Mini 4K por R$189 - ESGOTOU 🚁",
      views: "5.8M",
      likes: "465K",
      date: "nov 2025",
      url: "https://www.tiktok.com/@robert.ribeiro12"
    }, {
      title: "Fone Gamer RGB mais vendido",
      views: "4.5M",
      likes: "360K",
      date: "out 2025",
      url: "https://www.tiktok.com/@robert.ribeiro12"
    }, {
      title: "Ring Light profissional por R$79",
      views: "6.2M",
      likes: "496K",
      date: "out 2025",
      url: "https://www.tiktok.com/@robert.ribeiro12"
    }]
  },
  206: {
    id: 206,
    name: "Diogo Bottino",
    username: "@diogobotti",
    avatar: "DB",
    niche: "Tecnologia",
    bio: "Empreendedor digital e especialista em TikTok Shop. Compartilhando estratégias e produtos tech.",
    followers: "680K",
    views: "280M",
    likes: "22M",
    videos: 520,
    engagement: 8.8,
    verified: true,
    salesVolume: "R$ 1.2M+",
    topProducts: [{
      name: "Webcam Full HD 1080p",
      sales: 3800,
      commission: "R$ 380K"
    }, {
      name: "Hub USB-C 7 em 1",
      sales: 4200,
      commission: "R$ 336K"
    }, {
      name: "Microfone Condensador USB",
      sales: 3500,
      commission: "R$ 280K"
    }],
    recentVideos: [{
      title: "Webcam Full HD R$59 - Setup profissional 💻",
      views: "4.2M",
      likes: "336K",
      date: "nov 2025",
      url: "https://www.tiktok.com/@diogobotti"
    }, {
      title: "Hub USB-C 7 em 1 para seu setup",
      views: "3.5M",
      likes: "280K",
      date: "out 2025",
      url: "https://www.tiktok.com/@diogobotti"
    }, {
      title: "Microfone condensador qualidade estúdio",
      views: "4.8M",
      likes: "384K",
      date: "out 2025",
      url: "https://www.tiktok.com/@diogobotti"
    }]
  },
  207: {
    id: 207,
    name: "Liss Compartilha",
    username: "@lisscompartilha",
    avatar: "LC",
    niche: "Utilidades",
    bio: "Criadora de conteúdo UGC. Compartilhando os melhores achados e utilidades do TikTok Shop.",
    followers: "420K",
    views: "170M",
    likes: "14M",
    videos: 400,
    engagement: 8.6,
    verified: true,
    salesVolume: "R$ 660K+",
    topProducts: [{
      name: "Escova Alisadora 2 em 1",
      sales: 6800,
      commission: "R$ 272K"
    }, {
      name: "Massageador Facial Elétrico",
      sales: 5200,
      commission: "R$ 208K"
    }, {
      name: "Kit Organizador de Gavetas",
      sales: 4500,
      commission: "R$ 135K"
    }],
    recentVideos: [{
      title: "Escova alisadora 2 em 1 mais vendida 💄",
      views: "3.2M",
      likes: "256K",
      date: "nov 2025",
      url: "https://www.tiktok.com/@lisscompartilha"
    }, {
      title: "Massageador facial elétrico viral",
      views: "2.8M",
      likes: "224K",
      date: "out 2025",
      url: "https://www.tiktok.com/@lisscompartilha"
    }, {
      title: "Kit organizador de gavetas R$35",
      views: "3.5M",
      likes: "280K",
      date: "out 2025",
      url: "https://www.tiktok.com/@lisscompartilha"
    }]
  },
  208: {
    id: 208,
    name: "Anielle Rosso",
    username: "@anielle.rosso5",
    avatar: "AR",
    niche: "Variedades",
    bio: "Influenciadora e afiliada. Encontrando os melhores produtos de todas as categorias.",
    followers: "350K",
    views: "140M",
    likes: "11M",
    videos: 350,
    engagement: 8.5,
    verified: true,
    salesVolume: "R$ 600K+",
    topProducts: [{
      name: "Gloss Labial Mel",
      sales: 7500,
      commission: "R$ 225K"
    }, {
      name: "Perfume Contratipo Importado",
      sales: 4800,
      commission: "R$ 192K"
    }, {
      name: "Bolsa Térmica Fashion",
      sales: 4200,
      commission: "R$ 126K"
    }],
    recentVideos: [{
      title: "Gloss de mel que vendeu 7.500 💋",
      views: "2.9M",
      likes: "232K",
      date: "nov 2025",
      url: "https://www.tiktok.com/@anielle.rosso5"
    }, {
      title: "Perfume contratipo importado viral",
      views: "2.4M",
      likes: "192K",
      date: "out 2025",
      url: "https://www.tiktok.com/@anielle.rosso5"
    }, {
      title: "Bolsa térmica fashion que viralizou",
      views: "3.1M",
      likes: "248K",
      date: "out 2025",
      url: "https://www.tiktok.com/@anielle.rosso5"
    }]
  },
  209: {
    id: 209,
    name: "Shigueo Nakahara",
    username: "@shigueo_nakahara",
    avatar: "SN",
    niche: "Educação",
    bio: "Empreendedor e educador. Ensinando a ganhar dinheiro no TikTok Shop e no digital.",
    followers: "290K",
    views: "120M",
    likes: "9M",
    videos: 300,
    engagement: 8.4,
    verified: true,
    salesVolume: "R$ 360K+",
    topProducts: [{
      name: "Melatonina 5mg 120caps",
      sales: 5200,
      commission: "R$ 156K"
    }, {
      name: "Creatina Monohidratada 300g",
      sales: 3800,
      commission: "R$ 114K"
    }, {
      name: "Planner Financeiro 2025",
      sales: 2800,
      commission: "R$ 70K"
    }],
    recentVideos: [{
      title: "Melatonina mais vendida TikTok Shop 💰",
      views: "2.4M",
      likes: "192K",
      date: "nov 2025",
      url: "https://www.tiktok.com/@shigueo_nakahara"
    }, {
      title: "Creatina que está bombando nas vendas",
      views: "2.1M",
      likes: "168K",
      date: "out 2025",
      url: "https://www.tiktok.com/@shigueo_nakahara"
    }, {
      title: "Planner Financeiro 2025 - Organize-se",
      views: "2.8M",
      likes: "224K",
      date: "out 2025",
      url: "https://www.tiktok.com/@shigueo_nakahara"
    }]
  },
  215: {
    id: 215,
    name: "Karol Finkler",
    username: "@karolfinkler",
    avatar: "KF",
    niche: "Utilidades",
    bio: "Criadora de conteúdo. Compartilhando dicas e os melhores achados do TikTok Shop.",
    followers: "220K",
    views: "85M",
    likes: "6M",
    videos: 240,
    engagement: 8.3,
    verified: true,
    salesVolume: "R$ 180K+",
    topProducts: [{
      name: "Depilador Indolor LED",
      sales: 2800,
      commission: "R$ 70K"
    }, {
      name: "Escova Secadora 3 em 1",
      sales: 2200,
      commission: "R$ 55K"
    }, {
      name: "Kit Skincare Vitamina C",
      sales: 1800,
      commission: "R$ 45K"
    }],
    recentVideos: [{
      title: "Depilador LED indolor mais vendido ✨",
      views: "1.2M",
      likes: "96K",
      date: "nov 2025",
      url: "https://www.tiktok.com/@karolfinkler"
    }, {
      title: "Escova secadora 3 em 1 viral",
      views: "1.0M",
      likes: "80K",
      date: "out 2025",
      url: "https://www.tiktok.com/@karolfinkler"
    }, {
      title: "Kit Skincare Vitamina C R$49",
      views: "1.4M",
      likes: "112K",
      date: "out 2025",
      url: "https://www.tiktok.com/@karolfinkler"
    }]
  }
};
const CreatorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const creatorId = parseInt(id || "1");
  const creator = creatorsData[creatorId] || creatorsData[1];

  const normalizeTikTokUsername = (username: string) => username.replace(/^@/, "");

  const getVideoHref = (video: any) => {
    const profileUrl = `https://www.tiktok.com/@${normalizeTikTokUsername(creator.username)}`.replace(/\/+$/, "");
    const fallbackProfileUrl = `https://www.tiktok.com/${creator.username}`.replace(/\/+$/, "");

    const rawUrl = (video?.url as string | undefined) || "";
    const url = rawUrl.replace(/\/+$/, "");

    const isDirectVideoUrl = url.includes("/video/") || url.includes("vt.tiktok.com/");
    const isProfileUrl = !url || (!isDirectVideoUrl && (url === profileUrl || url === fallbackProfileUrl || url.startsWith(profileUrl)));

    if (isProfileUrl) {
      const query = encodeURIComponent(`${creator.username} ${video.title}`);
      return `https://www.tiktok.com/search?q=${query}`;
    }

    return url;
  };

  return <div className="min-h-screen bg-background">
      
      <main className="p-6 lg:p-8 max-w-[1200px] mx-auto">
        {/* Back Button */}
        <button onClick={() => navigate("/spy")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Espionar</span>
        </button>

        {/* Profile Header */}
        <div className="glass-card p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="relative">
              {avatarImages[creator.id] ? (
                <img 
                  src={avatarImages[creator.id]} 
                  alt={creator.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-tiktok-cyan to-tiktok-pink flex items-center justify-center text-3xl font-bold text-background">
                  {creator.avatar}
                </div>
              )}
              {creator.verified && <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-tiktok-cyan flex items-center justify-center">
                  <svg className="w-4 h-4 text-background" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{creator.name}</h1>
                <span className="px-3 py-1 rounded-full bg-muted text-sm font-medium">{creator.niche}</span>
              </div>
              <p className="text-muted-foreground mb-2">{creator.username}</p>
              <p className="text-sm text-muted-foreground mb-4 max-w-xl">{creator.bio}</p>

              {/* Stats */}
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-tiktok-cyan" />
                  <div>
                    <p className="font-bold">{creator.followers}</p>
                    <p className="text-xs text-muted-foreground">seguidores</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-tiktok-pink" />
                  <div>
                    <p className="font-bold">{creator.likes}</p>
                    <p className="text-xs text-muted-foreground">curtidas</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <div className="text-right mb-2">
                <p className="text-2xl font-bold text-tiktok-green">{creator.salesVolume}</p>
                <p className="text-sm text-muted-foreground">volume total de vendas</p>
              </div>
              <a href={`https://www.tiktok.com/${creator.username}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-tiktok-cyan to-tiktok-pink text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
                <ExternalLink className="w-4 h-4" />
                Ver no TikTok
              </a>
              <button className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-muted text-foreground font-medium text-sm hover:bg-muted/80 transition-colors">
                <Share2 className="w-4 h-4" />
                Compartilhar
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="w-5 h-5 text-tiktok-cyan" />
              <h2 className="text-lg font-semibold">Produtos que Mais Vende</h2>
            </div>
            
            <div className="space-y-3">
              {creator.topProducts.map((product: any, index: number) => <div key={index} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  {productImages[creator.id]?.[index] ? (
                    <img 
                      src={productImages[creator.id][index]} 
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-tiktok-cyan/20 to-tiktok-pink/20 flex items-center justify-center">
                      <span className="text-sm font-bold">#{index + 1}</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.sales.toLocaleString()} vendas</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-tiktok-green">{product.commission}</p>
                    <p className="text-xs text-muted-foreground">comissão</p>
                  </div>
                </div>)}
            </div>
          </div>

          {/* Recent Videos */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Play className="w-5 h-5 text-tiktok-pink" />
              <h2 className="text-lg font-semibold">Vídeos que mais venderam</h2>
            </div>
            
            <div className="space-y-3">
              {creator.recentVideos.map((video: any, index: number) => (
                <a 
                  key={index} 
                  href={getVideoHref(video)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group"
                >
                  {videoImages[creator.id]?.[index] ? (
                    <div className="w-16 h-16 rounded-xl overflow-hidden relative group-hover:ring-2 ring-tiktok-pink/50 transition-all">
                      <img 
                        src={videoImages[creator.id][index]} 
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Play className="w-6 h-6 text-white" fill="white" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center group-hover:bg-tiktok-pink/20 transition-colors">
                      <Play className="w-6 h-6 text-muted-foreground group-hover:text-tiktok-pink" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{video.title}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {video.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" /> {video.likes}
                      </span>
                    </div>
                  </div>
                  
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>;
};
export default CreatorProfile;