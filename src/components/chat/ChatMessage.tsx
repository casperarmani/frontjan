import React, { useEffect, useRef } from 'react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Message } from '@/types';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '@/context/AuthContext';
import { Markmap } from 'markmap-view';
import { Transformer } from 'markmap-lib';

const transformer = new Transformer();

const markmapStyles = `
  .markmap-node {
    cursor: pointer;
  }
  .markmap-node-circle {
    fill: #fff;
    stroke-width: 1.5px;
  }
  .markmap-node-text, .markmap-node-text > * {
    fill: #ffffff !important;
    color: #ffffff !important;
    font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif;
  }
  .markmap {
    color: #ffffff !important;
  }
  .markmap-link {
    fill: none;
  }
`;

const downloadMarkmapStyles = `
  .markmap-node {
    cursor: pointer;
  }
  .markmap-node-circle {
    fill: #fff;
    stroke-width: 1.5px;
  }
  .markmap-node-text, .markmap-node-text > * {
    fill: #000000 !important;
    color: #000000 !important;
    font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif;
  }
  .markmap {
    color: #000000 !important;
  }
  .markmap-link {
    fill: none;
  }
`;

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { user } = useAuth();
  const userInitial = user?.email ? user.email[0].toUpperCase() : 'U';
  const markmapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (message.type === 'bot' && message.content.includes('{{markmap}}') && markmapRef.current) {
      const markmapMatch = message.content.match(/{{markmap}}([\s\S]*?)(?={{|$)/);
      if (markmapMatch) {
        const markmapContent = markmapMatch[1].trim();
        markmapRef.current.innerHTML = '';
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.style.width = '100%';
        svg.style.height = '100%';
        const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
        style.textContent = markmapStyles;
        svg.appendChild(style);
        markmapRef.current.appendChild(svg);
        
        const cleanedContent = markmapContent.replace(/^(#{2,})\s/gm, (_, hashes) => {
  return '-'.repeat(hashes.length - 1) + ' ';
});
const { root } = transformer.transform(cleanedContent);
        const mm = Markmap.create(svg, {
          embedGlobalCSS: true,
          colorFreezeLevel: 4,
          nodeMinHeight: 20,
          paddingX: 24,
          fontSize: 14,
          initialExpandLevel: 3,
          duration: 200,
          maxWidth: 800,
          zoom: 1.2,
        }, root);
        
        setTimeout(() => mm.fit(), 100);
      }
    }
  }, [message]);

  return (
    <div 
      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
      style={{
        animation: 'fadeInMessage 0.15s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        transform: 'translateZ(0)',
        willChange: 'transform, opacity',
        opacity: 0
      }}
    >
      <div className={`flex items-start max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
        <Avatar className={`w-12 h-12 ${message.type === 'user' ? 'bg-slate-700/90' : 'bg-black/80'}`}>
          <AvatarFallback className={`text-white/80 ${message.type === 'user' ? 'bg-slate-700/90' : 'bg-black/80'}`}>
            {message.type === 'user' ? userInitial : message.type === 'bot' ? 'AI' : '!'}
          </AvatarFallback>
        </Avatar>
        <div className={`mx-3 p-4 rounded-2xl ${
          message.type === 'user' 
            ? 'bg-white/10 backdrop-blur-lg' 
            : message.type === 'error'
            ? 'bg-red-500/10 backdrop-blur-lg'
            : 'bg-black/20 backdrop-blur-lg'
        }`}>
          <div className="text-white/90 text-sm leading-relaxed prose prose-invert">
            {message.type === 'user' ? (
              <p>{message.content}</p>
            ) : message.content.includes('{{markmap}}') ? (
              <div 
                ref={markmapRef}
                className="markmap-wrapper" 
                onClick={() => {
                  const modal = document.createElement('div');
                  modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50';
                  modal.innerHTML = `
                    <div class="w-[70%] h-[80vh] bg-black/20 backdrop-blur-xl rounded-2xl p-6 relative text-white">
                      <button class="absolute top-4 right-4 text-white/80 hover:text-white text-2xl font-bold" style="width: 30px; height: 30px;">×</button>
                      <button id="downloadBtn" class="absolute bottom-4 right-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 transition-colors">
                        Download Image
                      </button>
                      <div class="w-full h-full"></div>
                    </div>
                  `;
                  
                  const downloadBtn = modal.querySelector('#downloadBtn');
                  downloadBtn.addEventListener('click', () => {
                    const originalSvg = modal.querySelector('svg');
                    const downloadSvg = originalSvg.cloneNode(true);
                    downloadSvg.querySelector('style').textContent = downloadMarkmapStyles;

                    // Get SVG dimensions including its viewBox
                    const bbox = originalSvg.getBBox();
                    const padding = 100; // Add padding around the content
                    const width = bbox.width + (padding * 2);
                    const height = bbox.height + (padding * 2);

                    // Set proper viewBox and dimensions
                    downloadSvg.setAttribute('viewBox', `${bbox.x - padding} ${bbox.y - padding} ${width} ${height}`);
                    downloadSvg.setAttribute('width', width);
                    downloadSvg.setAttribute('height', height);

                    // Ensure SVG has explicit dimensions
                    downloadSvg.setAttribute('width', '1000');
                    downloadSvg.setAttribute('height', '1000');
                    
                    // Properly encode SVG data
                    const svgData = new XMLSerializer().serializeToString(downloadSvg);
                    const encodedData = encodeURIComponent(svgData);
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const img = new Image();
                    
                    img.onload = () => {
                      const scale = 2; // For higher resolution output
                      canvas.width = 2000; // Fixed width
                      canvas.height = 2000; // Fixed height
                      ctx.fillStyle = 'white';
                      ctx.fillRect(0, 0, canvas.width, canvas.height);
                      
                      // Draw the image centered
                      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                      
                      const link = document.createElement('a');
                      link.download = 'markmap.png';
                      link.href = canvas.toDataURL('image/png');
                      link.click();
                    };
                    
                    img.src = `data:image/svg+xml;charset=utf-8,${encodedData}`;
                  });
                  document.body.appendChild(modal);
                  
                  const markmapContent = message.content.match(/{{markmap}}([\s\S]*?)(?={{|$)/)[1].trim();
                  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                  svg.style.width = '100%';
                  svg.style.height = '100%';
                  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
                  style.textContent = markmapStyles;
                  svg.appendChild(style);
                  modal.querySelector('.w-full.h-full').appendChild(svg);
                  
                  const cleanedContent = markmapContent.replace(/^(#{2,})\s/gm, (_, hashes) => {
  return '-'.repeat(hashes.length - 1) + ' ';
});
const { root } = transformer.transform(cleanedContent);
                  const mm = Markmap.create(svg, {
                    embedGlobalCSS: true,
                    colorFreezeLevel: 4,
                    nodeMinHeight: 20,
                    paddingX: 12,
                    fontSize: 14,
                    initialExpandLevel: 3,
                    duration: 200,
                    maxWidth: 800,
                  }, root);
                  
                  setTimeout(() => mm.fit(), 100);
                  
                  const closeBtn = modal.querySelector('button');
                  closeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    document.body.removeChild(modal);
                  });
                  
                  modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                      document.body.removeChild(modal);
                    }
                  });
                }} 
                style={{ width: '100%', height: '400px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '1rem', cursor: 'pointer' }}
              ></div>
            ) : (
              <ReactMarkdown>{message.content}</ReactMarkdown>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}