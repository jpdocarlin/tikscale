import { Video, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";

const MotionTransfer = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-md w-full p-10 text-center space-y-6 border-dashed border-2 border-muted-foreground/30">
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Video className="w-8 h-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Motion Transfer</h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="text-lg font-medium">Em breve</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Estamos preparando essa funcionalidade para você. Aguarde novidades!
          </p>
        </div>
      </Card>
    </div>
  );
};

export default MotionTransfer;
