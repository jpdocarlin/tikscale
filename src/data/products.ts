// Produtos reais do sistema para notificações e tendências
// Usando produtos que existem na ferramenta (videoProducts.ts)

export interface NotificationProduct {
  id: number;
  name: string;
  category: string;
  price: number;
  commission: number;
  badge?: { text: string; type: "hot" | "scaling" | "trending" };
  affiliateLink: string;
}

// Produtos em alta (com badge "hot") - produtos reais da ferramenta
export const hotProducts: NotificationProduct[] = [
  { id: 1, name: "Luz Pisca Pisca Natal", category: "Casa", price: 12.40, commission: 1.86, badge: { text: "Hot", type: "hot" }, affiliateLink: "https://vt.tiktok.com/ZSHKde8F5HQdP-BWCqV/" },
  { id: 95, name: "9D Dentes Branco 14 Tiras", category: "Beleza", price: 31.99, commission: 4.80, badge: { text: "Hot", type: "hot" }, affiliateLink: "https://vt.tiktok.com/ZSHKde8F5HQdP-BWCqV/" },
  { id: 16, name: "Short Cinta Modeladora", category: "Moda", price: 24.99, commission: 3.75, badge: { text: "Hot", type: "hot" }, affiliateLink: "https://vt.tiktok.com/ZSHKde8F5HQdP-BWCqV/" },
  { id: 50, name: "Mounjax", category: "Suplementos", price: 142.00, commission: 21.30, badge: { text: "Hot", type: "hot" }, affiliateLink: "https://vt.tiktok.com/ZSHKde8F5HQdP-BWCqV/" },
  { id: 99, name: "Fórmula X - Cabelo e Barba", category: "Suplementos", price: 77.60, commission: 11.64, badge: { text: "Hot", type: "hot" }, affiliateLink: "https://vt.tiktok.com/ZSHKde8F5HQdP-BWCqV/" },
  { id: 106, name: "Massageador de Pescoço", category: "Acessórios", price: 25.50, commission: 3.83, badge: { text: "Hot", type: "hot" }, affiliateLink: "https://vt.tiktok.com/ZSHKde8F5HQdP-BWCqV/" },
  { id: 81, name: "Escova Secadora", category: "Beleza", price: 26.69, commission: 4.00, badge: { text: "Hot", type: "hot" }, affiliateLink: "https://vt.tiktok.com/ZSHKde8F5HQdP-BWCqV/" },
  { id: 74, name: "Projetor 4K", category: "Eletrônicos", price: 159.99, commission: 24.00, badge: { text: "Hot", type: "hot" }, affiliateLink: "https://vt.tiktok.com/ZSHKde8F5HQdP-BWCqV/" },
];

// Produtos escalando (com badge "scaling")
export const scalingProducts: NotificationProduct[] = [
  { id: 120, name: "Irrigador Oral Water Flosser Recarregável", category: "Beleza", price: 71.91, commission: 10.79, badge: { text: "Escalando", type: "scaling" }, affiliateLink: "https://vt.tiktok.com/ZS9LRhYXdrw29-5ihYs/" },
  { id: 119, name: "Escova de Dentes Elétrica Branqueador IPX7", category: "Beleza", price: 30.99, commission: 4.65, badge: { text: "Escalando", type: "scaling" }, affiliateLink: "https://vt.tiktok.com/ZS9LRhdMTYMDf-OquEM/" },
  { id: 71, name: "Relogio Smartwatch", category: "Eletrônicos", price: 54.49, commission: 8.17, badge: { text: "Escalando", type: "scaling" }, affiliateLink: "https://vt.tiktok.com/ZSHKde8F5HQdP-BWCqV/" },
  { id: 58, name: "Whey Protein Isolado 900g", category: "Suplementos", price: 110.93, commission: 16.64, badge: { text: "Escalando", type: "scaling" }, affiliateLink: "https://vt.tiktok.com/ZSHKde8F5HQdP-BWCqV/" },
  { id: 6, name: "Kit 2 Calças Leggings", category: "Moda", price: 33.10, commission: 4.97, badge: { text: "Escalando", type: "scaling" }, affiliateLink: "https://vt.tiktok.com/ZSHKde8F5HQdP-BWCqV/" },
  { id: 83, name: "Serum Clareador", category: "Beleza", price: 74.90, commission: 11.24, badge: { text: "Escalando", type: "scaling" }, affiliateLink: "https://vt.tiktok.com/ZSHKde8F5HQdP-BWCqV/" },
  { id: 69, name: "Console Portátil", category: "Eletrônicos", price: 140.09, commission: 21.01, badge: { text: "Escalando", type: "scaling" }, affiliateLink: "https://vt.tiktok.com/ZSHKde8F5HQdP-BWCqV/" },
];

