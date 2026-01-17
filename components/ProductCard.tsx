
import React, { useState } from 'react';
import { TrendingProduct, VideoStatus } from '../types';
import VideoPlayer from './VideoPlayer';

interface ProductCardProps {
  product: TrendingProduct;
  status: VideoStatus;
  onGenerate: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, status, onGenerate }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const triggerDownload = () => {
    if (status.videoUrl) {
      const link = document.createElement('a');
      link.href = status.videoUrl;
      const safeName = product.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      link.download = `${safeName}_tiktok_ad.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setShowConfirm(false);
    }
  };

  const handleDownloadClick = () => {
    setShowConfirm(true);
  };

  return (
    <div className="tiktok-card rounded-2xl p-6 flex flex-col h-full hover:shadow-[0_0_20px_rgba(0,242,234,0.3)] transition-all relative">
      <div className="mb-4">
        <h3 className="text-xl font-bold gradient-text">{product.name}</h3>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold flex items-center gap-1">
          <i className="fab fa-tiktok text-[#ff0050]"></i> {product.trendReason}
        </p>
      </div>

      <div className="flex-grow">
        <p className="text-sm text-slate-300 line-clamp-2 mb-4">{product.description}</p>
        
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700 mb-6">
          <span className="text-[10px] font-bold text-cyan-400 uppercase">Marketing Hook</span>
          <p className="text-xs italic text-slate-200 mt-1">"{product.adHook}"</p>
        </div>
      </div>

      <div className="mt-auto">
        {status.status === 'idle' && (
          <button
            onClick={onGenerate}
            className="w-full py-3 bg-gradient-to-r from-[#ff0050] to-[#00f2ea] text-white font-bold rounded-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
          >
            <i className="fas fa-magic"></i> Generate AI Video Ad
          </button>
        )}

        {status.status === 'generating' && (
          <div className="space-y-3">
            <div className="flex justify-between text-xs font-bold text-slate-400">
              <span>Generating Video...</span>
              <span>{status.progress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#ff0050] to-[#00f2ea] transition-all duration-500"
                style={{ width: `${status.progress}%` }}
              />
            </div>
            <p className="text-[10px] text-center text-slate-500 animate-pulse">
              AI is stitching scenes & rendering effects...
            </p>
          </div>
        )}

        {status.status === 'completed' && status.videoUrl && (
          <div className="space-y-4">
            <VideoPlayer url={status.videoUrl} onDownload={handleDownloadClick} />
            <button
              onClick={handleDownloadClick}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/20"
            >
              <i className="fas fa-file-download"></i> Download Video Ad
            </button>
          </div>
        )}

        {status.status === 'error' && (
          <div className="text-center p-3 rounded-lg bg-red-900/20 border border-red-500/30">
            <p className="text-xs text-red-400 mb-2">Error: {status.error}</p>
            <button
              onClick={onGenerate}
              className="text-xs font-bold text-white bg-red-600 px-3 py-1 rounded-md hover:bg-red-500"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Dialog Overlay */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl max-w-sm w-full shadow-2xl animate-in zoom-in duration-200">
            <div className="w-12 h-12 bg-cyan-500/10 text-cyan-400 rounded-full flex items-center justify-center mb-4 mx-auto">
              <i className="fas fa-question-circle text-2xl"></i>
            </div>
            <h4 className="text-lg font-bold text-center mb-2">Confirm Download</h4>
            <p className="text-sm text-slate-400 text-center mb-6">
              Would you like to save the generated video ad for <strong>{product.name}</strong> to your device?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={triggerDownload}
                className="flex-1 py-2 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-cyan-500/20"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
