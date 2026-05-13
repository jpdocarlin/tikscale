import { useState, useMemo } from "react";
import { Search, Filter, Star, Flame, Rocket, BarChart3, ArrowUpDown, Users } from "lucide-react";
import { AffiliateCardSkeleton } from "@/components/ProductCardSkeleton";
import { cn } from "@/lib/utils";

// Product Images
// Livros
// Suplementos
// Eletrônicos
// Beleza
// Novos Mais Vendidos
// Acessórios
// Novos produtos

// TikTok Icon Component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

interface AffiliateProduct {
  id: number;
  name: string;
  category: string;
  price: string;
  commission: number;
  sales: number;
  rating: number;
  image?: string;
  affiliateLink: string;
  badge?: { text: string; type: "hot" | "scaling" | "trending" };
}

const affiliateProducts: AffiliateProduct[] = [
  // Mais Vendidos - Novos
  { id: 95, name: "9D Dentes Branco 14 Tiras", category: "Beleza", price: "R$ 14,49", commission: 2.02, sales: 3200, rating: 4.9, badge: { text: "Hot", type: "hot" }, image: "/products/9d-dentes-brancos.webp", affiliateLink: "https://vt.tiktok.com/ZS983NgQ9ATmV-RjdXe/" },
  { id: 96, name: "Relógio Digital Espelhado LED Mesa", category: "Eletrônicos", price: "R$ 26,67", commission: 2.85, sales: 3150, rating: 4.8, badge: { text: "Hot", type: "hot" }, image: "/products/relogio-digital.webp", affiliateLink: "https://vt.tiktok.com/ZS983YF8TTKeo-EGb0K/" },
  { id: 97, name: "ENSSU Aparador Corporal Masculino USB", category: "Beleza", price: "R$ 117,47", commission: 13.20, sales: 3100, rating: 4.7, badge: { text: "Escalando", type: "scaling" }, image: "/products/enssu-aparador.webp", affiliateLink: "https://vt.tiktok.com/ZS983YF8TTKeo-EGb0K/" },
  { id: 98, name: "Espelho Maquiagem Inteligente LED", category: "Beleza", price: "R$ 28,00", commission: 2.66, sales: 3050, rating: 4.8, badge: { text: "Tendência", type: "trending" }, image: "/products/espelho-maquiagem-led.webp", affiliateLink: "https://vt.tiktok.com/ZS983YSVV4p3H-O5upK/" },
  { id: 99, name: "Fórmula X - Cabelo e Barba", category: "Suplementos", price: "R$ 90,35", commission: 13.82, sales: 3000, rating: 4.9, badge: { text: "Hot", type: "hot" }, image: "/products/formula-x-barba.webp", affiliateLink: "https://vt.tiktok.com/ZS983Y5cSbJ8a-nOWk5/" },
  { id: 100, name: "Luminária Projetor Astronauta Galaxy", category: "Casa", price: "R$ 36,89", commission: 2.28, sales: 2950, rating: 4.8, badge: { text: "Escalando", type: "scaling" }, image: "/products/luminaria-astronauta.webp", affiliateLink: "https://vt.tiktok.com/ZS983Y4LyvCVL-fvh9f/" },
  { id: 101, name: "Creatina Gummy + Vinagre Maçã Gummy", category: "Suplementos", price: "R$ 209,80", commission: 25.18, sales: 2900, rating: 4.7, badge: { text: "Tendência", type: "trending" }, image: "/products/creatina-gummy.webp", affiliateLink: "https://vt.tiktok.com/ZS983Yg851mQq-t55R0/" },
  { id: 102, name: "Reload 300gr Suplemento em Pó", category: "Suplementos", price: "R$ 150,14", commission: 16.70, sales: 2880, rating: 4.8, badge: { text: "Escalando", type: "scaling" }, image: "/products/reload-suplemento.webp", affiliateLink: "https://vt.tiktok.com/ZS983YW2TsMh8-DQ6A1/" },
  { id: 103, name: "Luminária Lua 3D LED Abajur", category: "Casa", price: "R$ 17,50", commission: 1.40, sales: 2860, rating: 4.9, badge: { text: "Hot", type: "hot" }, image: "/products/luminaria-lua-3d.webp", affiliateLink: "https://vt.tiktok.com/ZS983YwKP4FHk-6FygQ/" },
  // Produtos originais
  { id: 1, name: "Luz Pisca Pisca Natal", category: "Casa", price: "R$ 13,40", commission: 1.34, sales: 2847, rating: 4.8, badge: { text: "Hot", type: "hot" }, image: "/products/luz-pisca-pisca.webp", affiliateLink: "https://vt.tiktok.com/ZS9832d5xKamK-z6wQp/" },
  { id: 2, name: "Pro3 Magnésio", category: "Suplementos", price: "R$ 37,17", commission: 2.84, sales: 2654, rating: 4.9, badge: { text: "Hot", type: "hot" }, image: "/products/pro3-magnesio.webp", affiliateLink: "https://vt.tiktok.com/ZS98328LBCBGS-czdL6/" },
  { id: 3, name: "Bolsa Reforçada Notebook Impermeável", category: "Acessórios", price: "R$ 44,80", commission: 4.70, sales: 2341, rating: 4.7, badge: { text: "Escalando", type: "scaling" }, image: "/products/bolsa-notebook.webp", affiliateLink: "https://vt.tiktok.com/ZS9832j1xUamR-Fs9Rv/" },
  { id: 4, name: "TWS Fone Bluetooth", category: "Eletrônicos", price: "R$ 14,50", commission: 1.23, sales: 2198, rating: 4.6, badge: { text: "Hot", type: "hot" }, image: "/products/tws-fone.webp", affiliateLink: "https://vt.tiktok.com/ZS9832kU7DNpu-vChf0/" },
  { id: 5, name: "Kit Pro3 Magnésio", category: "Suplementos", price: "R$ 46,49", commission: 3.56, sales: 1987, rating: 4.9, badge: { text: "Escalando", type: "scaling" }, image: "/products/pro3-magnesio.webp", affiliateLink: "https://vt.tiktok.com/ZS9832mPFX2ov-zlamF/" },
  { id: 6, name: "Kit 2 Calças Leggings", category: "Moda", price: "R$ 75,21", commission: 8.52, sales: 1876, rating: 4.7, badge: { text: "Tendência", type: "trending" }, image: "/products/kit-leggings.webp", affiliateLink: "https://vt.tiktok.com/ZS9832gV8wxeS-NMyGt/" },
  { id: 7, name: "FitS36 Suplemento", category: "Suplementos", price: "R$ 46,49", commission: 3.56, sales: 1754, rating: 4.8, badge: { text: "Escalando", type: "scaling" }, image: "/products/fits36.webp", affiliateLink: "https://vt.tiktok.com/ZS9832TYax54G-M0Zmn/" },
  { id: 8, name: "Necessaire Organizador", category: "Acessórios", price: "R$ 16,00", commission: 1.32, sales: 1643, rating: 4.5, image: "/products/necessaire.webp", affiliateLink: "https://vt.tiktok.com/ZS983jAgNjRsa-T81Ne/" },
  { id: 9, name: "Kit Lençol 400 Fios 3 Peças", category: "Casa", price: "R$ 18,49", commission: 1.90, sales: 1521, rating: 4.8, badge: { text: "Tendência", type: "trending" }, image: "/products/kit-lencol.webp", affiliateLink: "https://vt.tiktok.com/ZS983jXytKHgk-CJEd3/" },
  { id: 10, name: "Repelente Eletrônico", category: "Casa", price: "R$ 12,99", commission: 0.97, sales: 1432, rating: 4.4, image: "/products/repelente.webp", affiliateLink: "https://vt.tiktok.com/ZS983jWGfeyyY-5TCwB/" },
  { id: 11, name: "Magnésio E Inositol", category: "Suplementos", price: "R$ 60,53", commission: 4.99, sales: 1398, rating: 4.9, image: "/products/pro3-magnesio.webp", affiliateLink: "https://vt.tiktok.com/ZS9836duE5aQ8-tFC6n/" },
  { id: 12, name: "365 Amor com Deus", category: "Livros", price: "R$ 24,19", commission: 2.42, sales: 1287, rating: 4.9, badge: { text: "Tendência", type: "trending" }, image: "/products/365-amor-deus.webp", affiliateLink: "https://vt.tiktok.com/ZS9836hYJXyNo-HgL4k/" },
  { id: 13, name: "Relógio de Pulso Digital", category: "Eletrônicos", price: "R$ 26,67", commission: 2.85, sales: 1176, rating: 4.5, image: "/products/relogio-digital.webp", affiliateLink: "https://vt.tiktok.com/ZS9836Hfr9JcA-2KmxT/" },
  { id: 14, name: "Perfume Attracione Men", category: "Beleza", price: "R$ 67,65", commission: 5.52, sales: 1098, rating: 4.7, badge: { text: "Escalando", type: "scaling" }, image: "/products/perfume-attracione.webp", affiliateLink: "https://vt.tiktok.com/ZS983hMTY1vt5-NS2i9/" },
  { id: 15, name: "Kit 2 Top Sutiã", category: "Moda", price: "R$ 33,07", commission: 4.15, sales: 987, rating: 4.6, image: "/products/kit-top-sutia.webp", affiliateLink: "https://vt.tiktok.com/ZS983hXRHepBH-C8XJh/" },
  { id: 16, name: "Short Cinta Modeladora", category: "Moda", price: "R$ 28,99", commission: 2.90, sales: 876, rating: 4.7, badge: { text: "Hot", type: "hot" }, image: "/products/short-cinta.webp", affiliateLink: "https://vt.tiktok.com/ZS983hpYttf7q-gYdYR/" },
  { id: 17, name: "Escova de Dente Elétrica", category: "Beleza", price: "R$ 17,54", commission: 1.80, sales: 765, rating: 4.6, image: "/products/escova-eletrica.webp", affiliateLink: "https://vt.tiktok.com/ZS983kYv2Qt6t-GWNRI/" },
  { id: 18, name: "Bermudas 3 Dry Fit De Alto Padrão", category: "Moda", price: "R$ 41,50", commission: 4.66, sales: 654, rating: 4.5, image: "/products/bermudas-dryfit.webp", affiliateLink: "https://vt.tiktok.com/ZS983kGC88DpC-KLMIs/" },
  { id: 19, name: "Boné Aba Curva Premium", category: "Moda", price: "R$ 47,40", commission: 4.98, sales: 543, rating: 4.6, image: "/products/bone-aba-curva.webp", affiliateLink: "https://vt.tiktok.com/ZS983Bj49AwJ9-rTXa2/" },
  { id: 20, name: "Cinta Modeladora De Alta Compressão", category: "Moda", price: "R$ 41,91", commission: 4.49, sales: 520, rating: 4.7, image: "/products/cinta-modeladora.webp", affiliateLink: "https://vt.tiktok.com/ZS983BUBoqcRG-HehrZ/" },
  { id: 21, name: "Kit 3 Calças Sarjas Masculina", category: "Moda", price: "R$ 39,99", commission: 4.20, sales: 498, rating: 4.5, image: "/products/kit-calcas-sarja.webp", affiliateLink: "https://vt.tiktok.com/ZS983Du37hfd1-rs7yd/" },
  { id: 22, name: "Camisa Polimiada Masculina", category: "Moda", price: "R$ 47,99", commission: 2.40, sales: 476, rating: 4.4, image: "/products/camisa-polimiada.webp", affiliateLink: "https://vt.tiktok.com/ZS983DorjVeFY-T5z8L/" },
  { id: 23, name: "Camisa Polo Dryfit", category: "Moda", price: "R$ 44,99", commission: 4.72, sales: 454, rating: 4.6, image: "/products/camisa-polo-dryfit.webp", affiliateLink: "https://vt.tiktok.com/ZS983UhrUHrEM-Lbpu8/" },
  { id: 24, name: "Kit 3 Bermudas (Linho) Masculina", category: "Moda", price: "R$ 34,99", commission: 1.75, sales: 432, rating: 4.5, image: "/products/kit-bermudas-linho.webp", affiliateLink: "https://vt.tiktok.com/ZS983UsHSASMt-qIJVq/" },
  { id: 25, name: "Jaqueta Corta Vento Impermeável", category: "Moda", price: "R$ 53,88", commission: 6.10, sales: 410, rating: 4.7, image: "/products/jaqueta-corta-vento.webp", affiliateLink: "https://vt.tiktok.com/ZS983yPbCEF6T-7GS8n/" },
  { id: 26, name: "Kit 3 Calças Jeans Feminina", category: "Moda", price: "R$ 38,83", commission: 4.20, sales: 388, rating: 4.6, image: "/products/kit-calcas-jeans.webp", affiliateLink: "https://vt.tiktok.com/ZS983yGVrb98Y-70R9Z/" },
  { id: 27, name: "Camisa Social Gola Padre Masculina", category: "Moda", price: "R$ 35,99", commission: 3.60, sales: 366, rating: 4.5, image: "/products/camisa-gola-padre.webp", affiliateLink: "https://vt.tiktok.com/ZS983fYXQKTHH-DuuMt/" },
  { id: 28, name: "Camiseta Masculina Canelada Gola Alta", category: "Moda", price: "R$ 29,40", commission: 2.94, sales: 344, rating: 4.4, image: "/products/camiseta-gola-alta.webp", affiliateLink: "https://vt.tiktok.com/ZS983fVBv1fUY-235og/" },
  { id: 29, name: "Moletom Casaco Masculino", category: "Moda", price: "R$ 59,90", commission: 6.29, sales: 322, rating: 4.6, image: "/products/moletom-casaco.webp", affiliateLink: "https://vt.tiktok.com/ZS983Py7MVsmU-lpgsN/" },
  // Casa e Acessórios
  { id: 30, name: "Puff Redondo Luxo", category: "Casa", price: "R$ 51,14", commission: 1.04, sales: 312, rating: 4.7, image: "/products/puff-redondo.webp", affiliateLink: "https://vt.tiktok.com/ZS983mjFqjyds-NCYLY/" },
  { id: 31, name: "Capa Colchão Impermeável Com Elastico", category: "Casa", price: "R$ 25,44", commission: 10, sales: 298, rating: 4.6, image: "/products/capa-colchao.webp", affiliateLink: "https://vt.tiktok.com/ZS9LRLwnMdxWg-ZzxIg/" },
  { id: 32, name: "Copo Térmico Inteligente", category: "Acessórios", price: "R$ 24,89", commission: 8, sales: 287, rating: 4.5, image: "/products/copo-termico.webp", affiliateLink: "https://vt.tiktok.com/ZS9LRNdtvBhDS-hOSq9/" },
  { id: 33, name: "Guarda Chuva Automatico", category: "Acessórios", price: "R$ 26,39", commission: 10, sales: 276, rating: 4.4, image: "/products/guarda-chuva.webp", affiliateLink: "https://vt.tiktok.com/ZS9LRNh8oT8Af-eqAtP/" },
  { id: 35, name: "Jogo De Panelas Antiaderente 9 Peças", category: "Casa", price: "R$ 115,46", commission: 10, sales: 254, rating: 4.8, image: "/products/jogo-panelas.webp", affiliateLink: "https://vt.tiktok.com/ZS9LRNQ9mkBLw-rJLEj/" },
  { id: 36, name: "Cortina Blackout", category: "Casa", price: "R$ 49,99", commission: 9.5, sales: 243, rating: 4.5, image: "/products/cortina-blackout.webp", affiliateLink: "https://vt.tiktok.com/ZS9LRN4HxnCAc-ODg2t/" },
  { id: 37, name: "Extensão 5 Tomadas Elétricas", category: "Casa", price: "R$ 24,79", commission: 10, sales: 232, rating: 4.3, image: "/products/extensao-tomadas.webp", affiliateLink: "https://vt.tiktok.com/ZS9LRF8WTHegD-FPh9R/" },
  { id: 38, name: "Tapete Jogo De Banheiro 3 Peças", category: "Casa", price: "R$ 29,52", commission: 12.5, sales: 221, rating: 4.4, image: "/products/tapete-banheiro.webp", affiliateLink: "https://vt.tiktok.com/ZS9LRFjtm7ffv-npDRk/" },
  { id: 39, name: "Kit 5 Lençol Queen", category: "Casa", price: "R$ 47,99", commission: 10, sales: 210, rating: 4.7, image: "/products/kit-lencol.webp", affiliateLink: "https://vt.tiktok.com/ZS9LR6K5GKAP6-YhDJh/" },
  // Livros
  { id: 40, name: "Combo Estratégia Kit 3 Livros", category: "Livros", price: "R$ 29,64", commission: 17, sales: 198, rating: 4.8, image: "/products/combo-estrategia-livros.webp", affiliateLink: "https://vt.tiktok.com/ZS9LRM1reMYVs-N5O5H/" },
  { id: 41, name: "Livro A Metamorfose", category: "Livros", price: "R$ 19,90", commission: 15, sales: 187, rating: 4.7, image: "/products/livro-metamorfose.webp", affiliateLink: "https://vt.tiktok.com/ZS9LRM2nRXtu7-mD4iX/" },
  { id: 42, name: "Oi Deus, Sou eu De Novo", category: "Livros", price: "R$ 62,91", commission: 5, sales: 176, rating: 4.9, image: "/products/oi-deus-sou-eu.webp", affiliateLink: "https://vt.tiktok.com/ZS9LRMr9N4Qx6-uaCRv/" },
  { id: 43, name: "3D Adesivos De Microcenas", category: "Livros", price: "R$ 13,82", commission: 14, sales: 165, rating: 4.5, image: "/products/adesivos-3d-microcenas.webp", affiliateLink: "https://vt.tiktok.com/ZS9LRMfwfkEbx-oykwD/" },
  { id: 44, name: "A Arte Da Guerra", category: "Livros", price: "R$ 19,40", commission: 10, sales: 154, rating: 4.8, image: "/products/arte-da-guerra.webp", affiliateLink: "https://vt.tiktok.com/ZS9LRMVA66PyT-Kp6MV/" },
  { id: 45, name: "Livro Interativo Com Som", category: "Livros", price: "R$ 63,20", commission: 7.90, sales: 143, rating: 4.6, image: "/products/livro-interativo-som.webp", affiliateLink: "https://vt.tiktok.com/ZS9LRMvAU6SVb-UA9PP/" },
  { id: 46, name: "A Psicologia Financeira", category: "Livros", price: "R$ 35,77", commission: 4.97, sales: 132, rating: 4.9, image: "/products/psicologia-financeira.webp", affiliateLink: "https://vt.tiktok.com/ZS9LRMELocyvE-haBQA/" },
  { id: 47, name: "Mais Esperto Que o Diabo", category: "Livros", price: "R$ 35,73", commission: 2.53, sales: 121, rating: 4.7, image: "/products/mais-esperto-que-diabo.webp", affiliateLink: "https://vt.tiktok.com/ZS9LRMEHJc65J-gIZ6C/" },
  { id: 48, name: "Caderno Planner De Controle Financeiro", category: "Livros", price: "R$ 44,91", commission: 4.99, sales: 110, rating: 4.5, image: "/products/caderno-planner-financeiro.webp", affiliateLink: "https://vt.tiktok.com/ZS9LRrF1yNqFo-Wr6gB/" },
  { id: 49, name: "Poesias que Escrevi enquanto aprendia viver", category: "Livros", price: "R$ 47,92", commission: 3.00, sales: 99, rating: 4.8, image: "/products/poesias-aprendia-viver.webp", affiliateLink: "https://vt.tiktok.com/ZS9LRrvp4GeYC-vBm0V/" },
  // Suplementos
  { id: 50, name: "Mounjax", category: "Suplementos", price: "R$ 169,90", commission: 25.48, sales: 890, rating: 4.8, image: "/products/mounjax.webp", affiliateLink: "https://vt.tiktok.com/ZS983hXR4hfgj-f5pQF/" },
  { id: 51, name: "Moringa + Maca Negra", category: "Suplementos", price: "R$ 31,28", commission: 3.99, sales: 856, rating: 4.7, image: "/products/moringa-maca-negra.webp", affiliateLink: "https://vt.tiktok.com/ZS983hWCMv8D9-MXbVq/" },
  { id: 52, name: "Dimpless + Morosil", category: "Suplementos", price: "R$ 49,90", commission: 5.24, sales: 823, rating: 4.9, image: "/products/dimpless-morosil.webp", affiliateLink: "https://vt.tiktok.com/ZS983k1m8mj4g-7OfiK/" },
  { id: 53, name: "Testo", category: "Suplementos", price: "R$ 52,75", commission: 7.67, sales: 789, rating: 4.6, image: "/products/testo.webp", affiliateLink: "https://vt.tiktok.com/ZS983k87Xxaj8-jCWKk/" },
  { id: 54, name: "Suplemento Alimentar", category: "Suplementos", price: "R$ 39,13", commission: 2.99, sales: 756, rating: 4.5, image: "/products/suplemento-alimentar.webp", affiliateLink: "https://vt.tiktok.com/ZS983kBgpHY1p-oAhey/" },
  { id: 55, name: "Kit 2 Colageno Hidrolisado", category: "Suplementos", price: "R$ 37,17", commission: 3.03, sales: 723, rating: 4.8, image: "/products/colageno-hidrolisado.webp", affiliateLink: "https://vt.tiktok.com/ZS983kULvbbqC-s1zSq/" },
  { id: 56, name: "Capsulas de Arginina", category: "Suplementos", price: "R$ 40,00", commission: 8.00, sales: 690, rating: 4.6, image: "/products/capsulas-arginina.webp", affiliateLink: "https://vt.tiktok.com/ZS983kHmSuRyX-0xVxe/" },
  { id: 57, name: "Kit 500g Creatina + 500g Taurina", category: "Suplementos", price: "R$ 84,90", commission: 6.79, sales: 657, rating: 4.9, image: "/products/creatina-taurina.webp", affiliateLink: "https://vt.tiktok.com/ZS983kVbNoeJ2-ooa6U/" },
  { id: 58, name: "Whey Protein Isolado 900g", category: "Suplementos", price: "R$ 65,48", commission: 1.35, sales: 624, rating: 4.8, image: "/products/whey-protein.webp", affiliateLink: "https://vt.tiktok.com/ZS983k3mgfXaV-qdAyX/" },
  { id: 59, name: "Maca Peruana", category: "Suplementos", price: "R$ 22,24", commission: 5.68, sales: 591, rating: 4.7, image: "/products/maca-peruana.webp", affiliateLink: "https://vt.tiktok.com/ZS983kTnkGJSf-ob7Bc/" },
  { id: 60, name: "Vitamina B12", category: "Suplementos", price: "R$ 34,99", commission: 3.50, sales: 558, rating: 4.6, image: "/products/vitamina-b12.webp", affiliateLink: "https://vt.tiktok.com/ZS983BRuQ8MYD-ubSpE/" },
  { id: 61, name: "Kit Melatonina 5 Unidades", category: "Suplementos", price: "R$ 39,66", commission: 4.08, sales: 525, rating: 4.8, image: "/products/kit-melatonina.webp", affiliateLink: "https://vt.tiktok.com/ZS983BrrM3KNS-DOtVO/" },
  { id: 62, name: "Dr Good Melatonina Gummy", category: "Suplementos", price: "R$ 52,90", commission: 2.64, sales: 492, rating: 4.9, image: "/products/drgood-melatonina.webp", affiliateLink: "https://vt.tiktok.com/ZS983DtWpTdQ4-6M26d/" },
  // Eletrônicos
  { id: 63, name: "Carregador de Carro Retrátil", category: "Eletrônicos", price: "R$ 59,49", commission: 7.14, sales: 480, rating: 4.6, image: "/products/carregador-carro.webp", affiliateLink: "https://vt.tiktok.com/ZS983Dn3Q66LY-vWZZf/" },
  { id: 64, name: "Carregador Portátil", category: "Eletrônicos", price: "R$ 75,95", commission: 7.95, sales: 465, rating: 4.7, image: "/products/carregador-portatil.webp", affiliateLink: "https://vt.tiktok.com/ZS983U2MHh1Nh-83CQU/" },
  { id: 65, name: "Aspirador de Pó 2 em 1", category: "Eletrônicos", price: "R$ 34,99", commission: 1.40, sales: 450, rating: 4.5, image: "/products/aspirador-po.webp", affiliateLink: "https://vt.tiktok.com/ZS983U9RTumwv-kY7tk/" },
  { id: 66, name: "Camera Digital 1080Hp", category: "Eletrônicos", price: "R$ 90,45", commission: 12.54, sales: 435, rating: 4.6, image: "/products/camera-digital.webp", affiliateLink: "https://vt.tiktok.com/ZS983U4Pyjove-nmgWX/" },
  { id: 67, name: "Visor Solar Do Carro", category: "Eletrônicos", price: "R$ 57,99", commission: 7.54, sales: 420, rating: 4.4, image: "/products/visor-solar-carro.webp", affiliateLink: "https://vt.tiktok.com/ZS983UwfAHNeQ-GYnBv/" },
  { id: 68, name: "Aromatizador Solar de Carro", category: "Eletrônicos", price: "R$ 33,49", commission: 3.18, sales: 405, rating: 4.5, image: "/products/aromatizador-carro.webp", affiliateLink: "https://vt.tiktok.com/ZS983yV8MM4yP-kzMGV/" },
  { id: 69, name: "Console Portátil", category: "Eletrônicos", price: "R$ 167,98", commission: 14.40, sales: 390, rating: 4.8, image: "/products/console-portatil.webp", affiliateLink: "https://vt.tiktok.com/ZS983ypALWY82-mO4E1/" },
  { id: 70, name: "Fone de Ouvido Bluetooth", category: "Eletrônicos", price: "R$ 87,45", commission: 7.00, sales: 375, rating: 4.7, image: "/products/fone-bluetooth.webp", affiliateLink: "https://vt.tiktok.com/ZS983fJ54M2Wa-gj6fC/" },
  { id: 71, name: "Relogio Smartwatch", category: "Eletrônicos", price: "R$ 49,88", commission: 9.98, sales: 360, rating: 4.6, image: "/products/smartwatch.webp", affiliateLink: "https://vt.tiktok.com/ZS983ffV3ebs9-5jCmA/" },
  { id: 72, name: "Webcam Câmera Full Hd", category: "Eletrônicos", price: "R$ 35,90", commission: 2.87, sales: 345, rating: 4.5, image: "/products/webcam-fullhd.webp", affiliateLink: "https://vt.tiktok.com/ZS983fHa8XAor-OZV8k/" },
  { id: 73, name: "Controle Joystick", category: "Eletrônicos", price: "R$ 44,56", commission: 2.75, sales: 330, rating: 4.6, image: "/products/controle-joystick.webp", affiliateLink: "https://vt.tiktok.com/ZS983fWasghwk-FUXZk/" },
  { id: 74, name: "Projetor 4K", category: "Eletrônicos", price: "R$ 152,75", commission: 17.50, sales: 315, rating: 4.9, image: "/products/projetor-4k.webp", affiliateLink: "https://vt.tiktok.com/ZS9835CsrxBut-apTyF/" },
  { id: 75, name: "Monitor Gamer 24''", category: "Eletrônicos", price: "R$ 964,88", commission: 5, sales: 300, rating: 4.8, image: "/products/monitor-gamer.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRYrGb3TCa-3Ee4q/" },
  { id: 76, name: "Suporte Articulado", category: "Eletrônicos", price: "R$ 81,92", commission: 12, sales: 285, rating: 4.5, image: "/products/suporte-articulado.webp", affiliateLink: "https://vt.tiktok.com/ZS9LRNenRKH3M-Q1WBx/" },
  { id: 77, name: "Kit Cartão MicroSd", category: "Eletrônicos", price: "R$ 21,59", commission: 10, sales: 270, rating: 4.4, image: "/products/kit-microsd.webp", affiliateLink: "https://vt.tiktok.com/ZS9LRNDtnhhAs-Z7R6Q/" },
  { id: 78, name: "Massageador Facial", category: "Eletrônicos", price: "R$ 29,69", commission: 5.00, sales: 255, rating: 4.7, image: "/products/massageador-facial.webp", affiliateLink: "https://vt.tiktok.com/ZS9LRNPSqoMfR-MFW0p/" },
  // Beleza
  { id: 79, name: "Rolo Facial De Gelo", category: "Beleza", price: "R$ 22,62", commission: 2.26, sales: 520, rating: 4.6, image: "/products/rolo-facial-gelo.webp", affiliateLink: "https://vt.tiktok.com/ZS983BxepfMgg-lbSx4/" },
  { id: 80, name: "Kit 240 Adesivos Secador de Espinhas", category: "Beleza", price: "R$ 7,99", commission: 0.96, sales: 498, rating: 4.5, image: "/products/adesivos-espinhas.webp", affiliateLink: "https://vt.tiktok.com/ZS983DVSvgSn9-MYtTo/" },
  { id: 81, name: "Escova Secadora", category: "Beleza", price: "R$ 37,25", commission: 3.23, sales: 476, rating: 4.7, badge: { text: "Hot", type: "hot" }, image: "/products/escova-secadora.webp", affiliateLink: "https://vt.tiktok.com/ZS983U8mvtbAT-HOnv5/" },
  { id: 82, name: "Kit 13 Peças Pinceis De Maquiagem", category: "Beleza", price: "R$ 10,40", commission: 0.65, sales: 454, rating: 4.6, image: "/products/pinceis-maquiagem.webp", affiliateLink: "https://vt.tiktok.com/ZS983UyDGCsh9-3x4sE/" },
  { id: 83, name: "Serum Clareador", category: "Beleza", price: "R$ 93,14", commission: 9.50, sales: 432, rating: 4.8, badge: { text: "Escalando", type: "scaling" }, image: "/products/serum-clareador.webp", affiliateLink: "https://vt.tiktok.com/ZS983UTKHSacF-q5Bl3/" },
  { id: 84, name: "Hidratante Calming Cream", category: "Beleza", price: "R$ 49,99", commission: 1.00, sales: 410, rating: 4.7, image: "/products/hidratante-calming.webp", affiliateLink: "https://vt.tiktok.com/ZS983ymoxJLvT-bjBry/" },
  { id: 85, name: "Máscara Modeladora Facial", category: "Beleza", price: "R$ 15,99", commission: 1.92, sales: 388, rating: 4.5, image: "/products/mascara-modeladora.webp", affiliateLink: "https://vt.tiktok.com/ZS983yTV4KaDU-b4CeR/" },
  { id: 86, name: "Tonico de Acido Salicilico", category: "Beleza", price: "R$ 94,73", commission: 4.74, sales: 366, rating: 4.6, image: "/products/tonico-salicilico.webp", affiliateLink: "https://vt.tiktok.com/ZS983fkokeVES-s8hmB/" },
  { id: 87, name: "Kit Lola Cosmeticos Hidratação", category: "Beleza", price: "R$ 85,40", commission: 4.27, sales: 344, rating: 4.8, badge: { text: "Tendência", type: "trending" }, image: "/products/kit-lola-hidratacao.webp", affiliateLink: "https://vt.tiktok.com/ZS983fWasghwk-FUXZk/" },
  { id: 88, name: "Depilador Indolor", category: "Beleza", price: "R$ 15,64", commission: 1.61, sales: 322, rating: 4.5, image: "/products/depilador-indolor.webp", affiliateLink: "https://vt.tiktok.com/ZS983PfohgskP-jldZo/" },
  { id: 89, name: "Esfoliante Com Acido Hialurônico", category: "Beleza", price: "R$ 16,99", commission: 1.78, sales: 300, rating: 4.7, image: "/products/esfoliante-hialuronico.webp", affiliateLink: "https://vt.tiktok.com/ZS9LRLXW5pY7B-PH4nM/" },
  { id: 90, name: "Kit 20 Peças Esponjas de Beleza", category: "Beleza", price: "R$ 27,99", commission: 2.94, sales: 278, rating: 4.4, image: "/products/kit-esponjas-beleza.webp", affiliateLink: "https://vt.tiktok.com/ZS9LRN2XWS4RB-Wj9u5/" },
  { id: 91, name: "Pinça Profissional De Sobrancelhas", category: "Beleza", price: "R$ 4,65", commission: 0.42, sales: 256, rating: 4.6, image: "/products/pinca-sobrancelhas.webp", affiliateLink: "https://vt.tiktok.com/ZS9LRNyjPU88q-VFaNv/" },
  { id: 92, name: "Mascara Matizadora", category: "Beleza", price: "R$ 47,61", commission: 6.61, sales: 234, rating: 4.7, image: "/products/mascara-matizadora.webp", affiliateLink: "https://vt.tiktok.com/ZS9LRNWXpW829-kVhHM/" },
  { id: 93, name: "Mascara Facial", category: "Beleza", price: "R$ 170,05", commission: 8.95, sales: 212, rating: 4.5, image: "/products/mascara-facial.webp", affiliateLink: "https://vt.tiktok.com/ZS9LRFjhBVyjn-59sGi/" },
  { id: 94, name: "Mascara para Cilios", category: "Beleza", price: "R$ 56,69", commission: 7.56, sales: 190, rating: 4.8, image: "/products/mascara-cilios.webp", affiliateLink: "https://vt.tiktok.com/ZS9LRM83x4mD2-CSSHP/" },
  // Acessórios
  { id: 104, name: "Organizador de Cosméticos", category: "Acessórios", price: "R$ 33,64", commission: 2.14, sales: 2100, rating: 4.7, badge: { text: "Hot", type: "hot" }, image: "/products/organizador-cosmeticos.webp", affiliateLink: "https://vt.tiktok.com/ZS9832UaVANrh-VvZ68/" },
  { id: 105, name: "Inflador Elétrico Digital", category: "Acessórios", price: "R$ 208,22", commission: 16.66, sales: 1980, rating: 4.8, badge: { text: "Escalando", type: "scaling" }, image: "/products/inflador-eletrico.webp", affiliateLink: "https://vt.tiktok.com/ZS9832mPFX2ov-zlamF/" },
  { id: 106, name: "Massageador de Pescoço", category: "Acessórios", price: "R$ 29,69", commission: 2.73, sales: 1850, rating: 4.9, badge: { text: "Hot", type: "hot" }, image: "/products/massageador-pescoco.webp", affiliateLink: "https://vt.tiktok.com/ZS9832nERxAdF-wJS4Z/" },
  { id: 107, name: "Afiador Profissional", category: "Acessórios", price: "R$ 10,90", commission: 1.09, sales: 1720, rating: 4.6, badge: { text: "Tendência", type: "trending" }, image: "/products/afiador-profissional.webp", affiliateLink: "https://vt.tiktok.com/ZS983j8xBxnhu-c3uTQ/" },
  { id: 108, name: "Revitalizador de Plástico", category: "Acessórios", price: "R$ 21,54", commission: 2.76, sales: 1650, rating: 4.5, image: "/products/revitalizador-plastico.webp", affiliateLink: "https://vt.tiktok.com/ZS983jjopAtUH-EJFB1/" },
  { id: 109, name: "Ponteira Universal", category: "Acessórios", price: "R$ 24,60", commission: 2.26, sales: 1580, rating: 4.4, image: "/products/ponteira-universal.webp", affiliateLink: "https://vt.tiktok.com/ZS983juLREBPm-ssDyv/" },
  { id: 110, name: "Kit Alto Falante Bomber", category: "Acessórios", price: "R$ 99,00", commission: 3.96, sales: 1500, rating: 4.7, badge: { text: "Escalando", type: "scaling" }, image: "/products/kit-alto-falante.webp", affiliateLink: "https://vt.tiktok.com/ZS983j4j3FSsh-Djyhj/" },
  { id: 111, name: "Capa Proteção Freio de Mão", category: "Acessórios", price: "R$ 11,83", commission: 0.99, sales: 1420, rating: 4.3, image: "/products/capa-freio-mao.webp", affiliateLink: "https://vt.tiktok.com/ZS983j3RaXJma-ZAfB4/" },
  { id: 112, name: "Carregador de Bateria Automotivo", category: "Acessórios", price: "R$ 51,22", commission: 5.49, sales: 1350, rating: 4.8, badge: { text: "Hot", type: "hot" }, image: "/products/carregador-bateria.webp", affiliateLink: "https://vt.tiktok.com/ZS9836LxjcQBM-3TElB/" },
  { id: 113, name: "Óculos Realidade Virtual", category: "Acessórios", price: "R$ 67,32", commission: 2.08, sales: 1280, rating: 4.6, badge: { text: "Tendência", type: "trending" }, image: "/products/oculos-vr.webp", affiliateLink: "https://vt.tiktok.com/ZS9836Sc7cvMV-knaHT/" },
  { id: 114, name: "Amolador Portátil", category: "Acessórios", price: "R$ 27,99", commission: 2.66, sales: 1210, rating: 4.5, image: "/products/amolador-portatil.webp", affiliateLink: "https://vt.tiktok.com/ZS9836P5xTsyw-JkCtf/" },
  { id: 115, name: "Cadeira Dobrável", category: "Acessórios", price: "R$ 65,00", commission: 4.55, sales: 1140, rating: 4.4, image: "/products/cadeira-dobravel.webp", affiliateLink: "https://vt.tiktok.com/ZS9836nAKrywP-Q7oVR/" },
  { id: 116, name: "Porta Copos Automotivo", category: "Acessórios", price: "R$ 9,50", commission: 0.90, sales: 1070, rating: 4.3, image: "/products/porta-copos.webp", affiliateLink: "https://vt.tiktok.com/ZS983hAQjwTSG-RAujV/" },
  { id: 117, name: "Seladora a Vácuo", category: "Acessórios", price: "R$ 35,88", commission: 1.85, sales: 1000, rating: 4.8, badge: { text: "Escalando", type: "scaling" }, image: "/products/seladora-vacuo.webp", affiliateLink: "https://vt.tiktok.com/ZS983h5pphe68-MKCPL/" },
  // Novos produtos adicionados
  { id: 118, name: "Rolo Massageador Facial Com Gelo", category: "Beleza", price: "R$ 21,27", commission: 2.54, sales: 0, rating: 4.8, badge: { text: "Tendência", type: "trending" }, image: "/products/rolo-massageador-facial.webp", affiliateLink: "https://vt.tiktok.com/ZS9LRrKWECBGF-vz47r/" },
  { id: 119, name: "Escova de Dentes Elétrica Branqueador IPX7", category: "Beleza", price: "R$ 30,99", commission: 2.48, sales: 0, rating: 4.7, badge: { text: "Hot", type: "hot" }, image: "/products/escova-dentes-eletrica.webp", affiliateLink: "https://vt.tiktok.com/ZS9LRhdMTYMDf-OquEM/" },
  { id: 120, name: "Irrigador Oral Water Flosser Recarregável", category: "Beleza", price: "R$ 71,91", commission: 9.99, sales: 0, rating: 4.9, badge: { text: "Escalando", type: "scaling" }, image: "/products/irrigador-oral.webp", affiliateLink: "https://vt.tiktok.com/ZS9LRhYXdrw29-5ihYs/" },
  { id: 122, name: "Cropped Coração Multiformas", category: "Moda", price: "R$ 32,21", commission: 3.38, sales: 4972, rating: 4.5, badge: { text: "Hot", type: "hot" }, image: "/products/cropped-coracao.webp", affiliateLink: "" },
  { id: 123, name: "Vestido Tubinho Babado Lateral Suplex", category: "Moda", price: "R$ 124,90", commission: 13.64, sales: 0, rating: 4.7, badge: { text: "Tendência", type: "trending" }, image: "/products/vestido-tubinho.webp", affiliateLink: "https://vt.tiktok.com/ZS9L8AKdwUgFc-zb4WK/" },
  { id: 124, name: "Camisola Bailarina Decote Nas Costas", category: "Moda", price: "R$ 31,99", commission: 3.20, sales: 21900, rating: 4.8, badge: { text: "Hot", type: "hot" }, image: "/products/camisola-bailarina.webp", affiliateLink: "https://vt.tiktok.com/ZS9L8DJcTm1yC-hoX0z/" },
  { id: 125, name: "Macaquinho Feminino Fitness Alcinha", category: "Moda", price: "R$ 33,56", commission: 3.36, sales: 16600, rating: 4.4, badge: { text: "Escalando", type: "scaling" }, image: "/products/macaquinho-fitness.webp", affiliateLink: "https://vt.tiktok.com/ZS9L8Dja2P9Yv-YYAHh/" },
  // Vestidos Femininos / Evangélicos
  { id: 126, name: "Vestido Longo Elegante Com Manga Duna Linho Evangélica", category: "Moda", price: "R$ 69,94", commission: 8.39, sales: 156, rating: 5.0, badge: { text: "Tendência", type: "trending" }, image: "/products/vestido-longo-elegante-azul.png", affiliateLink: "https://vt.tiktok.com/ZS9Nd8DKdevum-UXksQ/" },
  { id: 127, name: "Vestido Feminino Midi Rodado Evangélico Manga Bufante", category: "Moda", price: "R$ 48,90", commission: 4.16, sales: 1562, rating: 4.6, badge: { text: "Hot", type: "hot" }, image: "/products/vestido-feminino-evangelico-marrom.png", affiliateLink: "https://vt.tiktok.com/ZS9Nd8mQMehg8-LNIdy/" },
  { id: 128, name: "Vestido Midi Evangélico Listrado com Botões Manga 3/4", category: "Moda", price: "R$ 80,99", commission: 8.10, sales: 29, rating: 5.0, badge: { text: "Tendência", type: "trending" }, image: "/products/vestido-midi-evangelico-listrado.png", affiliateLink: "https://vt.tiktok.com/ZS9Nd84UcDRTN-oAnUz/" },
  { id: 129, name: "Vestido Longo Lastex Manga Curta Soltinho Blogueira Viral", category: "Moda", price: "R$ 51,98", commission: 5.56, sales: 0, rating: 4.7, badge: { text: "Hot", type: "hot" }, image: "/products/vestido-longo-lastex-laranja.png", affiliateLink: "https://vt.tiktok.com/ZS9Nd8Vr6GEgC-IKL9h/" },
  { id: 130, name: "Vestido Longo Feminino Moda Evangélica", category: "Moda", price: "R$ 75,00", commission: 8.25, sales: 206, rating: 4.9, badge: { text: "Escalando", type: "scaling" }, image: "/products/vestido-longo-feminino-evangelica.png", affiliateLink: "https://vt.tiktok.com/ZS9Nd8tpK42qo-tItXo/" },
  { id: 131, name: "Vestido Midi Evangélico com Manga Princesa Algodão", category: "Moda", price: "R$ 75,00", commission: 8.25, sales: 206, rating: 4.9, badge: { text: "Hot", type: "hot" }, image: "/products/vestido-midi-evangelico-princesa.png", affiliateLink: "https://vt.tiktok.com/ZS9Nd8vV8A9gt-AkoTZ/" },
  { id: 132, name: "Vestido Longo Listrado com Botões e Cinto Manga Bufante", category: "Moda", price: "R$ 67,55", commission: 6.76, sales: 336, rating: 4.5, badge: { text: "Tendência", type: "trending" }, image: "/products/vestido-longo-listrado-amarelo.png", affiliateLink: "https://vt.tiktok.com/ZS9NdFYevrDAW-TGVbF/" },
];

