import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import WhatsAppButton from "./components/WhatsAppButton";
import { SidebarLayout } from "./components/SidebarLayout";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Products = lazy(() => import("./pages/Products"));
const Scripts = lazy(() => import("./pages/Scripts"));

const CreatorProfile = lazy(() => import("./pages/CreatorProfile"));
const Affiliation = lazy(() => import("./pages/Affiliation"));

const EditProfile = lazy(() => import("./pages/EditProfile"));
const TermsOfUse = lazy(() => import("./pages/TermsOfUse"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const FAQ = lazy(() => import("./pages/FAQ"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const InfluencerIA = lazy(() => import("./pages/InfluencerIA"));
const VideoAvatar = lazy(() => import("./pages/VideoAvatar"));
const GerarImagem = lazy(() => import("./pages/GerarImagem"));
const GerarVideo = lazy(() => import("./pages/GerarVideo"));
const Criativos = lazy(() => import("./pages/Criativos"));
const CriarPersona = lazy(() => import("./pages/CriarPersona"));
const MotionTransfer = lazy(() => import("./pages/MotionTransfer"));
const EditorVideo = lazy(() => import("./pages/EditorVideo"));
const TemplatesVideo = lazy(() => import("./pages/TemplatesVideo"));
const Creditos = lazy(() => import("./pages/Creditos"));
const Crescimento = lazy(() => import("./pages/Crescimento"));
const PromptsReais = lazy(() => import("./pages/PromptsReais"));


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-3">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
    <p className="text-sm text-muted-foreground"><span>Carregando...</span></p>
  </div>
);

// Wrapper that adds sidebar layout to protected pages
const WithSidebar = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <SidebarLayout>{children}</SidebarLayout>
  </ProtectedRoute>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* Prevent Google Translate from breaking React reconciliation */}
        <div className="notranslate" translate="no">
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <WhatsAppButton />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public routes - no sidebar */}
                <Route path="/auth" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/influencer" element={<InfluencerIA />} />
                <Route path="/termos-de-uso" element={<TermsOfUse />} />
                <Route path="/politica-de-privacidade" element={<PrivacyPolicy />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/sobre-nos" element={<AboutUs />} />

                {/* Protected routes - with sidebar */}
                <Route path="/" element={<WithSidebar><Index /></WithSidebar>} />
                <Route path="/products" element={<WithSidebar><Products /></WithSidebar>} />
                <Route path="/criativos" element={<WithSidebar><Criativos /></WithSidebar>} />
                <Route path="/scripts" element={<WithSidebar><Scripts /></WithSidebar>} />
                <Route path="/affiliation" element={<WithSidebar><Affiliation /></WithSidebar>} />
                <Route path="/video-avatar" element={<WithSidebar><VideoAvatar /></WithSidebar>} />
                <Route path="/gerar-imagem" element={<WithSidebar><GerarImagem /></WithSidebar>} />
                <Route path="/criar-persona" element={<WithSidebar><CriarPersona /></WithSidebar>} />
                <Route path="/gerar-video" element={<WithSidebar><GerarVideo /></WithSidebar>} />
                <Route path="/editor-video" element={<WithSidebar><EditorVideo /></WithSidebar>} />
                <Route path="/motion-transfer" element={<WithSidebar><MotionTransfer /></WithSidebar>} />
                <Route path="/templates-video" element={<WithSidebar><TemplatesVideo /></WithSidebar>} />
                <Route path="/prompts-reais" element={<WithSidebar><PromptsReais /></WithSidebar>} />
                
                <Route path="/creditos" element={<WithSidebar><Creditos /></WithSidebar>} />
                <Route path="/crescimento" element={<WithSidebar><Crescimento /></WithSidebar>} />
                <Route path="/creator/:id" element={<WithSidebar><CreatorProfile /></WithSidebar>} />
                <Route path="/profile/edit" element={<WithSidebar><EditProfile /></WithSidebar>} />

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
