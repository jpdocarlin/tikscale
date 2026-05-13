import { useState } from "react";
import { FileText, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";

interface Template {
  id: string;
  title: string;
  category: string;
  caption: string;
  hashtags: string;
}

const templates: Template[] = [
  {
    id: "1",
    title: "Revelação de Produto",
    category: "Geral",
    caption: `🔥 Gente, achei o produto que vai MUDAR sua vida!

Tava precisando muito disso e olha só o resultado 😍

Corre no link da bio porque tá com desconto!

#tiktokmademebuyit #achados #produtosvirais`,
    hashtags: "#tiktokmademebuyit #achados #produtosvirais #tiktokshop #comprinhas",
  },
  {
    id: "2",
    title: "Antes e Depois",
    category: "Beleza",
    caption: `ANTES vs DEPOIS usando esse produto 🤯

Não acreditei quando vi o resultado!

Quem mais precisa disso? Comenta aqui 👇

Link na bio ✨`,
    hashtags: "#antesedepois #transformacao #beleza #skincare #rotina",
  },
  {
    id: "3",
    title: "Urgência/Escassez",
    category: "Promoção",
    caption: `⚠️ CORRE QUE TÁ ACABANDO!

Esse produto tá com 50% OFF só hoje!

Eu já garanti o meu, e vocês?

Link na bio antes que acabe! 🏃‍♀️`,
    hashtags: "#promocao #oferta #desconto #corridinha #tiktokshop",
  },
  {
    id: "4",
    title: "Unboxing",
    category: "Geral",
    caption: `📦 Chegou minha encomenda do TikTok Shop!

Vem abrir comigo e ver se valeu a pena 👀

Spoiler: VALEU MUITO! 

Link na bio pra comprar ✨`,
    hashtags: "#unboxing #chegou #tiktokshop #compras #haul",
  },
  {
    id: "5",
    title: "Dica/Tutorial",
    category: "Educativo",
    caption: `💡 DICA que ninguém te conta!

Aprendi isso e mudou tudo pra mim

Salva esse vídeo pra não esquecer! 📌

Produto no link da bio`,
    hashtags: "#dica #tutorial #aprenda #hack #truque",
  },
  {
    id: "6",
    title: "Suplementos",
    category: "Saúde",
    caption: `💪 Vocês pediram e eu conto TUDO!

Esse suplemento que uso todo dia 

Resultados em 30 dias 📈

Garanta o seu no link da bio!`,
    hashtags: "#suplementos #saude #bemestar #fitness #rotina",
  },
  {
    id: "7",
    title: "Casa/Decoração",
    category: "Casa",
    caption: `🏠 Achado INCRÍVEL pra sua casa!

Custou menos de R$50 e olha a diferença

Comentem se querem mais dicas assim 👇

Link na bio ✨`,
    hashtags: "#casa #decoracao #achados #organizacao #diy",
  },
  {
    id: "8",
    title: "Moda/Look",
    category: "Moda",
    caption: `👗 LOOK do dia com peça do TikTok Shop!

Qualidade SURREAL por esse preço

Disponível em várias cores 🎨

Corre no link da bio!`,
    hashtags: "#look #moda #outfit #fashion #style",
  },
];

const TemplateCard = ({ template }: { template: Template }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedHashtags, setCopiedHashtags] = useState(false);

  const copyCaption = () => {
    navigator.clipboard.writeText(template.caption);
    setCopiedCaption(true);
    toast.success("Legenda copiada!");
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  const copyHashtags = () => {
    navigator.clipboard.writeText(template.hashtags);
    setCopiedHashtags(true);
    toast.success("Hashtags copiadas!");
    setTimeout(() => setCopiedHashtags(false), 2000);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(`${template.caption}\n\n${template.hashtags}`);
    toast.success("Tudo copiado!");
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Beleza":
        return "bg-pink-500/20 text-pink-400 border-pink-500/30";
      case "Promoção":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "Educativo":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "Saúde":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Casa":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Moda":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-tiktok-green/20 text-tiktok-green border-tiktok-green/30";
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg bg-card/50 border border-border/50 hover:border-tiktok-green/30 transition-all overflow-hidden">
        <CollapsibleTrigger asChild>
          <button className="w-full p-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-tiktok-green" />
              <span className="font-medium text-sm">{template.title}</span>
              <Badge variant="outline" className={`text-[10px] ${getCategoryColor(template.category)}`}>
                {template.category}
              </Badge>
            </div>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-3 pb-3 space-y-3">
            {/* Caption */}
            <div className="relative">
              <div className="p-3 rounded-lg bg-muted/30 text-sm whitespace-pre-line">
                {template.caption}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-7 text-xs"
                onClick={copyCaption}
              >
                {copiedCaption ? (
                  <>
                    <Check className="h-3 w-3 mr-1 text-tiktok-green" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    Copiar
                  </>
                )}
              </Button>
            </div>

            {/* Hashtags */}
            <div className="relative">
              <div className="p-3 rounded-lg bg-tiktok-green/10 text-sm text-tiktok-green">
                {template.hashtags}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-7 text-xs"
                onClick={copyHashtags}
              >
                {copiedHashtags ? (
                  <>
                    <Check className="h-3 w-3 mr-1 text-tiktok-green" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    Copiar
                  </>
                )}
              </Button>
            </div>

            {/* Copy All */}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={copyAll}
            >
              <Copy className="h-3 w-3 mr-2" />
              Copiar Legenda + Hashtags
            </Button>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export const CaptionTemplates = () => {
  const [filter, setFilter] = useState<string>("all");

  const categories = ["all", ...new Set(templates.map((t) => t.category))];
  
  const filteredTemplates = filter === "all" 
    ? templates 
    : templates.filter((t) => t.category === filter);

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5 text-tiktok-green" />
          Templates de Legendas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map((category) => (
            <Button
              key={category}
              variant={filter === category ? "default" : "outline"}
              size="sm"
              className={`text-xs ${filter === category ? "bg-tiktok-green text-black" : ""}`}
              onClick={() => setFilter(category)}
            >
              {category === "all" ? "Todos" : category}
            </Button>
          ))}
        </div>

        {/* Templates List */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {filteredTemplates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