const categories = ["Todos", "Casa", "Moda", "Eletrônicos", "Acessórios", "Beleza", "Livros", "Suplementos"];

const commissionFilterOptions = [
  { value: "0", label: "Todas" },
  { value: "5", label: "Acima de 5%" },
  { value: "8", label: "Acima de 8%" },
  { value: "15", label: "Acima de 15%" },
];

const sortOptions = [
  { value: "opportunity", label: "Melhor Oportunidade" },
  { value: "sales", label: "Mais Vendidos" },
  { value: "commission", label: "Maiores Comissões" },
  { value: "price-asc", label: "Menor Preço" },
  { value: "price-desc", label: "Maior Preço" },
  { value: "rating", label: "Melhor Avaliação" },
];

const badgeStyles = {
  hot: "bg-tiktok-pink/20 text-tiktok-pink border-tiktok-pink/30",
  scaling: "bg-tiktok-green/20 text-tiktok-green border-tiktok-green/30",
  trending: "bg-tiktok-cyan/20 text-tiktok-cyan border-tiktok-cyan/30",
};

const badgeIcons = {
  hot: <Flame className="w-3 h-3" />,
  scaling: <Rocket className="w-3 h-3" />,
  trending: <BarChart3 className="w-3 h-3" />,
};

const getGainPerSale = (product: AffiliateProduct) => {
  const price = parseFloat(product.price.replace("R$ ", "").replace(",", "."));
  return price * product.commission / 100;
};

