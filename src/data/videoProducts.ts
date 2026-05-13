export interface VideoProduct {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  fires: number;
}

// Helper to create public path
const p = (filename: string) => `/products/${filename}`;

export const videoProducts: VideoProduct[] = [
  // Hot/Mais Vendidos
  { id: 95, name: "9D Dentes Branco 14 Tiras", price: 31.99, image: p("9d-dentes-brancos.webp"), category: "Beleza", fires: 52 },
  { id: 96, name: "Relógio Digital Espelhado LED Mesa", price: 27.99, image: p("relogio-digital-led.webp"), category: "Eletrônicos", fires: 48 },
  { id: 97, name: "ENSSU Aparador Corporal Masculino USB", price: 94.00, image: p("enssu-aparador.webp"), category: "Beleza", fires: 45 },
  { id: 98, name: "Espelho Maquiagem Inteligente LED", price: 15.89, image: p("espelho-maquiagem-led.webp"), category: "Beleza", fires: 43 },
  { id: 99, name: "Fórmula X - Cabelo e Barba", price: 77.60, image: p("formula-x-barba.webp"), category: "Suplementos", fires: 50 },
  { id: 100, name: "Luminária Projetor Astronauta Galaxy", price: 37.06, image: p("luminaria-astronauta.webp"), category: "Casa", fires: 47 },
  { id: 101, name: "Creatina Gummy + Vinagre Maçã Gummy", price: 104.30, image: p("creatina-gummy.webp"), category: "Suplementos", fires: 41 },
  { id: 102, name: "Reload 300gr Suplemento em Pó", price: 104.00, image: p("reload-suplemento.webp"), category: "Suplementos", fires: 39 },
  { id: 103, name: "Luminária Lua 3D LED Abajur", price: 35.99, image: p("luminaria-lua-3d.webp"), category: "Casa", fires: 46 },
  
  // Produtos originais
  { id: 1, name: "Luz Pisca Pisca Natal", price: 12.40, image: p("luz-pisca-pisca.webp"), category: "Casa", fires: 55 },
  { id: 2, name: "Pro3 Magnésio", price: 23.93, image: p("pro3-magnesio.webp"), category: "Suplementos", fires: 44 },
  { id: 3, name: "Bolsa Reforçada Notebook Impermeável", price: 29.50, image: p("bolsa-notebook.webp"), category: "Acessórios", fires: 38 },
  { id: 4, name: "TWS Fone Bluetooth", price: 19.38, image: p("tws-fone.webp"), category: "Eletrônicos", fires: 42 },
  { id: 6, name: "Kit 2 Calças Leggings", price: 33.10, image: p("kit-leggings.webp"), category: "Moda", fires: 36 },
  { id: 7, name: "FitS36 Suplemento", price: 29.64, image: p("fits36.webp"), category: "Suplementos", fires: 33 },
  { id: 8, name: "Necessaire Organizador", price: 13.90, image: p("necessaire.webp"), category: "Acessórios", fires: 28 },
  { id: 9, name: "Kit Lençol 400 Fios 3 Peças", price: 23.90, image: p("kit-lencol.webp"), category: "Casa", fires: 31 },
  { id: 10, name: "Repelente Eletrônico", price: 27.99, image: p("repelente.webp"), category: "Casa", fires: 26 },
  { id: 12, name: "365 Amor com Deus", price: 24.32, image: p("365-amor-deus.webp"), category: "Livros", fires: 40 },
  { id: 13, name: "Relógio de Pulso Digital", price: 18.39, image: p("relogio-digital.webp"), category: "Eletrônicos", fires: 29 },
  { id: 14, name: "Perfume Attracione Men", price: 83.50, image: p("perfume-attracione.webp"), category: "Beleza", fires: 37 },
  { id: 15, name: "Kit 2 Top Sutiã", price: 29.16, image: p("kit-top-sutia.webp"), category: "Moda", fires: 27 },
  { id: 16, name: "Short Cinta Modeladora", price: 24.99, image: p("short-cinta.webp"), category: "Moda", fires: 49 },
  { id: 17, name: "Escova de Dente Elétrica", price: 13.99, image: p("escova-eletrica.webp"), category: "Beleza", fires: 25 },
  { id: 18, name: "Bermudas 3 Dry Fit De Alto Padrão", price: 35.64, image: p("bermudas-dryfit.webp"), category: "Moda", fires: 24 },
  { id: 19, name: "Boné Aba Curva Premium", price: 23.68, image: p("bone-aba-curva.webp"), category: "Moda", fires: 22 },
  { id: 20, name: "Cinta Modeladora De Alta Compressão", price: 25.34, image: p("cinta-modeladora.webp"), category: "Moda", fires: 30 },
  { id: 21, name: "Kit 3 Calças Sarjas Masculina", price: 39.99, image: p("kit-calcas-sarja.webp"), category: "Moda", fires: 21 },
  { id: 22, name: "Camisa Polimiada Masculina", price: 44.99, image: p("camisa-polimiada.webp"), category: "Moda", fires: 20 },
  { id: 23, name: "Camisa Polo Dryfit", price: 29.99, image: p("camisa-polo-dryfit.webp"), category: "Moda", fires: 23 },
  { id: 24, name: "Kit 3 Bermudas (Linho) Masculina", price: 39.00, image: p("kit-bermudas-linho.webp"), category: "Moda", fires: 19 },
  { id: 25, name: "Jaqueta Corta Vento Impermeável", price: 23.64, image: p("jaqueta-corta-vento.webp"), category: "Moda", fires: 32 },
  { id: 26, name: "Kit 3 Calças Jeans Feminina", price: 35.99, image: p("kit-calcas-jeans.webp"), category: "Moda", fires: 28 },
  { id: 27, name: "Camisa Social Gola Padre Masculina", price: 30.39, image: p("camisa-gola-padre.webp"), category: "Moda", fires: 18 },
  { id: 28, name: "Camiseta Masculina Canelada Gola Alta", price: 35.00, image: p("camiseta-gola-alta.webp"), category: "Moda", fires: 17 },
  { id: 29, name: "Moletom Casaco Masculino", price: 32.38, image: p("moletom-casaco.webp"), category: "Moda", fires: 26 },
  
  // Casa
  { id: 30, name: "Puff Redondo Luxo", price: 53.23, image: p("puff-redondo.webp"), category: "Casa", fires: 25 },
  { id: 31, name: "Capa Colchão Impermeável Com Elastico", price: 25.44, image: p("capa-colchao.webp"), category: "Casa", fires: 22 },
  { id: 32, name: "Copo Térmico Inteligente", price: 24.89, image: p("copo-termico.webp"), category: "Acessórios", fires: 35 },
  { id: 33, name: "Guarda Chuva Automatico", price: 26.39, image: p("guarda-chuva.webp"), category: "Acessórios", fires: 20 },
  { id: 34, name: "Sapateira Vertical Inox", price: 40.89, image: p("sapateira-vertical.webp"), category: "Casa", fires: 24 },
  { id: 35, name: "Jogo De Panelas Antiaderente 9 Peças", price: 115.46, image: p("jogo-panelas.webp"), category: "Casa", fires: 29 },
  { id: 36, name: "Cortina Blackout", price: 49.99, image: p("cortina-blackout.webp"), category: "Casa", fires: 21 },
  { id: 37, name: "Extensão 5 Tomadas Elétricas", price: 24.79, image: p("extensao-tomadas.webp"), category: "Casa", fires: 19 },
  { id: 38, name: "Tapete Jogo De Banheiro 3 Peças", price: 29.52, image: p("tapete-banheiro.webp"), category: "Casa", fires: 18 },
  { id: 39, name: "Kit 5 Lençol Queen", price: 47.99, image: p("kit-lencol-queen.webp"), category: "Casa", fires: 23 },
  
  // Livros
  { id: 40, name: "Combo Estratégia Kit 3 Livros", price: 29.64, image: p("combo-estrategia-livros.webp"), category: "Livros", fires: 27 },
  { id: 41, name: "Livro A Metamorfose", price: 19.90, image: p("livro-metamorfose.webp"), category: "Livros", fires: 22 },
  { id: 42, name: "Oi Deus, Sou eu De Novo", price: 62.91, image: p("oi-deus-sou-eu.webp"), category: "Livros", fires: 25 },
  { id: 43, name: "3D Adesivos De Microcenas", price: 13.82, image: p("adesivos-3d-microcenas.webp"), category: "Livros", fires: 19 },
  { id: 44, name: "A Arte Da Guerra", price: 19.40, image: p("arte-da-guerra.webp"), category: "Livros", fires: 30 },
  { id: 45, name: "Livro Interativo Com Som", price: 63.20, image: p("livro-interativo-som.webp"), category: "Livros", fires: 21 },
  { id: 46, name: "A Psicologia Financeira", price: 35.77, image: p("psicologia-financeira.webp"), category: "Livros", fires: 33 },
  { id: 47, name: "Mais Esperto Que o Diabo", price: 35.73, image: p("mais-esperto-que-diabo.webp"), category: "Livros", fires: 28 },
  { id: 48, name: "Caderno Planner De Controle Financeiro", price: 44.91, image: p("caderno-planner-financeiro.webp"), category: "Livros", fires: 20 },
  { id: 49, name: "Poesias que Escrevi enquanto aprendia viver", price: 47.92, image: p("poesias-aprendia-viver.webp"), category: "Livros", fires: 18 },
  
  // Suplementos
  { id: 50, name: "Mounjax", price: 142.00, image: p("mounjax.webp"), category: "Suplementos", fires: 48 },
  { id: 51, name: "Moringa + Maca Negra", price: 25.50, image: p("moringa-maca-negra.webp"), category: "Suplementos", fires: 42 },
  { id: 52, name: "Dimpless + Morosil", price: 35.20, image: p("dimpless-morosil.webp"), category: "Suplementos", fires: 38 },
  { id: 53, name: "Testo", price: 40.75, image: p("testo.webp"), category: "Suplementos", fires: 35 },
  { id: 54, name: "Suplemento Alimentar", price: 70.72, image: p("suplemento-alimentar.webp"), category: "Suplementos", fires: 32 },
  { id: 55, name: "Kit 2 Colageno Hidrolisado", price: 33.35, image: p("colageno-hidrolisado.webp"), category: "Suplementos", fires: 29 },
  { id: 56, name: "Capsulas de Arginina", price: 32.00, image: p("capsulas-arginina.webp"), category: "Suplementos", fires: 26 },
  { id: 57, name: "Kit 500g Creatina + 500g Taurina", price: 58.41, image: p("creatina-taurina.webp"), category: "Suplementos", fires: 34 },
  { id: 58, name: "Whey Protein Isolado 900g", price: 110.93, image: p("whey-protein.webp"), category: "Suplementos", fires: 40 },
  { id: 59, name: "Maca Peruana", price: 23.93, image: p("maca-peruana.webp"), category: "Suplementos", fires: 30 },
  { id: 60, name: "Vitamina B12", price: 31.99, image: p("vitamina-b12.webp"), category: "Suplementos", fires: 25 },
  { id: 61, name: "Kit Melatonina 5 Unidades", price: 25.49, image: p("kit-melatonina.webp"), category: "Suplementos", fires: 22 },
  { id: 62, name: "Dr Good Melatonina Gummy", price: 32.99, image: p("drgood-melatonina.webp"), category: "Suplementos", fires: 27 },
  
  // Eletrônicos
  { id: 63, name: "Carregador de Carro Retrátil", price: 41.69, image: p("carregador-carro.webp"), category: "Eletrônicos", fires: 33 },
  { id: 64, name: "Carregador Portátil", price: 23.99, image: p("carregador-portatil.webp"), category: "Eletrônicos", fires: 28 },
  { id: 65, name: "Aspirador de Pó 2 em 1", price: 30.00, image: p("aspirador-po.webp"), category: "Eletrônicos", fires: 25 },
  { id: 66, name: "Camera Digital 1080Hp", price: 63.49, image: p("camera-digital.webp"), category: "Eletrônicos", fires: 30 },
  { id: 67, name: "Visor Solar Do Carro", price: 35.99, image: p("visor-solar-carro.webp"), category: "Eletrônicos", fires: 22 },
  { id: 68, name: "Aromatizador Solar de Carro", price: 27.99, image: p("aromatizador-carro.webp"), category: "Eletrônicos", fires: 24 },
  { id: 69, name: "Console Portátil", price: 140.09, image: p("console-portatil.webp"), category: "Eletrônicos", fires: 38 },
  { id: 70, name: "Fone de Ouvido Bluetooth", price: 18.38, image: p("fone-bluetooth.webp"), category: "Eletrônicos", fires: 35 },
  { id: 71, name: "Relogio Smartwatch", price: 54.49, image: p("smartwatch.webp"), category: "Eletrônicos", fires: 42 },
  { id: 72, name: "Webcam Câmera Full Hd", price: 36.98, image: p("webcam-fullhd.webp"), category: "Eletrônicos", fires: 27 },
  { id: 73, name: "Controle Joystick", price: 27.23, image: p("controle-joystick.webp"), category: "Eletrônicos", fires: 29 },
  { id: 74, name: "Projetor 4K", price: 159.99, image: p("projetor-4k.webp"), category: "Eletrônicos", fires: 45 },
  { id: 75, name: "Monitor Gamer 24''", price: 964.88, image: p("monitor-gamer.webp"), category: "Eletrônicos", fires: 36 },
  { id: 76, name: "Suporte Articulado", price: 81.92, image: p("suporte-articulado.webp"), category: "Eletrônicos", fires: 23 },
  { id: 77, name: "Kit Cartão MicroSd", price: 21.59, image: p("kit-microsd.webp"), category: "Eletrônicos", fires: 21 },
  { id: 78, name: "Massageador Facial", price: 29.69, image: p("massageador-facial.webp"), category: "Eletrônicos", fires: 31 },
  
  // Beleza
  { id: 79, name: "Rolo Facial De Gelo", price: 26.91, image: p("rolo-facial-gelo.webp"), category: "Beleza", fires: 34 },
  { id: 80, name: "Kit 240 Adesivos Secador de Espinhas", price: 6.49, image: p("adesivos-espinhas.webp"), category: "Beleza", fires: 28 },
  { id: 81, name: "Escova Secadora", price: 26.69, image: p("escova-secadora.webp"), category: "Beleza", fires: 44 },
  { id: 82, name: "Kit 13 Peças Pinceis De Maquiagem", price: 10.00, image: p("pinceis-maquiagem.webp"), category: "Beleza", fires: 25 },
  { id: 83, name: "Serum Clareador", price: 74.90, image: p("serum-clareador.webp"), category: "Beleza", fires: 39 },
  { id: 84, name: "Hidratante Calming Cream", price: 31.27, image: p("hidratante-calming.webp"), category: "Beleza", fires: 27 },
  { id: 85, name: "Máscara Modeladora Facial", price: 15.99, image: p("mascara-modeladora.webp"), category: "Beleza", fires: 23 },
  { id: 86, name: "Tonico de Acido Salicilico", price: 48.28, image: p("tonico-salicilico.webp"), category: "Beleza", fires: 26 },
  { id: 87, name: "Kit Lola Cosmeticos Hidratação", price: 138.51, image: p("kit-lola-hidratacao.webp"), category: "Beleza", fires: 35 },
  { id: 88, name: "Depilador Indolor", price: 12.99, image: p("depilador-indolor.webp"), category: "Beleza", fires: 29 },
  { id: 89, name: "Esfoliante Com Acido Hialurônico", price: 16.99, image: p("esfoliante-hialuronico.webp"), category: "Beleza", fires: 24 },
  { id: 90, name: "Kit 20 Peças Esponjas de Beleza", price: 27.99, image: p("kit-esponjas-beleza.webp"), category: "Beleza", fires: 22 },
  { id: 91, name: "Pinça Profissional De Sobrancelhas", price: 4.65, image: p("pinca-sobrancelhas.webp"), category: "Beleza", fires: 19 },
  { id: 92, name: "Mascara Matizadora", price: 47.61, image: p("mascara-matizadora.webp"), category: "Beleza", fires: 26 },
  { id: 93, name: "Mascara Facial", price: 170.05, image: p("mascara-facial.webp"), category: "Beleza", fires: 30 },
  { id: 94, name: "Mascara para Cilios", price: 56.69, image: p("mascara-cilios.webp"), category: "Beleza", fires: 33 },
  
  // Acessórios
  { id: 104, name: "Organizador de Cosméticos", price: 27.53, image: p("organizador-cosmeticos.webp"), category: "Acessórios", fires: 40 },
  { id: 105, name: "Inflador Elétrico Digital", price: 140.39, image: p("inflador-eletrico.webp"), category: "Acessórios", fires: 36 },
  { id: 106, name: "Massageador de Pescoço", price: 25.50, image: p("massageador-pescoco.webp"), category: "Acessórios", fires: 45 },
  { id: 107, name: "Afiador Profissional", price: 15.60, image: p("afiador-profissional.webp"), category: "Acessórios", fires: 32 },
  { id: 108, name: "Revitalizador de Plástico", price: 24.00, image: p("revitalizador-plastico.webp"), category: "Acessórios", fires: 25 },
  { id: 109, name: "Ponteira Universal", price: 26.90, image: p("ponteira-universal.webp"), category: "Acessórios", fires: 22 },
  { id: 110, name: "Kit Alto Falante Bomber", price: 47.70, image: p("kit-alto-falante.webp"), category: "Acessórios", fires: 29 },
  { id: 111, name: "Capa Proteção Freio de Mão", price: 12.99, image: p("capa-freio-mao.webp"), category: "Acessórios", fires: 18 },
  { id: 112, name: "Carregador de Bateria Automotivo", price: 43.99, image: p("carregador-bateria.webp"), category: "Acessórios", fires: 35 },
  { id: 113, name: "Óculos Realidade Virtual", price: 35.99, image: p("oculos-vr.webp"), category: "Acessórios", fires: 38 },
  { id: 114, name: "Amolador Portátil", price: 20.99, image: p("amolador-portatil.webp"), category: "Acessórios", fires: 24 },
  { id: 115, name: "Cadeira Dobrável", price: 50.40, image: p("cadeira-dobravel.webp"), category: "Acessórios", fires: 21 },
  { id: 116, name: "Porta Copos Automotivo", price: 11.99, image: p("porta-copos.webp"), category: "Acessórios", fires: 19 },
  { id: 117, name: "Seladora a Vácuo", price: 33.99, image: p("seladora-vacuo.webp"), category: "Acessórios", fires: 31 },
  
  // Novos produtos
  { id: 118, name: "Rolo Massageador Facial Com Gelo", price: 21.27, image: p("rolo-massageador-facial.webp"), category: "Beleza", fires: 37 },
  { id: 119, name: "Escova de Dentes Elétrica Branqueador IPX7", price: 30.99, image: p("escova-dentes-eletrica.webp"), category: "Beleza", fires: 41 },
  { id: 120, name: "Irrigador Oral Water Flosser Recarregável", price: 71.91, image: p("irrigador-oral.webp"), category: "Beleza", fires: 43 },
  { id: 121, name: "Vestido Feminino Longo Com Decote", price: 34.99, image: p("vestido-feminino.webp"), category: "Moda", fires: 35 },
  { id: 122, name: "Cropped Coração Multiformas", price: 32.21, image: p("cropped-coracao.webp"), category: "Moda", fires: 38 },
  { id: 123, name: "Vestido Tubinho Babado Lateral Suplex", price: 124.90, image: p("vestido-tubinho.webp"), category: "Moda", fires: 42 },
  { id: 124, name: "Camisola Bailarina Decote Nas Costas", price: 31.99, image: p("camisola-bailarina.webp"), category: "Moda", fires: 44 },
  { id: 125, name: "Macaquinho Feminino Fitness Alcinha", price: 33.56, image: p("macaquinho-fitness.webp"), category: "Moda", fires: 40 },
  // Vestidos Femininos / Evangélicos
  { id: 126, name: "Vestido Longo Elegante Manga Duna Linho Evangélica", price: 69.94, image: p("vestido-longo-elegante-azul.png"), category: "Moda", fires: 46 },
  { id: 127, name: "Vestido Feminino Midi Rodado Evangélico Manga Bufante", price: 48.90, image: p("vestido-feminino-evangelico-marrom.png"), category: "Moda", fires: 48 },
  { id: 128, name: "Vestido Midi Evangélico Listrado com Botões", price: 80.99, image: p("vestido-midi-evangelico-listrado.png"), category: "Moda", fires: 39 },
  { id: 129, name: "Vestido Longo Lastex Manga Curta Blogueira Viral", price: 51.98, image: p("vestido-longo-lastex-laranja.png"), category: "Moda", fires: 45 },
  { id: 130, name: "Vestido Longo Feminino Moda Evangélica", price: 75.00, image: p("vestido-longo-feminino-evangelica.png"), category: "Moda", fires: 47 },
  { id: 131, name: "Vestido Midi Evangélico com Manga Princesa", price: 75.00, image: p("vestido-midi-evangelico-princesa.png"), category: "Moda", fires: 43 },
  { id: 132, name: "Vestido Longo Listrado com Botões e Cinto", price: 67.55, image: p("vestido-longo-listrado-amarelo.png"), category: "Moda", fires: 41 },
];

// Sort by fires (popularity) descending
export const sortedProducts = [...videoProducts].sort((a, b) => b.fires - a.fires);

export const productCategories = ["Todos", "Beleza", "Suplementos", "Eletrônicos", "Casa", "Moda", "Acessórios", "Livros"];
