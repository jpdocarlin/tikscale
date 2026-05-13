import { Footer } from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      
      <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-4xl mx-auto w-full">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Política de Privacidade</h1>
          <p className="text-muted-foreground">Última atualização: Dezembro de 2024</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-6">
          <section className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">1. Introdução</h2>
            <p className="text-muted-foreground leading-relaxed">
              Valorizamos a privacidade de nossos usuários. Esta Política de Privacidade descreve como 
              coletamos, usamos, armazenamos e protegemos suas informações pessoais quando você utiliza nossa plataforma.
            </p>
          </section>

          <section className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">2. Informações que Coletamos</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Podemos coletar os seguintes tipos de informações:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong className="text-foreground">Dados de cadastro:</strong> nome, e-mail, telefone e informações de perfil</li>
              <li><strong className="text-foreground">Dados de uso:</strong> páginas acessadas, recursos utilizados e tempo de navegação</li>
              <li><strong className="text-foreground">Dados de pagamento:</strong> informações necessárias para processamento de transações</li>
              <li><strong className="text-foreground">Dados técnicos:</strong> endereço IP, tipo de navegador e dispositivo utilizado</li>
              <li><strong className="text-foreground">Dados de integração:</strong> informações da sua conta TikTok Shop quando autorizado</li>
            </ul>
          </section>

          <section className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">3. Como Usamos suas Informações</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Utilizamos suas informações para:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Fornecer e manter nossos serviços</li>
              <li>Personalizar sua experiência na plataforma</li>
              <li>Processar pagamentos e gerenciar assinaturas</li>
              <li>Enviar comunicações importantes sobre o serviço</li>
              <li>Melhorar nossos produtos e desenvolver novos recursos</li>
              <li>Prevenir fraudes e garantir a segurança da plataforma</li>
            </ul>
          </section>

          <section className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">4. Compartilhamento de Dados</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Não vendemos suas informações pessoais. Podemos compartilhar dados apenas com:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong className="text-foreground">Prestadores de serviço:</strong> empresas que nos auxiliam na operação da plataforma</li>
              <li><strong className="text-foreground">Parceiros de pagamento:</strong> para processamento seguro de transações</li>
              <li><strong className="text-foreground">Autoridades legais:</strong> quando exigido por lei ou ordem judicial</li>
            </ul>
          </section>

          <section className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">5. Segurança dos Dados</h2>
            <p className="text-muted-foreground leading-relaxed">
              Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações, incluindo:
              criptografia de dados em trânsito e em repouso, controles de acesso restritos, monitoramento contínuo 
              de segurança e backups regulares. No entanto, nenhum sistema é 100% seguro, e não podemos garantir 
              segurança absoluta.
            </p>
          </section>

          <section className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">6. Seus Direitos (LGPD)</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Conforme a Lei Geral de Proteção de Dados (LGPD), você tem direito a:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir dados incompletos ou desatualizados</li>
              <li>Solicitar a exclusão de seus dados</li>
              <li>Revogar consentimentos previamente concedidos</li>
              <li>Solicitar a portabilidade de seus dados</li>
              <li>Obter informações sobre o compartilhamento de dados</li>
            </ul>
          </section>

          <section className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">7. Cookies e Tecnologias de Rastreamento</h2>
            <p className="text-muted-foreground leading-relaxed">
              Utilizamos cookies e tecnologias similares para melhorar sua experiência, lembrar preferências e 
              analisar o uso da plataforma. Você pode gerenciar suas preferências de cookies através das 
              configurações do seu navegador.
            </p>
          </section>

          <section className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">8. Retenção de Dados</h2>
            <p className="text-muted-foreground leading-relaxed">
              Mantemos suas informações pelo tempo necessário para fornecer nossos serviços e cumprir obrigações 
              legais. Após o encerramento da conta, seus dados serão excluídos ou anonimizados, exceto quando a 
              retenção for exigida por lei.
            </p>
          </section>

          <section className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">9. Alterações nesta Política</h2>
            <p className="text-muted-foreground leading-relaxed">
              Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos sobre alterações 
              significativas por e-mail ou através de aviso na plataforma. Recomendamos revisar esta página 
              regularmente.
            </p>
          </section>

          <section className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">10. Contato do Encarregado (DPO)</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para exercer seus direitos ou esclarecer dúvidas sobre privacidade, entre em contato com nosso 
              Encarregado de Proteção de Dados:
              <br /><br />
              <strong className="text-foreground">E-mail:</strong>{" "}
              <a href="mailto:privacidade@plataforma.com" className="text-tiktok-cyan hover:underline">
                privacidade@plataforma.com
              </a>
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