const AffiliateCard = ({ product }: { product: AffiliateProduct }) => {
  const gainPerSale = getGainPerSale(product);
  const hasGoodCommission = product.commission > 8;

  return (
    <div className="glass-card card-gradient-border inner-shine p-4 hover-glow group transition-all duration-500 relative overflow-hidden">
      <div className="relative mb-4">
        <div className="w-full h-44 rounded-xl bg-muted overflow-hidden">
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-muted-foreground">📦</div>
          )}
        </div>
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          {product.badge && (
            <span className={cn("text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 border", badgeStyles[product.badge.type])}>
              {badgeIcons[product.badge.type]} {product.badge.text}
            </span>
          )}
          {hasGoodCommission && (
            <span className="text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 border bg-green-500/20 text-green-400 border-green-500/30">
              💰 Boa comissão
            </span>
          )}
        </div>
      </div>

      <h3 className="font-semibold mb-1 line-clamp-2 min-h-[48px]">{product.name}</h3>
      <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
      
      <div className="flex items-center gap-2 mb-3">
        <Star className="w-4 h-4 text-tiktok-yellow fill-tiktok-yellow" />
        <span className="text-sm font-medium">{product.rating}</span>
        <span className="text-muted-foreground text-sm">• {product.sales.toLocaleString()} vendas</span>
      </div>

      {/* Commission Highlight - Gain per sale emphasized */}
      <div className="p-3 rounded-xl bg-gradient-to-r from-green-500/10 to-tiktok-cyan/10 border border-green-500/20 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Ganho por venda</p>
            <p className="text-2xl font-bold text-green-400">
              R$ {gainPerSale.toFixed(2).replace(".", ",")}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Comissão</p>
            <p className="text-sm font-medium text-muted-foreground">
              {product.commission}%
            </p>
          </div>
        </div>
      </div>

      {/* Price and Action */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <p className="text-lg font-bold">{product.price}</p>
        <a 
          href={product.affiliateLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black text-white text-sm font-medium hover:bg-black/80 transition-all"
        >
          <TikTokIcon className="w-4 h-4" />
          Afiliar
        </a>
      </div>
    </div>
  );
};

