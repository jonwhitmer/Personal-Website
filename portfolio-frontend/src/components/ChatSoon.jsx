import React from 'react';
import { Bot, Zap, Sparkles, Brain, Terminal } from 'lucide-react';

export default function ChatSoon() {
  return (
    <section className="mb-12 md:mb-16">
      <div className="max-w-5xl mx-auto relative">
        <div className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-cyan-500/10 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-blue-500/20 relative">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20 animate-pulse"></div>
          
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-4 md:p-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 animate-pulse">
                <Bot size={24} className="text-white md:w-7 md:h-7" />
              </div>
              <div>
                <h3 className="font-bold text-xl md:text-2xl text-white flex items-center gap-2">
                  Chat with Jaymik
                  <Sparkles size={20} className="text-yellow-300 animate-pulse" />
                </h3>
                <p className="text-sm md:text-base text-blue-100">AI-powered portfolio assistant</p>
              </div>
            </div>
          </div>

          {/* Chat area with futuristic effects */}
          <div className="relative h-[300px] md:h-[400px] overflow-hidden p-4 md:p-6 bg-black/40">
            {/* Animated grid overlay */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0" style={{
                backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.5) 1px, transparent 1px)',
                backgroundSize: '50px 50px',
                animation: 'grid-scroll 20s linear infinite'
              }}></div>
            </div>

            {/* Floating particles */}
            <div className="absolute inset-0">
              <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
              <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
              <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-cyan-400 rounded-full animate-ping" style={{animationDelay: '2s'}}></div>
            </div>

            {/* Mock messages with glitch effect */}
            <div className="relative space-y-4 opacity-30 blur-sm">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/50">
                  <Brain size={20} />
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-3 max-w-[75%]">
                  <div className="h-4 bg-gradient-to-r from-blue-400 to-purple-400 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl px-5 py-3 max-w-[75%]">
                  <div className="h-4 w-32 bg-white/30 rounded animate-pulse"></div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center border border-white/10">
                  <Terminal size={20} />
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/50 animate-pulse">
                  <Zap size={20} />
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-3 max-w-[75%]">
                  <div className="space-y-2">
                    <div className="h-3 bg-gradient-to-r from-cyan-400 to-blue-400 rounded animate-pulse"></div>
                    <div className="h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded animate-pulse w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* COMING SOON overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md">
              <div className="text-center space-y-4 p-8">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 blur-2xl opacity-50 animate-pulse"></div>
                  <h3 className="relative text-4xl md:text-6xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
                    COMING SOON
                  </h3>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
                <p className="text-gray-300 text-sm md:text-base max-w-md">
                  RAG-powered AI assistant launching soon. Ask questions about projects, experience, and technical skills.
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                  <Brain size={16} className="animate-pulse" />
                  <span>Powered by Groq + LangChain4j</span>
                </div>
              </div>
            </div>
          </div>

          {/* Input area */}
          <div className="relative p-4 md:p-6 border-t border-white/10 bg-black/60 opacity-50 pointer-events-none">
            <div className="flex gap-2 md:gap-3">
              <div className="flex-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 md:px-5 md:py-4">
                <div className="h-5 w-48 bg-gray-700 rounded animate-pulse"></div>
              </div>
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl px-5 py-3 md:px-6 md:py-4 flex items-center justify-center">
                <Zap size={18} className="md:w-5 md:h-5 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Glowing border animation */}
        <div className="absolute -inset-[2px] bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-2xl opacity-20 blur-xl -z-10 animate-pulse"></div>
      </div>

      <style jsx>{`
        @keyframes grid-scroll {
          0% { transform: translateY(0); }
          100% { transform: translateY(50px); }
        }
      `}</style>
    </section>
  );
}