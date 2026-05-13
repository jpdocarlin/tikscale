import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Target, Users, Zap } from "lucide-react";

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      
      <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1200px] mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-tiktok-cyan to-tiktok-pink flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-background" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Sobre Nós</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A plataforma completa para afiliados do TikTok Shop. Encontre produtos, 
            analise tendências e maximize suas comissões.
          </p>
        </div>

        {/* Mission Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-tiktok-cyan/20 flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-tiktok-cyan" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nossa Missão</h3>
              <p className="text-sm text-muted-foreground">
                Empoderar afiliados com ferramentas inteligentes para maximizar resultados no TikTok Shop.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-tiktok-pink/20 flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-tiktok-pink" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nossa Comunidade</h3>
              <p className="text-sm text-muted-foreground">
                Milhares de afiliados confiam em nós para encontrar os melhores produtos e estratégias.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-tiktok-green/20 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-tiktok-green" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nossa Tecnologia</h3>
              <p className="text-sm text-muted-foreground">
                IA avançada e análise de dados em tempo real para decisões mais inteligentes.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Description */}
        <Card className="border-border/50 bg-card/50 mb-12">
          <CardContent className="p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-4">O que fazemos</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Nascemos da necessidade de simplificar e otimizar o trabalho dos afiliados 
                no TikTok Shop. Sabemos que encontrar os produtos certos, analisar tendências e 
                criar conteúdo que converte pode ser desafiador.
              </p>
              <p>
                Nossa plataforma oferece ferramentas poderosas como análise de produtos virais, 
                espionagem de criadores de sucesso, geração de scripts com IA e muito mais. 
                Tudo pensado para você focar no que realmente importa: criar conteúdo e vender.
              </p>
              <p>
                Você tem acesso a dados em tempo real, insights de mercado e 
                ferramentas de automação que vão transformar sua jornada como afiliado.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Entre em contato</h2>
          <p className="text-muted-foreground">
            Tem dúvidas ou sugestões? Fale conosco pelo email{" "}
            <a href="mailto:contato@plataforma.com" className="text-primary hover:underline">
              contato@plataforma.com
            </a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AboutUs;