const ITEMS_PER_PAGE = 12;

const Affiliation = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [sortBy, setSortBy] = useState("opportunity");
  const [minCommission, setMinCommission] = useState("0");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [isLoading, setIsLoading] = useState(true);

  useState(() => {
    setTimeout(() => setIsLoading(false), 400);
  });

  const filteredProducts = useMemo(() => affiliateProducts
    .filter(product => {
      const hasSearch = searchTerm.trim().length > 0;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      // Quando o usuário pesquisa, ignoramos categoria e filtros de comissão
      if (hasSearch) return matchesSearch;
      const matchesCategory = selectedCategory === "Todos" || product.category === selectedCategory;
      const matchesCommission = product.commission >= parseFloat(minCommission);
      const gain = getGainPerSale(product);
      const matchesMinGain = minCommission === "0" ? true : gain >= 1.50;
      return matchesCategory && matchesCommission && matchesMinGain;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "opportunity": {
          const scoreA = (a.commission > 8 ? 50 : 0) + (a.sales > 500 ? 50 : 0);
          const scoreB = (b.commission > 8 ? 50 : 0) + (b.sales > 500 ? 50 : 0);
          if (scoreB !== scoreA) return scoreB - scoreA;
          return getGainPerSale(b) - getGainPerSale(a);
        }
        case "sales":
          return b.sales - a.sales;
        case "commission":
          return b.commission - a.commission;
        case "price-asc":
          return parseFloat(a.price.replace("R$ ", "").replace(",", ".")) - parseFloat(b.price.replace("R$ ", "").replace(",", "."));
        case "price-desc":
          return parseFloat(b.price.replace("R$ ", "").replace(",", ".")) - parseFloat(a.price.replace("R$ ", "").replace(",", "."));
        case "rating":
          return b.rating - a.rating;
        default:
          return 0;
      }
    }), [searchTerm, selectedCategory, sortBy, minCommission]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  return (
    <div className="min-h-screen bg-background">
      <main className="p-4 md:p-6 lg:p-8">
        {/* Hero with animated badge */}
        <div className="mb-6 md:mb-8">
          <div className="inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-gradient-to-r from-tiktok-cyan/20 to-tiktok-pink/20 border border-tiktok-cyan/30 mb-4 animate-fade-in">
            <Users className="w-4 h-4 text-tiktok-cyan" />
            <span className="text-xs md:text-sm font-medium bg-gradient-to-r from-tiktok-cyan to-tiktok-pink bg-clip-text text-transparent">
              Programa de Afiliados
            </span>
          </div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2">
            Afilie-se aos produtos do TikTok Shop
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Produtos selecionados com as melhores comissões do TikTok Shop
          </p>
        </div>

        {/* Search, Filter and Sort */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4">
            <div className="relative flex-1 sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 sm:flex-none px-3 md:px-4 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Commission Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Comissão:</span>
            {commissionFilterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setMinCommission(option.value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0",
                  minCommission === option.value
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
            <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-3 md:px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0",
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <AffiliateCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {visibleProducts.map((product) => (
                <AffiliateCard key={product.id} product={product} />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
                  className="px-6 py-3 rounded-xl bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-all border border-border"
                >
                  Carregar mais produtos
                </button>
              </div>
            )}
          </>
        )}

        {!isLoading && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum produto encontrado</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Affiliation;