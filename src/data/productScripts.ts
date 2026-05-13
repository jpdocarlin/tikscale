// Scripts prontos para cada produto - 3 estilos diferentes (otimizados para vídeos de 30 segundos)
export interface ProductScript {
  productId: number;
  productName: string;
  category: string;
  scripts: {
    style: string;
    title: string;
    script: string;
  }[];
}

// Função para gerar scripts baseados no nome e categoria do produto (~500-600 caracteres para 30s de vídeo)
const generateScriptsForProduct = (id: number, name: string, category: string): ProductScript => {
  const scripts: Record<string, { style: string; title: string; script: string }[]> = {
    "Beleza": [
      {
        style: "Testemunho Pessoal",
        title: "Minha Transformação",
        script: `Gente, PARA TUDO! Eu tava desesperada, já tinha gastado uma fortuna em produtos que não funcionavam. Aí descobri esse ${name} e na primeira semana já vi diferença! Olha essa transformação - sem filtro, sem edição. Nunca me senti tão bem comigo mesma. O preço é acessível e vale cada centavo. Se você tá passando pelo que eu passei, dá uma chance. Link na bio!`
      },
      {
        style: "Dica de Amiga",
        title: "Segredo Entre Amigas",
        script: `Amiga, vem cá que eu preciso te contar um segredo! Sabe aquele produto que realmente funciona e não pesa no bolso? Achei! É o ${name}. Eu sei que você já tentou de tudo e tá cansada de se frustrar. Mas esse é diferente, funciona rápido e entrega o que promete. Uso todo dia e não largo mais! Confia em mim, link tá na bio!`
      },
      {
        style: "Descoberta Viral",
        title: "Produto Viral",
        script: `POV: Você entendeu porque TODO MUNDO tá falando desse ${name}! Vi umas 50 vezes no For You antes de comprar. Na primeira aplicação já senti diferença, em uma semana os resultados eram visíveis. Funciona rápido, custo-benefício absurdo, rende muito. Se você tá na dúvida: COMPRA. Sério! Link na bio, corre que sempre esgota!`
      }
    ],
    "Suplementos": [
      {
        style: "Testemunho Pessoal",
        title: "Mudou Minha Energia",
        script: `Preciso ser sincera: eu vivia EXAUSTA. Acordava cansada, dormia cansada. Comecei a tomar ${name} e na segunda semana acordei me sentindo DIFERENTE. Energia, disposição, vontade de fazer as coisas. Hoje sou outra pessoa - treino melhor, trabalho melhor, até meu humor mudou. Não é milagre, é ciência. Link na bio!`
      },
      {
        style: "Dica de Amiga",
        title: "Conselho de Quem Testou",
        script: `Se você anda sem energia, se arrastando pro dia a dia, eu te entendo! Descobri o ${name} e testei por 30 dias. A diferença foi ABSURDA - energia aumentou, treinos melhoraram, sono mais regulado. A fórmula é limpa, preço honesto e funciona de verdade. Se você quer aquele up na rotina, testa! Link na bio.`
      },
      {
        style: "Descoberta Viral",
        title: "Suplemento Viral",
        script: `Esse ${name} tá dominando o TikTok! Viralizou porque a galera fitness começou a postar resultados REAIS. Tomei por 4 semanas: energia aumentou, treinos mais intensos, recuperação melhor. Não espere milagre do dia pra noite, mas os resultados são reais. Link na bio, aproveita que ainda tem estoque!`
      }
    ],
    "Eletrônicos": [
      {
        style: "Testemunho Pessoal",
        title: "Melhor Compra do Ano",
        script: `Gente, essa foi a MELHOR compra que eu fiz esse ano! Tô falando do ${name}. Tinha medo de comprar online, mas quando chegou fiquei impressionada com a qualidade. Funciona PERFEITAMENTE, vale cada centavo. Já indiquei pra toda minha família. Se você tá pensando em comprar, para de pensar e compra! Link na bio!`
      },
      {
        style: "Dica de Amiga",
        title: "Dica Tech",
        script: `Vem cá que eu tenho uma dica de tech que vai facilitar MUITO sua vida! Tô falando do ${name}. Descobri por acaso e agora uso todo dia. A qualidade é surpreendente pelo preço, super fácil de usar e durável. Se você tava procurando algo assim, confia em mim! Link na bio, depois me conta se gostou!`
      },
      {
        style: "Descoberta Viral",
        title: "Tech Viral",
        script: `Esse ${name} tá VIRAL no TikTok e eu testei pra vocês! Por que viralizou? Custo-benefício ABSURDO. Qualidade excelente, funciona como prometido, design moderno. Comprei, chegou rápido, bem embalado. Testei tudo: PERFEITO! Se você tá na dúvida, pode ir sem medo. Link na bio, corre que viralizado esgota rápido!`
      }
    ],
    "Casa": [
      {
        style: "Testemunho Pessoal",
        title: "Transformou Minha Casa",
        script: `Vocês não têm NOÇÃO de como esse ${name} transformou minha casa! Eu vivia lutando com organização, testei várias soluções e nada funcionava. Esse produto foi um divisor de águas - preço acessível, chegou rápido e funciona PERFEITAMENTE. Recebo visita e todo mundo pergunta onde comprei. Link na bio!`
      },
      {
        style: "Dica de Amiga",
        title: "Dica de Organização",
        script: `Amiga, se você AMA uma casa organizada mas vive na luta, eu tenho A dica! Esse ${name} mudou minha vida. Super prático, deixa tudo mais organizado, design bonito e preço muito bom. Gostei tanto que comprei mais! Se você tá renovando ou quer organizar melhor, vale muito a pena. Link na bio!`
      },
      {
        style: "Descoberta Viral",
        title: "Item Casa Viral",
        script: `Esse ${name} tá BOMBANDO no TikTok e eu entendi por quê! Resolve um problema super comum de um jeito inteligente e por um preço que cabe no bolso. Comprei, chegou rápido, qualidade me surpreendeu. Minha casa ficou muito mais organizada e bonita. Vale MUITO a pena! Link na bio, corre!`
      }
    ],
    "Moda": [
      {
        style: "Testemunho Pessoal",
        title: "Peça Favorita",
        script: `Gente, achei A peça que virou minha favorita do guarda-roupa! Esse ${name} é PERFEITO. O caimento é incrível, o tecido é de qualidade, a cor é igual da foto. Já usei várias vezes, já lavei e continua impecável. Combina com tudo! Já quero em outras cores. Link na bio, você vai amar!`
      },
      {
        style: "Dica de Amiga",
        title: "Dica de Estilo",
        script: `Amiga, para tudo! Achei aquela peça curinga que combina com TUDO e veste super bem: ${name}. O caimento é incrível, tecido de qualidade, versátil demais. Já usei com calça, saia, de dia, de noite. Minhas amigas todas perguntaram onde comprei! Link na bio, vai conferir!`
      },
      {
        style: "Descoberta Viral",
        title: "Moda Viral",
        script: `Esse ${name} tá VIRAL e testei pra vocês! Por que viralizou? Preço bom, veste bem em vários corpos e qualidade surpreende. Experimentei e entendi o hype na hora. Caimento lindo, tecido bom, não transparece. Qualidade 10, custo-benefício 10. Vale o hype COM CERTEZA! Link na bio!`
      }
    ],
    "Livros": [
      {
        style: "Testemunho Pessoal",
        title: "Livro Transformador",
        script: `Preciso falar sobre esse livro que MUDOU minha perspectiva: ${name}. Cada capítulo trazia uma reflexão nova. Marquei várias páginas, grifei várias frases. Quando terminei, fiquei com aquela sensação de "uau". Já dei de presente pra minha família e elas amaram! Se você busca uma leitura transformadora, esse é O livro. Link na bio!`
      },
      {
        style: "Dica de Amiga",
        title: "Indicação de Leitura",
        script: `Tenho uma indicação IMPERDÍVEL pra você: ${name}. É o tipo de livro que te prende do começo ao fim, te faz pensar e te emociona. A escrita é envolvente, a história é cativante, e te deixa reflexivo. Terminei e quis indicar pra todo mundo! Presenteia alguém ou você mesmo. Link na bio!`
      },
      {
        style: "Descoberta Viral",
        title: "Livro Viral",
        script: `Esse ${name} tá em todo For You do BookTok e resolvi conferir. O hype é REAL! A escrita é envolvente, a história te pega de surpresa. Li em poucos dias porque não conseguia parar. Se você gosta de leitura que marca, esse aqui é certeiro. Vale cada página. Link na bio!`
      }
    ],
    "Acessórios": [
      {
        style: "Testemunho Pessoal",
        title: "Achado Perfeito",
        script: `Gente, achei o acessório PERFEITO! Esse ${name} é exatamente o que eu precisava. A qualidade é surpreendente pelo preço, funciona perfeitamente e é super prático. Uso todo dia e já não vivo sem! Se você tava procurando algo assim, pode ir sem medo. Link na bio!`
      },
      {
        style: "Dica de Amiga",
        title: "Dica Prática",
        script: `Vem cá que eu tenho uma dica que vai facilitar MUITO sua vida! Tô falando do ${name}. Descobri por indicação e agora virou essencial pra mim. Qualidade ótima, super prático e vale cada centavo. Minhas amigas todas já compraram! Confia em mim, link na bio!`
      },
      {
        style: "Descoberta Viral",
        title: "Acessório Viral",
        script: `Esse ${name} tá viral e eu testei pra vocês! Por que viralizou? Qualidade excelente, custo-benefício absurdo e realmente funciona. Comprei, testei e aprovei! Se você tá na dúvida, pode ir sem medo que vale a pena. Link na bio, corre que viralizado esgota!`
      }
    ]
  };

  // Default scripts para categorias não mapeadas
  const defaultScripts = [
    {
      style: "Testemunho Pessoal",
      title: "Minha Experiência",
      script: `Gente, preciso contar sobre esse ${name}! Eu pesquisei muito antes de comprar e foi a melhor decisão. A qualidade é excelente, funciona perfeitamente e o preço é justo. Já indiquei pra todo mundo e todos amaram! Se você tá pensando em comprar, vai sem medo. Link na bio!`
    },
    {
      style: "Dica de Amiga",
      title: "Dica Que Você Precisa",
      script: `Vem cá que eu preciso te mostrar esse ${name}! Descobri por indicação e agora virou essencial pra mim. A qualidade surpreende, é super prático e vale cada centavo. Minhas amigas todas já compraram porque não paro de indicar. Confia em mim, link na bio!`
    },
    {
      style: "Descoberta Viral",
      title: "Produto Viral",
      script: `Esse ${name} tá viral e eu testei pra vocês! Por que viralizou? Qualidade excelente, custo-benefício absurdo e realmente funciona. Comprei, testei e aprovei! Se você tá na dúvida, pode ir sem medo que vale a pena. Link na bio, corre que viralizado esgota!`
    }
  ];

  return {
    productId: id,
    productName: name,
    category: category,
    scripts: scripts[category] || defaultScripts
  };
};

