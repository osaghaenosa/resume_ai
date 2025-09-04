
import React from 'react';

export default function Hero({ onStart }: { onStart: () => void }) {
    return (
        <div className="relative isolate pt-14 pb-16 md:pt-24 md:pb-24 text-center overflow-hidden bg-gray-900">
     
      

            <div className="absolute inset-0 bg-grid-cyan-500/10 [mask-image:linear-gradient(to_bottom,white_5%,transparent_90%)]"></div>
            <div className="absolute -top-1/2 left-1/2 -z-10 -translate-x-1/2 transform-gpu blur-3xl" aria-hidden="true">
                <div className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#0ea5e9] to-[#22d3ee] opacity-20"></div>
            </div>
            
            <div className="relative z-10 max-w-4xl mx-auto px-4">
                <div className="animate-fade-in-up">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
                        Build Your Career-Winning Documents with AI
                    </h1>
                    <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
                        Go from details to a stunning, interview-winning resume, cover letter, or portfolio in minutes. Our AI understands what recruiters want.
                    </p>
                    <div className="mt-10">
                        <button
                            onClick={onStart}
                            className="bg-cyan-500 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-cyan-400 transition-transform duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/20"
                        >
                            Start Building For Free
                        </button>
                    </div>
                </div>
            </div>

            <div className="relative mt-12 sm:mt-16 lg:mt-20 max-w-5xl mx-auto px-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <div className="bg-white/5 p-2 rounded-t-xl ring-1 ring-white/10">
                    <div className="bg-gray-700/50 p-2 rounded-t-lg">
                        <div className="flex justify-start items-center space-x-1.5 px-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                        </div>
                    </div>
                </div>
                <div className="relative aspect-[844/404] w-full bg-[#0B1120] p-6 rounded-b-xl shadow-2xl ring-1 ring-white/10 overflow-hidden">
                    <div className="absolute inset-0 bg-grid-cyan-500/5 [mask-image:linear-gradient(to_bottom,white_5%,transparent_60%)]"></div>
                    
                    <div className="flex gap-6">
                        <div className="w-1/3 space-y-4">
                             <div className="h-20 bg-gray-700/40 rounded-md animate-pulse"></div>
                             <div className="h-8 bg-gray-700/40 rounded-md animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                             <div className="h-8 bg-gray-700/40 rounded-md animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                        </div>
                        <div className="w-2/3 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-cyan-400/20 animate-pulse"></div>
                                <div>
                                    <div className="h-4 w-24 bg-gray-600/50 rounded-md"></div>
                                    <div className="h-3 w-32 bg-gray-700/50 rounded-md mt-2"></div>
                                </div>
                            </div>
                            <div className="h-12 w-full bg-gray-800/40 rounded-md animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="h-12 w-full bg-gray-800/40 rounded-md animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                        </div>
                    </div>
                    
                    <div className="absolute top-1/2 left-1/3 w-0.5 h-5 bg-cyan-400 rounded-full animate-blink shadow-[0_0_10px_theme(colors.cyan.400)]"></div>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none"></div>
            </div>
             
        </div>
    );
}