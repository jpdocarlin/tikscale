import { Component, ReactNode } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";

const isChunkLoadError = (error: Error | null) => {
  const msg = error?.message ?? "";
  // Common browser/Vite messages
  return (
    msg.includes("Failed to fetch dynamically imported module") ||
    msg.includes("Importing a module script failed") ||
    msg.includes("ChunkLoadError") ||
    msg.includes("Loading chunk")
  );
};

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);

    // Persist minimal diagnostics for production debugging
    try {
      const payload = {
        at: new Date().toISOString(),
        message: error?.message ?? "",
        stack: error?.stack ?? "",
        componentStack: errorInfo?.componentStack ?? "",
      };
      sessionStorage.setItem("__last_app_error__", JSON.stringify(payload));
    } catch {
      // ignore
    }

    // Auto-recover from stale-cache chunk errors after publish
    // (prevents users from being stuck on the error screen).
    if (isChunkLoadError(error)) {
      const key = "__chunk_load_reloaded__";
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        window.location.reload();
      }
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      let persisted: { at?: string; message?: string; stack?: string; componentStack?: string } | null = null;
      try {
        const raw = sessionStorage.getItem("__last_app_error__");
        persisted = raw ? JSON.parse(raw) : null;
      } catch {
        persisted = null;
      }

      const errorMessage = this.state.error?.message || persisted?.message;

      const handleCopy = async () => {
        const text = [
          `when: ${persisted?.at ?? ""}`,
          `message: ${errorMessage ?? ""}`,
          persisted?.stack ? `stack: ${persisted.stack}` : "",
          persisted?.componentStack ? `componentStack: ${persisted.componentStack}` : "",
        ]
          .filter(Boolean)
          .join("\n\n");

        try {
          await navigator.clipboard.writeText(text);
        } catch {
          // Fallback
          const ta = document.createElement("textarea");
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
        }
      };

      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-6">
          <div className="max-w-md text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-xl font-bold">Algo deu errado</h1>
              <p className="text-muted-foreground text-sm">
                Ocorreu um erro inesperado. Tente recarregar a página.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReload}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-tiktok-cyan to-tiktok-pink text-background font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                <RefreshCw className="w-4 h-4" />
                Recarregar página
              </button>
              
              <button
                onClick={this.handleReset}
                className="w-full px-4 py-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
              >
                Tentar novamente
              </button>

              {errorMessage && (
                <button
                  onClick={handleCopy}
                  className="w-full px-4 py-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                >
                  Copiar detalhes do erro
                </button>
              )}
            </div>

            {errorMessage && (
              <details className="mt-4 text-left">
                <summary className="text-sm text-muted-foreground cursor-pointer">
                  Detalhes técnicos
                </summary>
                <pre className="mt-2 p-3 bg-muted rounded text-xs text-destructive overflow-auto max-h-40">
                  {errorMessage}
                  {"\n"}
                  {persisted?.stack || this.state.error?.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;