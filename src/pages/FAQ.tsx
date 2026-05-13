import { Footer } from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const FAQ = () => {
  const faqs = [
    {
      category: "Geral",
      questions: [
        {
          question: "O que é a plataforma?",
          answer: "É uma plataforma completa de inteligência para criadores e afiliados do TikTok. Oferecemos ferramentas para análise de produtos virais, espionagem de concorrentes, criação de vídeos com IA e gestão de afiliações."
        },
        {
          question: "Preciso ter conta no TikTok para usar?",
          answer: "Não é obrigatório ter uma conta no TikTok para explorar a plataforma, mas para aproveitar todas as funcionalidades de análise e afiliação, recomendamos vincular sua conta."
        },
        {
          question: "A plataforma funciona em quais países?",
          answer: "Atualmente, estamos focados no mercado brasileiro, mas nossa base de dados inclui produtos e criadores de diversos países onde o TikTok Shop está disponível."
        }
      ]
    },
    {
      category: "Produtos e Análise",
      questions: [
        {
          question: "Como funciona a análise de produtos virais?",
          answer: "Nossa IA monitora milhares de produtos no TikTok Shop em tempo real, identificando tendências de vendas, engajamento e viralização. Você recebe alertas sobre produtos com potencial antes de saturarem o mercado."
        },
        {
          question: "O que significa o badge 'Hot' nos produtos?",
          answer: "O badge 'Hot' indica produtos que estão performando acima da média em vendas e engajamento nas últimas 24-48 horas. São produtos com alta probabilidade de viralização."
        },
        {
          question: "Com que frequência os dados são atualizados?",
          answer: "Nossos dados são atualizados em tempo real para métricas de engajamento, e a cada hora para dados de vendas e ranking de produtos."
        }
      ]
    },
    {
      category: "Afiliação",
      questions: [
        {
          question: "Como funciona o programa de afiliação?",
          answer: "Você pode se afiliar diretamente aos produtos através da plataforma. Receba comissões de 5% a 30% por cada venda gerada através dos seus links ou vídeos promocionais."
        },
        {
          question: "Quando recebo minhas comissões?",
          answer: "As comissões são processadas após o período de confirmação do pedido (geralmente 7 dias) e podem ser sacadas quando atingirem o valor mínimo de R$50."
        },
        {
          question: "Posso me afiliar a quantos produtos quiser?",
          answer: "Sim! Não há limite de produtos para afiliação. Recomendamos focar em nichos específicos para construir autoridade e aumentar suas conversões."
        }
      ]
    },
    {
      category: "Espionagem e Concorrência",
      questions: [
        {
          question: "O que é a função 'Espionar'?",
          answer: "A função Espionar permite analisar estratégias de criadores de sucesso, incluindo produtos promovidos, frequência de postagem, formatos de vídeo que mais convertem e crescimento de seguidores."
        },
        {
          question: "É legal espionar concorrentes?",
          answer: "Sim! Todas as informações analisadas são públicas e disponíveis no TikTok. A plataforma apenas organiza e apresenta esses dados de forma inteligente para sua análise."
        }
      ]
    },
    {
      category: "Vídeos com IA",
      questions: [
        {
          question: "Como funciona a criação de vídeos com IA?",
          answer: "Nossa IA gera scripts otimizados para conversão, sugere hooks de abertura, e pode criar legendas e thumbnails automaticamente baseados nas tendências do momento."
        },
        {
          question: "Os vídeos são gerados automaticamente?",
          answer: "Atualmente, a IA auxilia na criação de roteiros e elementos visuais. A gravação ainda é feita por você, garantindo autenticidade e conexão com sua audiência."
        },
        {
          question: "Quantos vídeos posso criar por mês?",
          answer: "O limite depende do seu plano. Usuários do plano Pro podem criar até 50 scripts e 100 thumbnails por mês."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 py-8 md:py-12 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-tiktok-cyan to-tiktok-pink mb-4">
              <HelpCircle className="w-8 h-8 text-background" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Perguntas Frequentes
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Encontre respostas para as dúvidas mais comuns sobre a plataforma
            </p>
          </div>

          {/* FAQ Sections */}
          <div className="space-y-8">
            {faqs.map((section, sectionIndex) => (
              <div key={sectionIndex} className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gradient-to-r from-tiktok-cyan to-tiktok-pink"></span>
                  {section.category}
                </h2>
                <Accordion type="single" collapsible className="space-y-2">
                  {section.questions.map((faq, faqIndex) => (
                    <AccordionItem 
                      key={faqIndex} 
                      value={`${sectionIndex}-${faqIndex}`}
                      className="border border-border rounded-xl px-4 data-[state=open]:bg-muted/30"
                    >
                      <AccordionTrigger className="text-left text-foreground hover:no-underline py-4">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-4">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-12 text-center bg-gradient-to-r from-tiktok-cyan/10 to-tiktok-pink/10 border border-border rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Ainda tem dúvidas?
            </h3>
            <p className="text-muted-foreground mb-4">
              Nossa equipe está pronta para ajudar você
            </p>
            <a 
              href="mailto:suporte@plataforma.com"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-tiktok-cyan to-tiktok-pink text-background font-semibold hover:opacity-90 transition-opacity"
            >
              Falar com Suporte
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;
