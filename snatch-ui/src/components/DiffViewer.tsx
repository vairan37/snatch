import React from 'react';

interface DiffViewerProps {
  diff: string | null;
  loading: boolean;
}

const DiffViewer: React.FC<DiffViewerProps> = ({ diff, loading }) => {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-muted animate-pulse italic">
        Computing difference...
      </div>
    );
  }

  if (!diff) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-text-muted italic gap-2">
        <div className="w-12 h-12 rounded-full border-2 border-white/5 flex items-center justify-center opacity-20">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        Select a snapshot to view changes
      </div>
    );
  }

  const lines = diff.split('\n');

  return (
    <div className="flex-1 overflow-auto bg-zed-bg font-mono text-[11px] leading-relaxed">
      <div className="min-w-full">
        {lines.map((line, i) => {
          let bgColor = 'transparent';
          let textColor = 'inherit';
          
          if (line.startsWith('+') && !line.startsWith('+++')) {
            bgColor = 'rgba(0, 255, 136, 0.1)';
            textColor = '#00ff88';
          } else if (line.startsWith('-') && !line.startsWith('---')) {
            bgColor = 'rgba(255, 85, 85, 0.1)';
            textColor = '#ff5555';
          } else if (line.startsWith('diff --git')) {
            bgColor = 'rgba(255, 255, 255, 0.05)';
            textColor = '#e2e2e2';
          }

          return (
            <div 
              key={i} 
              className="flex hover:bg-white/5 group px-4 border-l-2 border-transparent"
              style={{ backgroundColor: bgColor }}
            >
              <span className="w-10 inline-block text-text-muted text-right pr-4 select-none opacity-50 group-hover:opacity-100">
                {i + 1}
              </span>
              <span className="whitespace-pre flex-1" style={{ color: textColor }}>
                {line}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DiffViewer;
