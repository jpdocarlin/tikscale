import { useState, useMemo } from "react";
import { ProductCardSkeleton } from "@/components/ProductCardSkeleton";
import { Search, Filter, TrendingUp, Star, ShoppingCart, ExternalLink, Flame, Rocket, BarChart3, Coins } from "lucide-react";
import { ProductSalesModal } from "@/components/ProductSalesModal";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// Product Images
// Livros
// Suplementos
// Eletrônicos
// Beleza
// Novos Mais Vendidos
// Acessórios
// Novos produtos

interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  commission: number;
  sales: number;
  rating: number;
  badge?: { text: string; type: "hot" | "scaling" | "trending" };
  image?: string;
  affiliateLink: string;
}

const allProducts: Product[] = [
  // Mais Vendidos - Novos
  { id: 95, name: "9D Dentes Branco 14 Tiras", category: "Beleza", price: "R$ 31,99", commission: 6, sales: 3200, rating: 4.9, badge: { text: "Hot", type: "hot" }, image: "/products/9d-dentes-brancos.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRL6R4wGLY-P9JWX/" },
  { id: 96, name: "Relógio Digital Espelhado LED Mesa", category: "Eletrônicos", price: "R$ 27,99", commission: 1.68, sales: 3150, rating: 4.8, badge: { text: "Hot", type: "hot" }, image: "/products/relogio-digital.webp", affiliateLink: "https://vt.tiktok.com/ZSHKR2uypd5BS-DbZv8/" },
  { id: 97, name: "ENSSU Aparador Corporal Masculino USB", category: "Beleza", price: "R$ 94,00", commission: 12.90, sales: 3100, rating: 4.7, badge: { text: "Escalando", type: "scaling" }, image: "/products/enssu-aparador.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRjdaEfQQC-8StK1/" },
  { id: 98, name: "Espelho Maquiagem Inteligente LED", category: "Beleza", price: "R$ 15,89", commission: 1.90, sales: 3050, rating: 4.8, badge: { text: "Tendência", type: "trending" }, image: "/products/espelho-maquiagem-led.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRj7xpccL3-sxXm6/" },
  { id: 99, name: "Fórmula X - Cabelo e Barba", category: "Suplementos", price: "R$ 77,60", commission: 20, sales: 3000, rating: 4.9, badge: { text: "Hot", type: "hot" }, image: "/products/formula-x-barba.webp", affiliateLink: "https://vt.tiktok.com/ZSHKR62WvnbBa-vw9nv/" },
  { id: 100, name: "Luminária Projetor Astronauta Galaxy", category: "Casa", price: "R$ 37,06", commission: 4.63, sales: 2950, rating: 4.8, badge: { text: "Escalando", type: "scaling" }, image: "/products/luminaria-astronauta.webp", affiliateLink: "https://vt.tiktok.com/ZSHKR6aABL9ve-R2yRH/" },
  { id: 101, name: "Creatina Gummy + Vinagre Maçã Gummy", category: "Suplementos", price: "R$ 104,30", commission: 13.98, sales: 2900, rating: 4.7, badge: { text: "Tendência", type: "trending" }, image: "/products/creatina-gummy.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRMFhtmkj9-KtRIr/" },
  { id: 102, name: "Reload 300gr Suplemento em Pó", category: "Suplementos", price: "R$ 104,00", commission: 13.90, sales: 2880, rating: 4.8, badge: { text: "Escalando", type: "scaling" }, image: "/products/reload-suplemento.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRrhABVrqh-FvoyJ/" },
  { id: 103, name: "Luminária Lua 3D LED Abajur", category: "Casa", price: "R$ 35,99", commission: 3.20, sales: 2860, rating: 4.9, badge: { text: "Hot", type: "hot" }, image: "/products/luminaria-lua-3d.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRhNoyrpvK-XaQ01/" },
  // Produtos originais
  { id: 1, name: "Luz Pisca Pisca Natal", category: "Casa", price: "R$ 12,40", commission: 1.24, sales: 2847, rating: 4.8, badge: { text: "Hot", type: "hot" }, image: "/products/luz-pisca-pisca.webp", affiliateLink: "https://vt.tiktok.com/ZSHKJJJebjhYN-ChLyT/" },
  { id: 2, name: "Pro3 Magnésio", category: "Suplementos", price: "R$ 23,93", commission: 2.99, sales: 2654, rating: 4.9, badge: { text: "Hot", type: "hot" }, image: "/products/pro3-magnesio.webp", affiliateLink: "https://vt.tiktok.com/ZSHKJJebRFRoY-MYL3I/" },
  { id: 3, name: "Bolsa Reforçada Notebook Impermeável", category: "Acessórios", price: "R$ 29,50", commission: 3.69, sales: 2341, rating: 4.7, badge: { text: "Escalando", type: "scaling" }, image: "/products/bolsa-notebook.webp", affiliateLink: "https://vt.tiktok.com/ZSHKJJFNJkmgC-riivU/" },
  { id: 4, name: "TWS Fone Bluetooth", category: "Eletrônicos", price: "R$ 19,38", commission: 1.19, sales: 2198, rating: 4.6, badge: { text: "Hot", type: "hot" }, image: "/products/tws-fone.webp", affiliateLink: "https://vt.tiktok.com/ZSHKJJj4Qjns4-hf2Ux/" },
  { id: 5, name: "Kit Pro3 Magnésio", category: "Suplementos", price: "R$ 47,65", commission: 5.99, sales: 1987, rating: 4.9, badge: { text: "Escalando", type: "scaling" }, image: "/products/pro3-magnesio.webp", affiliateLink: "https://vt.tiktok.com/ZSHKJJkkPf1sm-3oMvA/" },
  { id: 6, name: "Kit 2 Calças Leggings", category: "Moda", price: "R$ 33,10", commission: 4.14, sales: 1876, rating: 4.7, badge: { text: "Tendência", type: "trending" }, image: "/products/kit-leggings.webp", affiliateLink: "https://vt.tiktok.com/ZSHKJJUDQeUbB-qWq6M/" },
  { id: 7, name: "FitS36 Suplemento", category: "Suplementos", price: "R$ 29,64", commission: 3.74, sales: 1754, rating: 4.8, badge: { text: "Escalando", type: "scaling" }, image: "/products/fits36.webp", affiliateLink: "https://vt.tiktok.com/ZSHKJJfDCAek6-ehCnp/" },
  { id: 8, name: "Necessaire Organizador", category: "Acessórios", price: "R$ 13,90", commission: 1.39, sales: 1643, rating: 4.5, image: "/products/necessaire.webp", affiliateLink: "https://vt.tiktok.com/ZSHKJJHfHMUYE-yN3Wl/" },
  { id: 9, name: "Kit Lençol 400 Fios 3 Peças", category: "Casa", price: "R$ 23,90", commission: 2.39, sales: 1521, rating: 4.8, badge: { text: "Tendência", type: "trending" }, image: "/products/kit-lencol.webp", affiliateLink: "https://vt.tiktok.com/ZSHKJJQrmwvSQ-3voNh/" },
  { id: 10, name: "Repelente Eletrônico", category: "Casa", price: "R$ 27,99", commission: 4.76, sales: 1432, rating: 4.4, image: "/products/repelente.webp", affiliateLink: "https://vt.tiktok.com/ZSHKJJVoXnsce-RY0xv/" },
  { id: 11, name: "Magnésio E Inositol", category: "Suplementos", price: "R$ 41,24", commission: 4.99, sales: 1398, rating: 4.9, image: "/products/pro3-magnesio.webp", affiliateLink: "https://vt.tiktok.com/ZSHKJJbwoP6uL-tLH2k/" },
  { id: 12, name: "365 Amor com Deus", category: "Livros", price: "R$ 24,32", commission: 2.99, sales: 1287, rating: 4.9, badge: { text: "Tendência", type: "trending" }, image: "/products/365-amor-deus.webp", affiliateLink: "https://vt.tiktok.com/ZSHKJJsJWb1Ag-Q36CA/" },
  { id: 13, name: "Relógio de Pulso Digital", category: "Eletrônicos", price: "R$ 18,39", commission: 7, sales: 1176, rating: 4.5, image: "/products/relogio-digital.webp", affiliateLink: "https://vt.tiktok.com/ZSHKJJnX3Naew-1Gnzw/" },
  { id: 14, name: "Perfume Attracione Men", category: "Beleza", price: "R$ 83,50", commission: 16, sales: 1098, rating: 4.7, badge: { text: "Escalando", type: "scaling" }, image: "/products/perfume-attracione.webp", affiliateLink: "https://vt.tiktok.com/ZSHKJJWQCEYhc-REaQE/" },
  { id: 15, name: "Kit 2 Top Sutiã", category: "Moda", price: "R$ 29,16", commission: 10, sales: 987, rating: 4.6, image: "/products/kit-top-sutia.webp", affiliateLink: "https://vt.tiktok.com/ZSHKJJ3vLC8ge-gntUC/" },
  { id: 16, name: "Short Cinta Modeladora", category: "Moda", price: "R$ 24,99", commission: 12, sales: 876, rating: 4.7, badge: { text: "Hot", type: "hot" }, image: "/products/short-cinta.webp", affiliateLink: "https://vt.tiktok.com/ZSHKJJKMcGavj-JU4tw/" },
  { id: 17, name: "Escova de Dente Elétrica", category: "Beleza", price: "R$ 13,99", commission: 10, sales: 765, rating: 4.6, image: "/products/escova-eletrica.webp", affiliateLink: "https://vt.tiktok.com/ZSHKJe1muHEsD-H24lR/" },
  { id: 18, name: "Bermudas 3 Dry Fit De Alto Padrão", category: "Moda", price: "R$ 35,64", commission: 10, sales: 654, rating: 4.5, image: "/products/bermudas-dryfit.webp", affiliateLink: "https://vt.tiktok.com/ZSHKJed1myQLo-phwuB/" },
  { id: 19, name: "Boné Aba Curva Premium", category: "Moda", price: "R$ 23,68", commission: 7, sales: 543, rating: 4.6, image: "/products/bone-aba-curva.webp", affiliateLink: "" },
  { id: 20, name: "Cinta Modeladora De Alta Compressão", category: "Moda", price: "R$ 25,34", commission: 10.5, sales: 520, rating: 4.7, image: "/products/cinta-modeladora.webp", affiliateLink: "" },
  { id: 21, name: "Kit 3 Calças Sarjas Masculina", category: "Moda", price: "R$ 39,99", commission: 10.5, sales: 498, rating: 4.5, image: "/products/kit-calcas-sarja.webp", affiliateLink: "" },
  { id: 22, name: "Camisa Polimiada Masculina", category: "Moda", price: "R$ 44,99", commission: 2.50, sales: 476, rating: 4.4, image: "/products/camisa-polimiada.webp", affiliateLink: "" },
  { id: 23, name: "Camisa Polo Dryfit", category: "Moda", price: "R$ 29,99", commission: 5, sales: 454, rating: 4.6, image: "/products/camisa-polo-dryfit.webp", affiliateLink: "" },
  { id: 24, name: "Kit 3 Bermudas (Linho) Masculina", category: "Moda", price: "R$ 39,00", commission: 1.95, sales: 432, rating: 4.5, image: "/products/kit-bermudas-linho.webp", affiliateLink: "" },
  { id: 25, name: "Jaqueta Corta Vento Impermeável", category: "Moda", price: "R$ 23,64", commission: 10, sales: 410, rating: 4.7, image: "/products/jaqueta-corta-vento.webp", affiliateLink: "" },
  { id: 26, name: "Kit 3 Calças Jeans Feminina", category: "Moda", price: "R$ 35,99", commission: 10.5, sales: 388, rating: 4.6, image: "/products/kit-calcas-jeans.webp", affiliateLink: "" },
  { id: 27, name: "Camisa Social Gola Padre Masculina", category: "Moda", price: "R$ 30,39", commission: 10, sales: 366, rating: 4.5, image: "/products/camisa-gola-padre.webp", affiliateLink: "" },
  { id: 28, name: "Camiseta Masculina Canelada Gola Alta", category: "Moda", price: "R$ 35,00", commission: 10, sales: 344, rating: 4.4, image: "/products/camiseta-gola-alta.webp", affiliateLink: "" },
  { id: 29, name: "Moletom Casaco Masculino", category: "Moda", price: "R$ 32,38", commission: 10, sales: 322, rating: 4.6, image: "/products/moletom-casaco.webp", affiliateLink: "" },
  // Casa e Acessórios
  { id: 30, name: "Puff Redondo Luxo", category: "Casa", price: "R$ 53,23", commission: 8, sales: 312, rating: 4.7, image: "/products/puff-redondo.webp", affiliateLink: "https://vt.tiktok.com/ZSHKdJGPdnJBD-MVvPm/" },
  { id: 31, name: "Capa Colchão Impermeável Com Elastico", category: "Casa", price: "R$ 25,44", commission: 10, sales: 298, rating: 4.6, image: "/products/capa-colchao.webp", affiliateLink: "https://vt.tiktok.com/ZSHKdJvtSAPbk-zuuBl/" },
  { id: 32, name: "Copo Térmico Inteligente", category: "Acessórios", price: "R$ 24,89", commission: 8, sales: 287, rating: 4.5, image: "/products/copo-termico.webp", affiliateLink: "https://vt.tiktok.com/ZSHKdJKtYb8nP-ZxMNO/" },
  { id: 33, name: "Guarda Chuva Automatico", category: "Acessórios", price: "R$ 26,39", commission: 10, sales: 276, rating: 4.4, image: "/products/guarda-chuva.webp", affiliateLink: "https://vt.tiktok.com/ZSHKdeetq5YNs-VUVwD/" },
  { id: 34, name: "Sapateira Vertical Inox", category: "Casa", price: "R$ 40,89", commission: 15, sales: 265, rating: 4.6, image: "/products/sapateira-vertical.webp", affiliateLink: "https://vt.tiktok.com/ZSHKde8F5HQdP-BWCqV/" },
  { id: 35, name: "Jogo De Panelas Antiaderente 9 Peças", category: "Casa", price: "R$ 115,46", commission: 10, sales: 254, rating: 4.8, image: "/products/jogo-panelas.webp", affiliateLink: "https://vt.tiktok.com/ZSHKdeYfhA3dX-B7El5/" },
  { id: 36, name: "Cortina Blackout", category: "Casa", price: "R$ 49,99", commission: 9.5, sales: 243, rating: 4.5, image: "/products/cortina-blackout.webp", affiliateLink: "https://vt.tiktok.com/ZSHKdeMN7SLMA-M4Plt/" },
  { id: 37, name: "Extensão 5 Tomadas Elétricas", category: "Casa", price: "R$ 24,79", commission: 10, sales: 232, rating: 4.3, image: "/products/extensao-tomadas.webp", affiliateLink: "https://vt.tiktok.com/ZSHKdeSPJk4by-Wgvs8/" },
  { id: 38, name: "Tapete Jogo De Banheiro 3 Peças", category: "Casa", price: "R$ 29,52", commission: 12.5, sales: 221, rating: 4.4, image: "/products/tapete-banheiro.webp", affiliateLink: "https://vt.tiktok.com/ZSHKdefKqjRJG-pYs4U/" },
  { id: 39, name: "Kit 5 Lençol Queen", category: "Casa", price: "R$ 47,99", commission: 10, sales: 210, rating: 4.7, image: "/products/kit-lencol.webp", affiliateLink: "https://vt.tiktok.com/ZSHKdeu8SmvSm-1XCOs/" },
  // Livros
  { id: 40, name: "Combo Estratégia Kit 3 Livros", category: "Livros", price: "R$ 29,64", commission: 17, sales: 198, rating: 4.8, image: "/products/combo-estrategia-livros.webp", affiliateLink: "https://vt.tiktok.com/ZSHKdd7gRoGHJ-ub3oV/" },
  { id: 41, name: "Livro A Metamorfose", category: "Livros", price: "R$ 19,90", commission: 15, sales: 187, rating: 4.7, image: "/products/livro-metamorfose.webp", affiliateLink: "https://vt.tiktok.com/ZSHKddT1fhhu7-KEGRF/" },
  { id: 42, name: "Oi Deus, Sou eu De Novo", category: "Livros", price: "R$ 62,91", commission: 5, sales: 176, rating: 4.9, image: "/products/oi-deus-sou-eu.webp", affiliateLink: "https://vt.tiktok.com/ZSHKdRJ4CKuCT-6OjlU/" },
  { id: 43, name: "3D Adesivos De Microcenas", category: "Livros", price: "R$ 13,82", commission: 14, sales: 165, rating: 4.5, image: "/products/adesivos-3d-microcenas.webp", affiliateLink: "https://vt.tiktok.com/ZSHKdRRB8NPpv-VrF48/" },
  { id: 44, name: "A Arte Da Guerra", category: "Livros", price: "R$ 19,40", commission: 10, sales: 154, rating: 4.8, image: "/products/arte-da-guerra.webp", affiliateLink: "https://vt.tiktok.com/ZSHKdRY91cLJF-ptZBt/" },
  { id: 45, name: "Livro Interativo Com Som", category: "Livros", price: "R$ 63,20", commission: 7.90, sales: 143, rating: 4.6, image: "/products/livro-interativo-som.webp", affiliateLink: "https://vt.tiktok.com/ZSHKdRMkG7sCd-fSRxt/" },
  { id: 46, name: "A Psicologia Financeira", category: "Livros", price: "R$ 35,77", commission: 4.97, sales: 132, rating: 4.9, image: "/products/psicologia-financeira.webp", affiliateLink: "https://vt.tiktok.com/ZSHKdRBR8oqSY-oeGQA/" },
  { id: 47, name: "Mais Esperto Que o Diabo", category: "Livros", price: "R$ 35,73", commission: 2.53, sales: 121, rating: 4.7, image: "/products/mais-esperto-que-diabo.webp", affiliateLink: "https://vt.tiktok.com/ZSHKdRyLf1aSB-rnJT7/" },
  { id: 48, name: "Caderno Planner De Controle Financeiro", category: "Livros", price: "R$ 44,91", commission: 4.99, sales: 110, rating: 4.5, image: "/products/caderno-planner-financeiro.webp", affiliateLink: "https://vt.tiktok.com/ZSHKdR53SbkvA-Ov372/" },
  { id: 49, name: "Poesias que Escrevi enquanto aprendia viver", category: "Livros", price: "R$ 47,92", commission: 3.00, sales: 99, rating: 4.8, image: "/products/poesias-aprendia-viver.webp", affiliateLink: "https://vt.tiktok.com/ZSHKdRHHaheVA-vbhBO/" },
  // Suplementos
  { id: 50, name: "Mounjax", category: "Suplementos", price: "R$ 142,00", commission: 38.2, sales: 890, rating: 4.8, image: "/products/mounjax.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRdn5m5bN2-OPVC7/" },
  { id: 51, name: "Moringa + Maca Negra", category: "Suplementos", price: "R$ 25,50", commission: 59, sales: 856, rating: 4.7, image: "/products/moringa-maca-negra.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRdwUyXVss-AFWBn/" },
  { id: 52, name: "Dimpless + Morosil", category: "Suplementos", price: "R$ 35,20", commission: 15, sales: 823, rating: 4.9, image: "/products/dimpless-morosil.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRdE4gBsWL-6Yc5L/" },
  { id: 53, name: "Testo", category: "Suplementos", price: "R$ 40,75", commission: 12, sales: 789, rating: 4.6, image: "/products/testo.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRRd6xmyek-Of9VU/" },
  { id: 54, name: "Suplemento Alimentar", category: "Suplementos", price: "R$ 70,72", commission: 45, sales: 756, rating: 4.5, image: "/products/suplemento-alimentar.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRR8h2n9Yy-U2rBl/" },
  { id: 55, name: "Kit 2 Colageno Hidrolisado", category: "Suplementos", price: "R$ 33,35", commission: 12, sales: 723, rating: 4.8, image: "/products/colageno-hidrolisado.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRRYRqV7a5-kz0cG/" },
  { id: 56, name: "Capsulas de Arginina", category: "Suplementos", price: "R$ 32,00", commission: 25, sales: 690, rating: 4.6, image: "/products/capsulas-arginina.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRRM8LAtqo-HRYw2/" },
  { id: 57, name: "Kit 500g Creatina + 500g Taurina", category: "Suplementos", price: "R$ 58,41", commission: 10, sales: 657, rating: 4.9, image: "/products/creatina-taurina.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRRhadY21T-NoqhC/" },
  { id: 58, name: "Whey Protein Isolado 900g", category: "Suplementos", price: "R$ 110,93", commission: 12, sales: 624, rating: 4.8, image: "/products/whey-protein.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRRynnPfDr-uAQXI/" },
  { id: 59, name: "Maca Peruana", category: "Suplementos", price: "R$ 23,93", commission: 20, sales: 591, rating: 4.7, image: "/products/maca-peruana.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRR58DNyLT-ajbNq/" },
  { id: 60, name: "Vitamina B12", category: "Suplementos", price: "R$ 31,99", commission: 10, sales: 558, rating: 4.6, image: "/products/vitamina-b12.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRRuXj2f4P-VuwlZ/" },
  { id: 61, name: "Kit Melatonina 5 Unidades", category: "Suplementos", price: "R$ 25,49", commission: 4, sales: 525, rating: 4.8, image: "/products/kit-melatonina.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRRXVNGUbH-aGA4u/" },
  { id: 62, name: "Dr Good Melatonina Gummy", category: "Suplementos", price: "R$ 32,99", commission: 13, sales: 492, rating: 4.9, image: "/products/drgood-melatonina.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRRgWE1pKn-yCMnm/" },
  // Eletrônicos
  { id: 63, name: "Carregador de Carro Retrátil", category: "Eletrônicos", price: "R$ 41,69", commission: 29, sales: 480, rating: 4.6, image: "/products/carregador-carro.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRFrDUL24f-KeVYV/" },
  { id: 64, name: "Carregador Portátil", category: "Eletrônicos", price: "R$ 23,99", commission: 4.20, sales: 465, rating: 4.7, image: "/products/carregador-portatil.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRFAxawRG9-3PpZ0/" },
  { id: 65, name: "Aspirador de Pó 2 em 1", category: "Eletrônicos", price: "R$ 30,00", commission: 4.50, sales: 450, rating: 4.5, image: "/products/aspirador-po.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRFfjq1brS-pvUGl/" },
  { id: 66, name: "Camera Digital 1080Hp", category: "Eletrônicos", price: "R$ 63,49", commission: 22, sales: 435, rating: 4.6, image: "/products/camera-digital.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRFmCQFdYg-6UVI5/" },
  { id: 67, name: "Visor Solar Do Carro", category: "Eletrônicos", price: "R$ 35,99", commission: 3.04, sales: 420, rating: 4.4, image: "/products/visor-solar-carro.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRFQHGJFVm-EeXoD/" },
  { id: 68, name: "Aromatizador Solar de Carro", category: "Eletrônicos", price: "R$ 27,99", commission: 8.5, sales: 405, rating: 4.5, image: "/products/aromatizador-carro.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRFb3VCwqJ-Aoc2H/" },
  { id: 69, name: "Console Portátil", category: "Eletrônicos", price: "R$ 140,09", commission: 10, sales: 390, rating: 4.8, image: "/products/console-portatil.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRFGyoJSoX-Lpewv/" },
  { id: 70, name: "Fone de Ouvido Bluetooth", category: "Eletrônicos", price: "R$ 18,38", commission: 6, sales: 375, rating: 4.7, image: "/products/fone-bluetooth.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRF7SDvmeH-dO9aK/" },
  { id: 71, name: "Relogio Smartwatch", category: "Eletrônicos", price: "R$ 54,49", commission: 33, sales: 360, rating: 4.6, image: "/products/smartwatch.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRFTqmjN8n-iP7hD/" },
  { id: 72, name: "Webcam Câmera Full Hd", category: "Eletrônicos", price: "R$ 36,98", commission: 9, sales: 345, rating: 4.5, image: "/products/webcam-fullhd.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRY1kJpxao-O8g1q/" },
  { id: 73, name: "Controle Joystick", category: "Eletrônicos", price: "R$ 27,23", commission: 10, sales: 330, rating: 4.6, image: "/products/controle-joystick.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRYdhFpFgg-HKcim/" },
  { id: 74, name: "Projetor 4K", category: "Eletrônicos", price: "R$ 159,99", commission: 8, sales: 315, rating: 4.9, image: "/products/projetor-4k.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRYLbG7scN-jQklE/" },
  { id: 75, name: "Monitor Gamer 24''", category: "Eletrônicos", price: "R$ 964,88", commission: 5, sales: 300, rating: 4.8, image: "/products/monitor-gamer.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRYrGb3TCa-3Ee4q/" },
  { id: 76, name: "Suporte Articulado", category: "Eletrônicos", price: "R$ 81,92", commission: 12, sales: 285, rating: 4.5, image: "/products/suporte-articulado.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRYSyQe9YC-TOUyJ/" },
  { id: 77, name: "Kit Cartão MicroSd", category: "Eletrônicos", price: "R$ 21,59", commission: 10, sales: 270, rating: 4.4, image: "/products/kit-microsd.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRY5QUpTab-cORtb/" },
  { id: 78, name: "Massageador Facial", category: "Eletrônicos", price: "R$ 29,69", commission: 5.00, sales: 255, rating: 4.7, image: "/products/massageador-facial.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRY9cBwxcJ-WYLYv/" },
  // Beleza
  { id: 79, name: "Rolo Facial De Gelo", category: "Beleza", price: "R$ 26,91", commission: 12, sales: 520, rating: 4.6, image: "/products/rolo-facial-gelo.webp", affiliateLink: "https://vt.tiktok.com/ZSHKR6DetLPkF-kCkn1/" },
  { id: 80, name: "Kit 240 Adesivos Secador de Espinhas", category: "Beleza", price: "R$ 6,49", commission: 13.4, sales: 498, rating: 4.5, image: "/products/adesivos-espinhas.webp", affiliateLink: "https://vt.tiktok.com/ZSHKR6yEhJctj-I3UZ3/" },
  { id: 81, name: "Escova Secadora", category: "Beleza", price: "R$ 26,69", commission: 3.12, sales: 476, rating: 4.7, badge: { text: "Hot", type: "hot" }, image: "/products/escova-secadora.webp", affiliateLink: "https://vt.tiktok.com/ZSHKR6moGnNgD-cJ9iG/" },
  { id: 82, name: "Kit 13 Peças Pinceis De Maquiagem", category: "Beleza", price: "R$ 10,00", commission: 1, sales: 454, rating: 4.6, image: "/products/pinceis-maquiagem.webp", affiliateLink: "https://vt.tiktok.com/ZSHKR6utGEyoH-ylQZX/" },
  { id: 83, name: "Serum Clareador", category: "Beleza", price: "R$ 74,90", commission: 11.90, sales: 432, rating: 4.8, badge: { text: "Escalando", type: "scaling" }, image: "/products/serum-clareador.webp", affiliateLink: "https://vt.tiktok.com/ZSHKR6Csx9fbU-2erGD/" },
  { id: 84, name: "Hidratante Calming Cream", category: "Beleza", price: "R$ 31,27", commission: 2.63, sales: 410, rating: 4.7, image: "/products/hidratante-calming.webp", affiliateLink: "https://vt.tiktok.com/ZSHKR6Vh2JUDF-5QG8q/" },
  { id: 85, name: "Máscara Modeladora Facial", category: "Beleza", price: "R$ 15,99", commission: 1.92, sales: 388, rating: 4.5, image: "/products/mascara-modeladora.webp", affiliateLink: "https://vt.tiktok.com/ZSHKR6ph6XqaJ-m804Z/" },
  { id: 86, name: "Tonico de Acido Salicilico", category: "Beleza", price: "R$ 48,28", commission: 7.58, sales: 366, rating: 4.6, image: "/products/tonico-salicilico.webp", affiliateLink: "https://vt.tiktok.com/ZSHKR6ngJxkvx-hwSZE/" },
  { id: 87, name: "Kit Lola Cosmeticos Hidratação", category: "Beleza", price: "R$ 138,51", commission: 4.62, sales: 344, rating: 4.8, badge: { text: "Tendência", type: "trending" }, image: "/products/kit-lola-hidratacao.webp", affiliateLink: "https://vt.tiktok.com/ZSHKR6ckb53n5-HEGAI/" },
  { id: 88, name: "Depilador Indolor", category: "Beleza", price: "R$ 12,99", commission: 1.40, sales: 322, rating: 4.5, image: "/products/depilador-indolor.webp", affiliateLink: "https://vt.tiktok.com/ZSHKR6EBNDrYd-ESEwE/" },
  { id: 89, name: "Esfoliante Com Acido Hialurônico", category: "Beleza", price: "R$ 16,99", commission: 1.78, sales: 300, rating: 4.7, image: "/products/esfoliante-hialuronico.webp", affiliateLink: "https://vt.tiktok.com/ZSHKR6oDMdEh3-5J0jt/" },
  { id: 90, name: "Kit 20 Peças Esponjas de Beleza", category: "Beleza", price: "R$ 27,99", commission: 2.94, sales: 278, rating: 4.4, image: "/products/kit-esponjas-beleza.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRM8DqDsrN-TLroE/" },
  { id: 91, name: "Pinça Profissional De Sobrancelhas", category: "Beleza", price: "R$ 4,65", commission: 0.42, sales: 256, rating: 4.6, image: "/products/pinca-sobrancelhas.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRMYoN9bSc-UZrqJ/" },
  { id: 92, name: "Mascara Matizadora", category: "Beleza", price: "R$ 47,61", commission: 6.61, sales: 234, rating: 4.7, image: "/products/mascara-matizadora.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRM6c2yfQY-Yhoye/" },
  { id: 93, name: "Mascara Facial", category: "Beleza", price: "R$ 170,05", commission: 8.95, sales: 212, rating: 4.5, image: "/products/mascara-facial.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRMhJeSJu8-cUsY7/" },
  { id: 94, name: "Mascara para Cilios", category: "Beleza", price: "R$ 56,69", commission: 7.56, sales: 190, rating: 4.8, image: "/products/mascara-cilios.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRMf8gca1q-MjV9F/" },
  // Acessórios
  { id: 104, name: "Organizador de Cosméticos", category: "Acessórios", price: "R$ 27,53", commission: 4.69, sales: 2100, rating: 4.7, badge: { text: "Hot", type: "hot" }, image: "/products/organizador-cosmeticos.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRBut2BtsF-roAnc/" },
  { id: 105, name: "Inflador Elétrico Digital", category: "Acessórios", price: "R$ 140,39", commission: 18.39, sales: 1980, rating: 4.8, badge: { text: "Escalando", type: "scaling" }, image: "/products/inflador-eletrico.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRBHBuoUVW-LvN9W/" },
  { id: 106, name: "Massageador de Pescoço", category: "Acessórios", price: "R$ 25,50", commission: 1.91, sales: 1850, rating: 4.9, badge: { text: "Hot", type: "hot" }, image: "/products/massageador-pescoco.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRB411EYQU-N7EmK/" },
  { id: 107, name: "Afiador Profissional", category: "Acessórios", price: "R$ 15,60", commission: 3.90, sales: 1720, rating: 4.6, badge: { text: "Tendência", type: "trending" }, image: "/products/afiador-profissional.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRBgU96bh3-UGTUm/" },
  { id: 108, name: "Revitalizador de Plástico", category: "Acessórios", price: "R$ 24,00", commission: 3.06, sales: 1650, rating: 4.5, image: "/products/revitalizador-plastico.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRBskpbDJ2-l8sBh/" },
  { id: 109, name: "Ponteira Universal", category: "Acessórios", price: "R$ 26,90", commission: 2.56, sales: 1580, rating: 4.4, image: "/products/ponteira-universal.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRBvFudyst-GNlxJ/" },
  { id: 110, name: "Kit Alto Falante Bomber", category: "Acessórios", price: "R$ 47,70", commission: 4.50, sales: 1500, rating: 4.7, badge: { text: "Escalando", type: "scaling" }, image: "/products/kit-alto-falante.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRBEXbgb9G-qCjde/" },
  { id: 111, name: "Capa Proteção Freio de Mão", category: "Acessórios", price: "R$ 12,99", commission: 1.04, sales: 1420, rating: 4.3, image: "/products/capa-freio-mao.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRSJdVPkH6-5cDnw/" },
  { id: 112, name: "Carregador de Bateria Automotivo", category: "Acessórios", price: "R$ 43,99", commission: 5.77, sales: 1350, rating: 4.8, badge: { text: "Hot", type: "hot" }, image: "/products/carregador-bateria.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRSL9FXAhh-30LEQ/" },
  { id: 113, name: "Óculos Realidade Virtual", category: "Acessórios", price: "R$ 35,99", commission: 8, sales: 1280, rating: 4.6, badge: { text: "Tendência", type: "trending" }, image: "/products/oculos-vr.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRS2qdqMMe-f9fRu/" },
  { id: 114, name: "Amolador Portátil", category: "Acessórios", price: "R$ 20,99", commission: 9.5, sales: 1210, rating: 4.5, image: "/products/amolador-portatil.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRS63D7py7-MXAun/" },
  { id: 115, name: "Cadeira Dobrável", category: "Acessórios", price: "R$ 50,40", commission: 15, sales: 1140, rating: 4.4, image: "/products/cadeira-dobravel.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRSDPFGSUb-Xj6hP/" },
  { id: 116, name: "Porta Copos Automotivo", category: "Acessórios", price: "R$ 11,99", commission: 8, sales: 1070, rating: 4.3, image: "/products/porta-copos.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRSfJEr31f-nwgdK/" },
  { id: 117, name: "Seladora a Vácuo", category: "Acessórios", price: "R$ 33,99", commission: 5, sales: 1000, rating: 4.8, badge: { text: "Escalando", type: "scaling" }, image: "/products/seladora-vacuo.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRS5HhMcVd-RpLHF/" },
  // Novos produtos adicionados
  { id: 118, name: "Rolo Massageador Facial Com Gelo", category: "Beleza", price: "R$ 21,27", commission: 2.54, sales: 0, rating: 4.8, badge: { text: "Tendência", type: "trending" }, image: "/products/rolo-massageador-facial.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRAPosy3un-bjkTv/" },
  { id: 119, name: "Escova de Dentes Elétrica Branqueador IPX7", category: "Beleza", price: "R$ 30,99", commission: 2.48, sales: 0, rating: 4.7, badge: { text: "Hot", type: "hot" }, image: "/products/escova-dentes-eletrica.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRAwSr2jHw-NPqyL/" },
  { id: 120, name: "Irrigador Oral Water Flosser Recarregável", category: "Beleza", price: "R$ 71,91", commission: 9.99, sales: 0, rating: 4.9, badge: { text: "Escalando", type: "scaling" }, image: "/products/irrigador-oral.webp", affiliateLink: "https://vt.tiktok.com/ZSHKRDhqLTacf-cLz5m/" },
];

