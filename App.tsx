
import React, { useState, useCallback, useRef } from 'react';
import { generateWodStrategy } from './services/geminiService';
import { LoadingStatus } from './types';
import StrategyResult from './components/StrategyResult';

const App: React.FC = () => {
  const [wodInput, setWodInput] = useState('');
  const [stats, setStats] = useState({
    gender: 'male',
    squat: '',
    deadlift: '',
    ohp: '',
    pullups: '',
    cardio: ''
  });
  const [status, setStatus] = useState<LoadingStatus>(LoadingStatus.IDLE);
  const [strategy, setStrategy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedImage, setSelectedImage] = useState<{data: string, mimeType: string} | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStatChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setStats(prev => ({ ...prev, [name]: value }));
  };

  const handleGenderSelect = (gender: string) => {
    setStats(prev => ({ ...prev, gender }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = (reader.result as string).split(',')[1];
        setSelectedImage({
          data: base64Data,
          mimeType: file.type
        });
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerate = useCallback(async () => {
    if (!wodInput.trim() && !selectedImage) {
      setError('WOD 텍스트를 입력하거나 와드 사진을 업로드해주세요.');
      return;
    }

    setStatus(LoadingStatus.LOADING);
    setError(null);
    setStrategy(null);

    try {
      const result = await generateWodStrategy(wodInput, stats, selectedImage || undefined);
      setStrategy(result);
      setStatus(LoadingStatus.SUCCESS);
      
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      setError(err.message || '전략 생성 중 오류가 발생했습니다.');
      setStatus(LoadingStatus.ERROR);
    }
  }, [wodInput, stats, selectedImage]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-red-500/30">
      <nav className="border-b border-white/10 px-6 py-4 sticky top-0 bg-slate-950/80 backdrop-blur-md z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center font-bold text-white shadow-lg shadow-red-600/20">W</div>
            <h1 className="oswald text-2xl tracking-tighter uppercase font-bold">WOD <span className="text-red-600">STRATEGIST</span></h1>
          </div>
          <div className="text-xs uppercase tracking-widest text-slate-500 font-semibold hidden sm:block">Personalized AI Coaching</div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-12 text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-tight leading-tight">
            크로스핏 와드 <span className="text-red-500">분석기.</span>
          </h2>
          <p className="text-slate-400 text-lg">기록과 사진을 바탕으로 당신만의 필승 전략을 설계합니다.</p>
        </div>

        <div className="grid grid-cols-1 gap-8 mb-12">
          {/* Athlete Profile Section */}
          <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-xl">
            <h3 className="oswald text-xl uppercase font-bold mb-6 flex items-center gap-2">
              <span className="text-red-600">01.</span> Athlete Profile <span className="text-xs text-slate-500 normal-case font-sans">(선택 사항)</span>
            </h3>
            
            <div className="mb-6">
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 ml-1">Gender</label>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleGenderSelect('male')}
                  className={`flex-1 py-3 rounded-lg font-bold transition-all ${stats.gender === 'male' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-slate-900 text-slate-500 border border-white/5 hover:border-white/10'}`}
                >
                  남성 (Male)
                </button>
                <button 
                  onClick={() => handleGenderSelect('female')}
                  className={`flex-1 py-3 rounded-lg font-bold transition-all ${stats.gender === 'female' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-slate-900 text-slate-500 border border-white/5 hover:border-white/10'}`}
                >
                  여성 (Female)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 ml-1">Back Squat (lb)</label>
                <input
                  type="number"
                  name="squat"
                  step="5"
                  value={stats.squat}
                  onChange={handleStatChange}
                  placeholder="PR"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-3 focus:ring-1 focus:ring-red-600/50 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 ml-1">Deadlift (lb)</label>
                <input
                  type="number"
                  name="deadlift"
                  step="5"
                  value={stats.deadlift}
                  onChange={handleStatChange}
                  placeholder="PR"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-3 focus:ring-1 focus:ring-red-600/50 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 ml-1">Strict OHP (lb)</label>
                <input
                  type="number"
                  name="ohp"
                  step="5"
                  value={stats.ohp}
                  onChange={handleStatChange}
                  placeholder="PR"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-3 focus:ring-1 focus:ring-red-600/50 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 ml-1">Max Pull-ups</label>
                <input
                  type="number"
                  name="pullups"
                  value={stats.pullups}
                  onChange={handleStatChange}
                  placeholder="Reps"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-3 focus:ring-1 focus:ring-red-600/50 outline-none transition-all"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 ml-1">Cardio Level</label>
                <input
                  type="text"
                  name="cardio"
                  value={stats.cardio}
                  onChange={handleStatChange}
                  placeholder="예: 5km 22분, 2k Row 7:30 등"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-3 focus:ring-1 focus:ring-red-600/50 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* WOD Input & Image Section */}
          <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-xl">
            <h3 className="oswald text-xl uppercase font-bold mb-6 flex items-center gap-2">
              <span className="text-red-600">02.</span> Today's Workout
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 ml-1">상세 정보 입력</label>
                <textarea
                  id="wod-input"
                  value={wodInput}
                  onChange={(e) => setWodInput(e.target.value)}
                  placeholder="다음 내용을 자유롭게 입력하세요:&#10;- 와드 내용 (예: 21-15-9 Thrusters...)&#10;- 스케일 수준 (예: 115lb로 스케일)&#10;- 동작별 언브로큰 횟수&#10;- 관련 동작의 1RM&#10;- 목표 페이스"
                  className="w-full h-56 bg-slate-900/50 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-all placeholder:text-slate-700 resize-none leading-relaxed"
                />
              </div>
              
              <div className="flex flex-col">
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2 ml-1">사진 업로드 (화이트보드 등)</label>
                {previewUrl ? (
                  <div className="relative w-full h-56 rounded-xl overflow-hidden border border-white/10 group">
                    <img src={previewUrl} alt="WOD Preview" className="w-full h-full object-cover" />
                    <button 
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <span className="text-xs font-bold uppercase tracking-widest">사진 변경은 클릭</span>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange} 
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                ) : (
                  <div className="w-full h-56 rounded-xl border-2 border-dashed border-white/10 bg-slate-900/30 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-slate-900/50 transition-all group relative">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-700 group-hover:text-red-600/50 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-slate-600 text-sm font-medium">와드 사진 추가</span>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      accept="image/*" 
                      capture="environment"
                      onChange={handleImageChange} 
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                )}
                <p className="mt-2 text-[10px] text-slate-600 text-center italic">화이트보드 사진을 올리면 텍스트를 자동으로 분석합니다.</p>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={status === LoadingStatus.LOADING}
              className={`w-full py-5 rounded-xl text-lg font-bold uppercase tracking-widest transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 ${
                status === LoadingStatus.LOADING
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/40'
              }`}
            >
              {status === LoadingStatus.LOADING ? (
                <>
                  <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  전략 분석 중...
                </>
              ) : (
                '개인 맞춤 전략 생성'
              )}
            </button>
          </div>
        </div>

        {/* Results Area */}
        <div id="results" className="scroll-mt-24">
          {error && (
            <div className="bg-red-900/20 border border-red-500/50 text-red-200 p-4 rounded-xl mb-8 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <span className="text-xl">⚠️</span>
              {error}
            </div>
          )}

          {strategy && <StrategyResult content={strategy} />}
          
          {status === LoadingStatus.IDLE && !strategy && (
            <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-2xl bg-slate-900/20">
              <div className="text-slate-600 mb-2">와드 정보나 사진을 입력하고 버튼을 눌러주세요.</div>
              <p className="text-slate-700 text-sm italic">"Victory favors the prepared."</p>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-white/5 py-12 px-6 bg-slate-950/50">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-4 text-slate-500 text-sm text-center">
          <p>&copy; 2026 CrossFit WOD Strategist.</p>
          <p className="max-w-md opacity-50">성별, PR, 스케일 정보를 종합 분석하여 가장 현실적이고 효율적인 와드 플랜을 제시합니다.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
