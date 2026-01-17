
import React from 'react';

interface VideoPlayerProps {
  url: string;
  onDownload: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, onDownload }) => {
  return (
    <div className="relative group rounded-xl overflow-hidden bg-black aspect-[9/16] w-full max-w-[280px] mx-auto shadow-2xl">
      <video 
        src={url} 
        className="w-full h-full object-cover" 
        controls 
        autoPlay 
        loop 
        muted
      />
      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onDownload}
          className="w-full bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <i className="fas fa-download"></i> Download Ad
        </button>
      </div>
    </div>
  );
};

export default VideoPlayer;