const categories = ["Mais Vendidos", "Casa", "Moda", "Eletrônicos", "Acessórios", "Beleza", "Livros", "Suplementos"];

const badgeStyles = {
  hot: "bg-tiktok-pink/20 text-tiktok-pink",
  scaling: "bg-tiktok-green/20 text-tiktok-green",
  trending: "bg-tiktok-cyan/20 text-tiktok-cyan",
};

const badgeIcons = {
  hot: <Flame className="w-3 h-3" />,
  scaling: <Rocket className="w-3 h-3" />,
  trending: <BarChart3 className="w-3 h-3" />,
};

const ProductCard = ({ product, onClick }: { product: Product; onClick: () => void }) => (
  <div className="glass-card card-gradient-border p-4 hover-glow group transition-all duration-300 hover:scale-[1.02] cursor-pointer relative overflow-hidden" onClick={onClick}>
    {/* Subtle accent glow on hover */}
    <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-tiktok-cyan/0 group-hover:bg-tiktok-cyan/5 blur-2xl transition-all duration-500" />
    <div className="relative mb-3">
      <div className="w-full h-44 rounded-xl bg-muted overflow-hidden">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-muted-foreground">📦</div>
        )}
      </div>
      {product.badge && (
        <span className={cn("absolute top-2 right-2 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 backdrop-blur-sm", badgeStyles[product.badge.type])}>
          {badgeIcons[product.badge.type]} {product.badge.text}
        </span>
      )}
    </div>
    
    <h3 className="font-semibold mb-1 line-clamp-1 relative">{product.name}</h3>
    <p className="text-sm text-muted-foreground mb-3 relative">{product.category}</p>
    
    <div className="flex items-center gap-2 mb-3 relative">
      <Star className="w-4 h-4 text-tiktok-yellow fill-tiktok-yellow" />
      <span className="text-sm font-medium">{product.rating}</span>
      <span className="text-muted-foreground text-sm">• {product.sales.toLocaleString()} vendas</span>
    </div>
    
    <div className="pt-3 border-t border-border flex items-center justify-between relative">
      <p className="text-lg font-bold">{product.price}</p>
      <div className="flex items-center gap-1 text-xs font-semibold text-tiktok-green bg-tiktok-green/10 px-2 py-1 rounded-full">
        <Coins className="w-3 h-3" />
        <span>R$ {typeof product.commission === 'number' ? product.commission.toFixed(2).replace('.', ',') : product.commission}</span>
      </div>
    </div>
  </div>
);