// Lista de produtos com scripts - IDs correspondem aos IDs em videoProducts.ts
export const productScripts: ProductScript[] = [
  // Beleza (IDs reais de videoProducts)
  generateScriptsForProduct(93, "Máscara Facial", "Beleza"),
  generateScriptsForProduct(83, "Sérum Clareador", "Beleza"),
  generateScriptsForProduct(78, "Massageador Facial", "Beleza"),
  generateScriptsForProduct(81, "Escova Secadora", "Beleza"),
  generateScriptsForProduct(82, "Kit Pincéis de Maquiagem", "Beleza"),
  generateScriptsForProduct(98, "Espelho Maquiagem LED", "Beleza"),
  generateScriptsForProduct(88, "Depilador Indolor", "Beleza"),
  generateScriptsForProduct(118, "Rolo Massageador Facial", "Beleza"),
  generateScriptsForProduct(86, "Tônico Ácido Salicílico", "Beleza"),
  generateScriptsForProduct(94, "Máscara de Cílios", "Beleza"),
  generateScriptsForProduct(17, "Escova de Dente Elétrica", "Beleza"),
  generateScriptsForProduct(90, "Kit Esponjas de Maquiagem", "Beleza"),
  generateScriptsForProduct(84, "Hidratante Calming", "Beleza"),
  generateScriptsForProduct(89, "Esfoliante com Ácido Hialurônico", "Beleza"),
  generateScriptsForProduct(91, "Pinça Sobrancelha Profissional", "Beleza"),
  generateScriptsForProduct(79, "Rolo de Gelo Facial", "Beleza"),
  generateScriptsForProduct(104, "Organizador de Cosméticos", "Beleza"),
  generateScriptsForProduct(8, "Nécessaire Organizador", "Beleza"),
  generateScriptsForProduct(95, "9D Dentes Brancos 14 Tiras", "Beleza"),
  generateScriptsForProduct(80, "Adesivos para Espinhas", "Beleza"),
  generateScriptsForProduct(97, "ENSSU Aparador Corporal", "Beleza"),
  generateScriptsForProduct(14, "Perfume Attracione Men", "Beleza"),
  generateScriptsForProduct(87, "Kit Lola Cosméticos", "Beleza"),
  generateScriptsForProduct(92, "Máscara Matizadora", "Beleza"),
  generateScriptsForProduct(85, "Máscara Modeladora Facial", "Beleza"),
  generateScriptsForProduct(119, "Escova de Dentes Elétrica IPX7", "Beleza"),
  generateScriptsForProduct(120, "Irrigador Oral Water Flosser", "Beleza"),
  
  // Suplementos (IDs reais de videoProducts)
  generateScriptsForProduct(58, "Whey Protein Isolado", "Suplementos"),
  generateScriptsForProduct(57, "Creatina + Taurina", "Suplementos"),
  generateScriptsForProduct(55, "Colágeno Hidrolisado", "Suplementos"),
  generateScriptsForProduct(60, "Vitamina B12", "Suplementos"),
  generateScriptsForProduct(61, "Kit Melatonina 5mg", "Suplementos"),
  generateScriptsForProduct(59, "Maca Peruana", "Suplementos"),
  generateScriptsForProduct(101, "Creatina Gummy", "Suplementos"),
  generateScriptsForProduct(2, "Pro3 Magnésio", "Suplementos"),
  generateScriptsForProduct(56, "Cápsulas de Arginina", "Suplementos"),
  generateScriptsForProduct(102, "Reload Suplemento", "Suplementos"),
  generateScriptsForProduct(52, "Dimpless + Morosil", "Suplementos"),
  generateScriptsForProduct(62, "Dr.Good Melatonina", "Suplementos"),
  generateScriptsForProduct(51, "Moringa + Maca Negra", "Suplementos"),
  generateScriptsForProduct(99, "Fórmula X Barba", "Suplementos"),
  generateScriptsForProduct(50, "Mounjax", "Suplementos"),
  generateScriptsForProduct(53, "Testo", "Suplementos"),
  generateScriptsForProduct(7, "FitS36 Suplemento", "Suplementos"),
  generateScriptsForProduct(54, "Suplemento Alimentar", "Suplementos"),
  
  // Eletrônicos (IDs reais de videoProducts)
  generateScriptsForProduct(4, "TWS Fone Bluetooth", "Eletrônicos"),
  generateScriptsForProduct(71, "Smartwatch", "Eletrônicos"),
  generateScriptsForProduct(69, "Console Portátil", "Eletrônicos"),
  generateScriptsForProduct(64, "Carregador Portátil", "Eletrônicos"),
  generateScriptsForProduct(74, "Projetor 4K", "Eletrônicos"),
  generateScriptsForProduct(72, "Webcam Full HD", "Eletrônicos"),
  generateScriptsForProduct(75, "Monitor Gamer", "Eletrônicos"),
  generateScriptsForProduct(73, "Controle Joystick", "Eletrônicos"),
  generateScriptsForProduct(113, "Óculos VR", "Eletrônicos"),
  generateScriptsForProduct(110, "Kit Alto Falante", "Eletrônicos"),
  generateScriptsForProduct(66, "Câmera Digital", "Eletrônicos"),
  generateScriptsForProduct(77, "Kit MicroSD", "Eletrônicos"),
  generateScriptsForProduct(63, "Carregador Veicular", "Eletrônicos"),
  generateScriptsForProduct(37, "Extensão Tomadas USB", "Eletrônicos"),
  generateScriptsForProduct(112, "Carregador de Bateria", "Eletrônicos"),
  generateScriptsForProduct(96, "Relógio Digital LED", "Eletrônicos"),
  generateScriptsForProduct(13, "Relógio de Pulso Digital", "Eletrônicos"),
  generateScriptsForProduct(70, "Fone de Ouvido Bluetooth", "Eletrônicos"),
  
  // Casa (IDs reais de videoProducts)
  generateScriptsForProduct(100, "Luminária Astronauta", "Casa"),
  generateScriptsForProduct(32, "Copo Térmico", "Casa"),
  generateScriptsForProduct(117, "Seladora a Vácuo", "Casa"),
  generateScriptsForProduct(35, "Jogo de Panelas Antiaderente", "Casa"),
  generateScriptsForProduct(36, "Cortina Blackout", "Casa"),
  generateScriptsForProduct(39, "Kit Lençol Queen", "Casa"),
  generateScriptsForProduct(65, "Aspirador de Pó Portátil", "Casa"),
  generateScriptsForProduct(76, "Suporte Articulado TV", "Casa"),
  generateScriptsForProduct(38, "Tapete Banheiro", "Casa"),
  generateScriptsForProduct(30, "Puff Redondo", "Casa"),
  generateScriptsForProduct(103, "Luminária Lua 3D", "Casa"),
  generateScriptsForProduct(1, "Luz Pisca Pisca", "Casa"),
  generateScriptsForProduct(34, "Sapateira Vertical", "Casa"),
  generateScriptsForProduct(31, "Capa Colchão Impermeável", "Casa"),
  generateScriptsForProduct(116, "Porta Copos", "Casa"),
  generateScriptsForProduct(105, "Inflador Elétrico", "Casa"),
  generateScriptsForProduct(115, "Cadeira Dobrável", "Casa"),
  generateScriptsForProduct(68, "Aromatizador de Carro", "Casa"),
  generateScriptsForProduct(67, "Visor Solar para Carro", "Casa"),
  generateScriptsForProduct(111, "Capa Freio de Mão", "Casa"),
  generateScriptsForProduct(108, "Revitalizador de Plásticos", "Casa"),
  generateScriptsForProduct(109, "Ponteira Universal", "Casa"),
  generateScriptsForProduct(10, "Repelente Eletrônico", "Casa"),
  generateScriptsForProduct(107, "Afiador Profissional", "Casa"),
  generateScriptsForProduct(114, "Amolador Portátil", "Casa"),
  generateScriptsForProduct(97, "Aparador de Pelos", "Casa"),
  generateScriptsForProduct(106, "Massageador de Pescoço", "Casa"),
  generateScriptsForProduct(9, "Kit Lençol 400 Fios", "Casa"),
  
  // Moda (IDs reais de videoProducts)
  generateScriptsForProduct(24, "Kit Bermudas Linho", "Moda"),
  generateScriptsForProduct(23, "Camisa Polo Dry-Fit", "Moda"),
  generateScriptsForProduct(25, "Jaqueta Corta-Vento", "Moda"),
  generateScriptsForProduct(29, "Moletom Casaco", "Moda"),
  generateScriptsForProduct(19, "Boné Aba Curva Premium", "Moda"),
  generateScriptsForProduct(21, "Kit Calças Sarja", "Moda"),
  generateScriptsForProduct(18, "Bermudas Dry-Fit", "Moda"),
  generateScriptsForProduct(27, "Camisa Gola Padre", "Moda"),
  generateScriptsForProduct(28, "Camiseta Gola Alta", "Moda"),
  generateScriptsForProduct(22, "Camisa Poliamida", "Moda"),
  generateScriptsForProduct(26, "Kit Calças Jeans", "Moda"),
  generateScriptsForProduct(3, "Bolsa Notebook", "Moda"),
  generateScriptsForProduct(33, "Guarda-Chuva Automático", "Moda"),
  generateScriptsForProduct(20, "Cinta Modeladora", "Moda"),
  generateScriptsForProduct(16, "Short Cinta Modelador", "Moda"),
  generateScriptsForProduct(6, "Kit Leggings", "Moda"),
  generateScriptsForProduct(15, "Kit Top Sutia", "Moda"),
  
  // Livros (IDs reais de videoProducts)
  generateScriptsForProduct(46, "Psicologia Financeira", "Livros"),
  generateScriptsForProduct(44, "A Arte da Guerra", "Livros"),
  generateScriptsForProduct(47, "Mais Esperto que o Diabo", "Livros"),
  generateScriptsForProduct(40, "Combo Estratégia 3 Livros", "Livros"),
  generateScriptsForProduct(41, "Metamorfose - Kafka", "Livros"),
  generateScriptsForProduct(42, "Oi Deus, Sou Eu de Novo", "Livros"),
  generateScriptsForProduct(12, "365 Dias com Amor de Deus", "Livros"),
  generateScriptsForProduct(49, "Poesias Que Aprendi a Viver", "Livros"),
  generateScriptsForProduct(48, "Caderno Planner Financeiro", "Livros"),
  generateScriptsForProduct(45, "Livro Interativo com Som", "Livros"),
  generateScriptsForProduct(43, "Adesivos 3D Microcenas", "Livros"),
];
