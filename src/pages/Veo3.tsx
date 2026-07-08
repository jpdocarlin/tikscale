import { Video } from "lucide-react";
import { Card } from "@/components/ui/card";

const Veo3 = () => {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-4 py-8 pb-24">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-tiktok-cyan to-tiktok-pink flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8 text-background" />
          </div>
          <h1 className="text-3xl font-bold mb-3">
            <span translate="no">Veo 3</span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Acesso administrativo exclusivo.
          </p>
        </div>

        <Card className="p-8 bg-card/30 border-border/30 text-center">
          <h2 className="text-xl font-semibold mb-4">Em construção</h2>
          <p className="text-muted-foreground">
            A integração com o Veo 3 está sendo desenvolvida e estará disponível em breve.
          </p>
        </Card>
      </main>
    </div>
  );
};

export default Veo3;