const ITEMS_PER_PAGE = 12;

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Mais Vendidos");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial load
  useState(() => {
    setTimeout(() => setIsLoading(false), 400);
  });

  const filteredProducts = useMemo(() => allProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Mais Vendidos" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }), [searchTerm, selectedCategory]);

  const bestSellers = useMemo(() => {
    const sorted = selectedCategory === "Mais Vendidos" 
      ? filteredProducts.slice().sort((a, b) => b.sales - a.sales).slice(0, 20)
      : filteredProducts.slice().sort((a, b) => b.sales - a.sales);
    return sorted;
  }, [filteredProducts, selectedCategory]);

  const visibleProducts = bestSellers.slice(0, visibleCount);
  const hasMore = visibleCount < bestSellers.length;

  // Reset visible count when filters change
  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  return (
    <div className="min-h-screen">
      
      <main className="p-4 md:p-6 lg:p-8 max-w-[1440px] mx-auto">
        {/* ── HERO HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-tiktok-cyan to-tiktok-pink flex items-center justify-center shadow-lg shadow-tiktok-cyan/20">
              <TrendingUp className="w-6 h-6 text-background" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Produtos <span className="gradient-text">Escalados</span>
              </h1>
              <p className="text-sm text-muted-foreground">Encontre os melhores para promover</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-card/50 border border-border/30 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/30 transition-all"
            />
          </div>
        </motion.div>

        {/* ── CATEGORIES ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={cn(
                "px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-300 flex-shrink-0",
                selectedCategory === category
                  ? "bg-gradient-to-r from-tiktok-cyan to-tiktok-pink text-background shadow-lg shadow-tiktok-cyan/15"
                  : "glass-card text-muted-foreground hover:text-foreground"
              )}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Best Sellers Section */}
        <div className="mb-10">
          {selectedCategory === "Mais Vendidos" && (
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-tiktok-pink/20">
                <TrendingUp className="w-5 h-5 text-tiktok-pink" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Mais Vendidos</h2>
                <p className="text-sm text-muted-foreground">Top produtos com maior volume de vendas</p>
              </div>
            </div>
          )}
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                {visibleProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.35), ease: [0.16, 1, 0.3, 1] }}
                    className="relative"
                  >
                    {index < 3 && selectedCategory === "Mais Vendidos" && (
                      <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-gradient-to-br from-tiktok-cyan to-tiktok-pink flex items-center justify-center text-sm font-bold text-background z-10 shadow-lg shadow-tiktok-cyan/20">
                        #{index + 1}
                      </div>
                    )}
                    <ProductCard product={product} onClick={() => setSelectedProduct(product)} />
                  </motion.div>
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center mt-10">
                  <button
                    onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
                    className="px-8 py-3 rounded-2xl glass-card card-gradient-border text-foreground text-sm font-semibold transition-all duration-300 relative overflow-hidden"
                  >
                    Carregar mais produtos
                  </button>
                </div>
              )}
            </>
          )}

          {!isLoading && visibleProducts.length === 0 && (
            <div className="glass-card inner-shine p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 animate-mesh opacity-20" />
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-3xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-7 h-7 text-muted-foreground/40" />
                </div>
                <h3 className="font-semibold text-foreground mb-1.5">Nenhum produto encontrado</h3>
                <p className="text-sm text-muted-foreground">Tente buscar outro termo ou mude a categoria</p>
              </div>
            </div>
          )}
        </div>
      </main>

      <ProductSalesModal
        product={selectedProduct}
        open={!!selectedProduct}
        onOpenChange={(open) => !open && setSelectedProduct(null)}
      />
    </div>
  );
};

export default Products;
