import { Footer } from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const TermsOfUse = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      
      <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-4xl mx-auto w-full">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Termos de Uso</h1>
          <p className="text-muted-foreground">Última atualização: Dezembro de 2024</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-6">
          <section className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">1. Aceitação dos Termos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Ao acessar e utilizar a plataforma, você concorda em cumprir e estar vinculado a estes Termos de Uso. 
              Se você não concordar com qualquer parte destes termos, não poderá acessar ou usar nossos serviços.
            </p>
          </section>

          <section className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">2. Descrição do Serviço</h2>
            <p className="text-muted-foreground leading-relaxed">
              Esta é uma plataforma de análise e gestão para afiliados do TikTok Shop. Nossos serviços incluem:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-3 space-y-2">
              <li>Análise de produtos e tendências</li>
              <li>Monitoramento de creators e influenciadores</li>
              <li>Ferramentas de gestão de afiliação</li>
              <li>Relatórios de vendas e comissões</li>
              <li>Recursos de inteligência artificial para criação de conteúdo</li>
            </ul>
          </section>

          <section className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">3. Cadastro e Conta</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para utilizar nossos serviços, você deve criar uma conta fornecendo informações precisas e completas. 
              Você é responsável por manter a confidencialidade de suas credenciais de acesso e por todas as atividades 
              realizadas em sua conta.
            </p>
          </section>

          <section className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">4. Uso Aceitável</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Ao usar a plataforma, você concorda em não:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Violar leis ou regulamentos aplicáveis</li>
              <li>Compartilhar credenciais de acesso com terceiros</li>
              <li>Tentar acessar sistemas ou dados não autorizados</li>
              <li>Usar a plataforma para fins fraudulentos ou enganosos</li>
              <li>Reproduzir, duplicar ou revender nossos serviços sem autorização</li>
            </ul>
          </section>

          <section className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">5. Pagamentos e Assinaturas</h2>
            <p className="text-muted-foreground leading-relaxed">
              Alguns recursos da plataforma podem exigir pagamento. Os preços e condições de pagamento serão informados 
              antes da contratação. As assinaturas são renovadas automaticamente, salvo cancelamento prévio. 
              Reembolsos serão avaliados caso a caso conforme nossa política de reembolso.
            </p>
          </section>

          <section className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">6. Propriedade Intelectual</h2>
            <p className="text-muted-foreground leading-relaxed">
              Todo o conteúdo, design, código e funcionalidades da plataforma são de propriedade exclusiva da empresa 
              e protegidos por leis de propriedade intelectual. Você não pode copiar, modificar ou distribuir 
              qualquer parte da plataforma sem autorização expressa.
            </p>
          </section>

          <section className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">7. Limitação de Responsabilidade</h2>
            <p className="text-muted-foreground leading-relaxed">
              A plataforma é fornecida "como está" e não garantimos resultados específicos de vendas ou comissões. 
              Não nos responsabilizamos por perdas financeiras decorrentes do uso da plataforma ou de decisões 
              comerciais baseadas em nossas análises.
            </p>
          </section>

          <section className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">8. Modificações dos Termos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Reservamos o direito de modificar estes Termos de Uso a qualquer momento. Alterações significativas 
              serão comunicadas por e-mail ou através da plataforma. O uso continuado após as alterações constitui 
              aceitação dos novos termos.
            </p>
          </section>

          <section className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">9. Contato</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para dúvidas sobre estes Termos de Uso, entre em contato conosco através do e-mail: 
              <a href="mailto:suporte@plataforma.com" className="text-tiktok-cyan hover:underline ml-1">
                suporte@plataforma.com
              </a>
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfUse;
