
import React, { useState, useEffect, useCallback } from 'react';
import { findTrendingProducts, generateAdVideo } from './services/geminiService';
import { TrendingProduct, VideoStatus, GenerationStep } from './types';
import ProductCard from './components/ProductCard';

const App: React.FC = () => {
  const [step, setStep] = useState<GenerationStep>(GenerationStep.IDLE);
  const [products, setProducts] = useState<TrendingProduct[]>([]);
  const [videoStatuses, setVideoStatuses] = useState<Record<string, VideoStatus>>({});
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    try {
      const hasKey = await (window as any).aistudio?.hasSelectedApiKey();
      setHasApiKey(!!hasKey);
    } catch (e) {
      console.error("API Key check failed", e);
    }
  };

  const handleSelectKey = async () => {
    try {
      await (window as any).aistudio?.openSelectKey();
      // Assume success and proceed to app as per guidelines
      setHasApiKey(true);
      setError(null);
    } catch (e) {
      console.error("Key selection failed", e);
    }
  };

  const discoverProducts = async () => {
    setError(null);
    setStep(GenerationStep.SEARCHING);
    try {
      const trending = await findTrendingProducts();
      setProducts(trending);
      
      const initialStatuses: Record<string, VideoStatus> = {};
      trending.forEach(p => {
        initialStatuses[p.id] = { productId: p.id, status: 'idle', progress: 0 };
      });
      setVideoStatuses(initialStatuses);
      setStep(GenerationStep.PRODUCTS_FOUND);
    } catch (err: any) {
      console.error("Search failed", err);
      setError("Failed to fetch trending products. Please ensure your API key is correctly configured.");
      setStep(GenerationStep.IDLE);
    }
  };

  const generateProductAd = useCallback(async (product: TrendingProduct) => {
    setVideoStatuses(prev => ({
      ...prev,
      [product.id]: { ...prev[product.id], status: 'generating', progress: 5, error: undefined }
    }));

    try {
      const videoUrl = await generateAdVideo(product, (progress) => {
        setVideoStatuses(prev => ({
          ...prev,
          [product.id]: { ...prev[product.id], progress }
        }));
      });

      setVideoStatuses(prev => ({
        ...prev,
        [product.id]: { ...prev[product.id], status: 'completed', progress: 100, videoUrl }
      }));
    } catch (err: any) {
      console.error(`Ad generation for ${product.id} failed`, err);
      
      let errorMessage = err.message || "Unknown error occurred";
      let isPermissionError = false;

      // Check if the error is due to permission (usually non-paid project for Veo)
      if (errorMessage.includes("PERMISSION_DENIED") || 
          errorMessage.includes("403") || 
          errorMessage.includes("permission") ||
          errorMessage.includes("The caller does not have permission") ||
          errorMessage.includes("Requested entity was not found")) {
        isPermissionError = true;
        errorMessage = "Permission Denied: Veo generation requires an API key from a PAID Google Cloud project (billing enabled).";
      }

      if (isPermissionError) {
        setHasApiKey(false); // Reset to allow user to click "Connect Paid Key" again
      }

      setVideoStatuses(prev => ({
        ...prev,
        [product.id]: { 
          ...prev[product.id], 
          status: 'error', 
          error: errorMessage 
        }
      }));
    }
  }, []);

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f172a]/80 backdrop-blur-md border-b border-white/5 py-4 px-6 mb-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#ff0050] to-[#00f2ea] rounded-xl flex items-center justify-center shadow-lg">
              <i className="fab fa-tiktok text-white text-xl"></i>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Trend<span className="gradient-text">Vision</span>
            </h1>
          </div>
          
          <div className="flex gap-4 items-center">
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white text-xs flex items-center gap-1 transition-colors bg-white/5 px-3 py-1.5 rounded-full"
            >
              <i className="fas fa-info-circle text-[10px]"></i> Billing Requirements
            </a>
            {!hasApiKey ? (
              <button 
                onClick={handleSelectKey}
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2 animate-pulse shadow-lg shadow-yellow-500/20"
              >
                <i className="fas fa-key"></i> Connect Paid Key
              </button>
            ) : (
              <button 
                onClick={handleSelectKey}
                className="text-slate-400 hover:text-white text-xs border border-white/10 px-3 py-1.5 rounded-full transition-all"
              >
                Change Key
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6">
        {/* Intro Section */}
        {step === GenerationStep.IDLE && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-700">
            <div className="mb-8">
              <h2 className="text-4xl md:text-6xl font-extrabold mb-4">
                Scale Your TikTok Ads <br />
                <span className="gradient-text">With AI Intelligence</span>
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                Discover viral trends and generate cinematic 9:16 video ads. 
                <span className="block mt-4 text-sm text-yellow-500/90 font-medium">
                  <i className="fas fa-exclamation-triangle mr-2"></i> 
                  Requires a paid Google Cloud project key with billing enabled for Veo models.
                </span>
              </p>
            </div>
            
            <button
              disabled={!hasApiKey}
              onClick={discoverProducts}
              className={`group relative px-8 py-4 bg-white text-black font-black rounded-full text-xl shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all flex items-center gap-3
                ${!hasApiKey ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:scale-105 active:scale-95'}`}
            >
              {!hasApiKey ? (
                <span>Connect Paid Key to Start</span>
              ) : (
                <>
                  Find Current Trends <i className="fas fa-search group-hover:animate-pulse"></i>
                </>
              )}
            </button>
            
            {error && (
              <div className="mt-8 p-4 bg-red-900/20 border border-red-500/30 rounded-xl max-w-md animate-in fade-in zoom-in mx-auto">
                <p className="text-red-400 font-medium">{error}</p>
                <button onClick={handleSelectKey} className="mt-2 text-xs underline text-red-300">Select another key</button>
              </div>
            )}
          </div>
        )}

        {/* Loading Trends */}
        {step === GenerationStep.SEARCHING && (
          <div className="flex flex-col items-center justify-center py-32 space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="fab fa-tiktok text-3xl animate-bounce"></i>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">Analyzing TikTok Ecosystem...</h3>
              <p className="text-slate-500">Retrieving viral data from Google Search Grounding</p>
            </div>
          </div>
        )}

        {/* Results Grid */}
        {step === GenerationStep.PRODUCTS_FOUND && (
          <div className="space-y-12 animate-in slide-in-from-bottom-10 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
              <div>
                <span className="text-cyan-400 text-sm font-bold uppercase tracking-widest">Live Analysis</span>
                <h2 className="text-4xl font-black mt-2">TikTok Trend Board</h2>
                <p className="text-slate-400 mt-2">Top 8 viral items discovered in real-time. Hit "Generate" to create a cinematic ad.</p>
              </div>
              <button 
                onClick={discoverProducts}
                className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors border border-white/10 px-4 py-2 rounded-lg hover:bg-white/5"
              >
                <i className="fas fa-sync"></i> Refresh Trends
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  status={videoStatuses[product.id]}
                  onGenerate={() => generateProductAd(product)}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Persistent CTA / Footer */}
      <footer className="fixed bottom-0 left-0 right-0 py-4 px-6 bg-slate-950/90 backdrop-blur-md border-t border-white/5 text-center">
        <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-medium">
          Powered by Gemini 3 Flash & Veo 3.1 • Professional Ad Creator v1.0
        </p>
      </footer>
    </div>
  );
};

export default App;