// Produtos em tendência (com badge "trending")
export const trendingProducts: NotificationProduct[] = [
  { id: 118, name: "Rolo Massageador Facial Com Gelo", category: "Beleza", price: 21.27, commission: 3.19, badge: { text: "Tendência", type: "trending" }, affiliateLink: "https://vt.tiktok.com/ZS9LRrKWECBGF-vz47r/" },
  { id: 100, name: "Luminária Projetor Astronauta Galaxy", category: "Casa", price: 37.06, commission: 5.56, badge: { text: "Tendência", type: "trending" }, affiliateLink: "https://vt.tiktok.com/ZSHKde8F5HQdP-BWCqV/" },
  { id: 103, name: "Luminária Lua 3D LED Abajur", category: "Casa", price: 35.99, commission: 5.40, badge: { text: "Tendência", type: "trending" }, affiliateLink: "https://vt.tiktok.com/ZSHKde8F5HQdP-BWCqV/" },
  { id: 101, name: "Creatina Gummy + Vinagre Maçã Gummy", category: "Suplementos", price: 104.30, commission: 15.65, badge: { text: "Tendência", type: "trending" }, affiliateLink: "https://vt.tiktok.com/ZSHKde8F5HQdP-BWCqV/" },
  { id: 104, name: "Organizador de Cosméticos", category: "Acessórios", price: 27.53, commission: 4.13, badge: { text: "Tendência", type: "trending" }, affiliateLink: "https://vt.tiktok.com/ZSHKde8F5HQdP-BWCqV/" },
  { id: 113, name: "Óculos Realidade Virtual", category: "Acessórios", price: 35.99, commission: 5.40, badge: { text: "Tendência", type: "trending" }, affiliateLink: "https://vt.tiktok.com/ZSHKde8F5HQdP-BWCqV/" },
  { id: 121, name: "Vestido Feminino Longo Com Decote", category: "Moda", price: 34.99, commission: 3.67, badge: { text: "Tendência", type: "trending" }, affiliateLink: "https://vt.tiktok.com/ZS9L82tRLs5nF-nSXna/" },
  { id: 122, name: "Cropped Coração Multiformas", category: "Moda", price: 32.21, commission: 3.38, badge: { text: "Hot", type: "hot" }, affiliateLink: "" },
  { id: 123, name: "Vestido Tubinho Babado Lateral Suplex", category: "Moda", price: 124.90, commission: 13.64, badge: { text: "Tendência", type: "trending" }, affiliateLink: "https://vt.tiktok.com/ZS9L8AKdwUgFc-zb4WK/" },
  { id: 124, name: "Camisola Bailarina Decote Nas Costas", category: "Moda", price: 31.99, commission: 3.20, badge: { text: "Hot", type: "hot" }, affiliateLink: "https://vt.tiktok.com/ZS9L8DJcTm1yC-hoX0z/" },
  { id: 125, name: "Macaquinho Feminino Fitness Alcinha", category: "Moda", price: 33.56, commission: 3.36, badge: { text: "Escalando", type: "scaling" }, affiliateLink: "https://vt.tiktok.com/ZS9L8Dja2P9Yv-YYAHh/" },
];

// Produtos com alta comissão (>10%)
export const highCommissionProducts: NotificationProduct[] = [
  { id: 74, name: "Projetor 4K", category: "Eletrônicos", price: 159.99, commission: 24.00, affiliateLink: "https://vt.tiktok.com/ZSHKde8F5HQdP-BWCqV/" },
  { id: 50, name: "Mounjax", category: "Suplementos", price: 142.00, commission: 21.30, affiliateLink: "https://vt.tiktok.com/ZSHKde8F5HQdP-BWCqV/" },
  { id: 69, name: "Console Portátil", category: "Eletrônicos", price: 140.09, commission: 21.01, affiliateLink: "https://vt.tiktok.com/ZSHKde8F5HQdP-BWCqV/" },
  { id: 58, name: "Whey Protein Isolado 900g", category: "Suplementos", price: 110.93, commission: 16.64, affiliateLink: "https://vt.tiktok.com/ZSHKde8F5HQdP-BWCqV/" },
  { id: 101, name: "Creatina Gummy + Vinagre Maçã Gummy", category: "Suplementos", price: 104.30, commission: 15.65, affiliateLink: "https://vt.tiktok.com/ZSHKde8F5HQdP-BWCqV/" },
  { id: 99, name: "Fórmula X - Cabelo e Barba", category: "Suplementos", price: 77.60, commission: 11.64, affiliateLink: "https://vt.tiktok.com/ZSHKde8F5HQdP-BWCqV/" },
  { id: 83, name: "Serum Clareador", category: "Beleza", price: 74.90, commission: 11.24, affiliateLink: "https://vt.tiktok.com/ZSHKde8F5HQdP-BWCqV/" },
];

// Todos os produtos para vendas simuladas
export const allSaleProducts: NotificationProduct[] = [
  ...hotProducts,
  ...scalingProducts,
  ...trendingProducts,
];

// Track recently shown products to avoid repetition
const recentlyShownProducts: Map<string, number[]> = new Map();
const MAX_RECENT_PRODUCTS = 5;

// Helper para pegar produto aleatório de uma lista, evitando repetições
export const getRandomProduct = (products: NotificationProduct[]): NotificationProduct => {
  const listKey = JSON.stringify(products.map(p => p.id).sort());
  const recentIds = recentlyShownProducts.get(listKey) || [];
  
  // Filter out recently shown products
  let availableProducts = products.filter(p => !recentIds.includes(p.id));
  
  // If all products were recently shown, reset and use all
  if (availableProducts.length === 0) {
    availableProducts = products;
    recentlyShownProducts.set(listKey, []);
  }
  
  // Pick a random product from available ones
  const randomIndex = Math.floor(Math.random() * availableProducts.length);
  const selectedProduct = availableProducts[randomIndex];
  
  // Update recently shown list
  const updatedRecent = [...recentIds, selectedProduct.id].slice(-MAX_RECENT_PRODUCTS);
  recentlyShownProducts.set(listKey, updatedRecent);
  
  return selectedProduct;
};
