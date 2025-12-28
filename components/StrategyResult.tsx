
import React from 'react';

interface Props {
  content: string;
}

const StrategyResult: React.FC<Props> = ({ content }) => {
  // 텍스트 내의 **볼드** 문법을 React 엘리먼트로 변환하는 헬퍼 함수
  const processBold = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="text-red-400 font-bold">{part}</strong>;
      }
      return part;
    });
  };

  const formatContent = (text: string) => {
    const lines = text.split('\n');
    
    return lines.map((line, i) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return <div key={i} className="h-4"></div>;

      // 1. 헤더 처리 (#, ##, ### 등)
      const headerMatch = trimmedLine.match(/^(#+)\s*(.*)/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const content = headerMatch[2];
        
        const className = level === 1 
          ? "text-3xl font-black text-red-600 mb-6 uppercase oswald" 
          : level === 2 
            ? "text-2xl font-black text-red-500 mt-8 mb-4 uppercase oswald border-b border-red-900/30 pb-2"
            : "text-xl font-bold text-white mt-6 mb-3 uppercase tracking-tight";
            
        return <div key={i} className={className}>{processBold(content)}</div>;
      }

      // 2. 리스트/숫자 번호 처리
      const listMatch = trimmedLine.match(/^(\d+\.|\*|-)\s*(.*)/);
      if (listMatch) {
        const marker = listMatch[1];
        const content = listMatch[2];
        return (
          <div key={i} className="flex gap-3 ml-2 mb-3 items-start">
            <span className="text-red-600 font-bold shrink-0 mt-1">{marker.includes('.') ? marker : '•'}</span>
            <div className="text-slate-300 leading-relaxed">{processBold(content)}</div>
          </div>
        );
      }

      // 3. 일반 텍스트
      return (
        <p key={i} className="text-slate-300 leading-relaxed mb-4">
          {processBold(trimmedLine)}
        </p>
      );
    });
  };

  return (
    <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-red-600 px-6 py-3 flex justify-between items-center">
        <span className="oswald uppercase font-bold tracking-widest text-sm text-white">Coach's Plan</span>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-white/70"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
        </div>
      </div>
      <div className="p-8 sm:p-10 bg-slate-900/40">
        <div className="prose prose-invert max-w-none">
          {formatContent(content)}
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/5 text-center italic text-slate-500 text-xs">
          "전략은 완벽할 수 없지만, 준비는 완벽해야 합니다. 힘내세요!"
        </div>
      </div>
    </div>
  );
};

export default StrategyResult;
