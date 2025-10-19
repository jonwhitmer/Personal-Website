import React from 'react';
import { Send, Bot, User, Brain } from 'lucide-react';

export default function Chat({ 
  messages, 
  input, 
  setInput, 
  isLoading, 
  handleSend, 
  charCount, 
  setCharCount, 
  MAX_CHAR_LIMIT,
  messagesEndRef 
}) {
  return (
    <section className="mb-12 md:mb-16">
      <div className="max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-cyan-500/10 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-blue-500/20">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 md:p-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <Bot size={24} className="text-white md:w-7 md:h-7" />
              </div>
              <div>
                <h3 className="font-bold text-xl md:text-2xl text-white">Chat with Jaymik</h3>
                <p className="text-sm md:text-base text-blue-100">Your AI-powered guide to Jon's portfolio</p>
              </div>
            </div>
          </div>

          <div className="h-[300px] md:h-[400px] overflow-y-auto p-4 md:p-6 space-y-4 bg-black/40">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2 md:gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/50">
                    <Bot size={16} className="md:w-5 md:h-5" />
                  </div>
                )}
                <div className={`rounded-2xl px-4 py-2 md:px-5 md:py-3 max-w-[85%] md:max-w-[75%] ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30' 
                    : 'bg-white/5 backdrop-blur-sm border border-white/10 text-gray-100'
                }`}>
                  <p className="leading-relaxed text-sm md:text-base">{msg.content}</p>
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center flex-shrink-0 border border-white/10">
                    <User size={16} className="md:w-5 md:h-5" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/50 animate-pulse">
                  <Brain size={16} className="animate-pulse md:w-5 md:h-5" />
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-2 md:px-5 md:py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                    </div>
                    <span className="text-gray-400 text-xs md:text-sm ml-2 animate-pulse">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 md:p-6 border-t border-white/10 bg-black/60">
            <form onSubmit={handleSend} className="flex gap-2 md:gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setCharCount(e.target.value.length);
                }}
                placeholder="Ask about projects, skills..."
                maxLength={MAX_CHAR_LIMIT}
                className="flex-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 md:px-5 md:py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 text-sm md:text-base"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed rounded-xl px-5 py-3 md:px-6 md:py-4 transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 flex-shrink-0"
              >
                <Send size={18} className="md:w-5 md:h-5" />
              </button>
            </form>
            {charCount > 0 && (
              <p className={`text-xs mt-2 text-right ${charCount >= MAX_CHAR_LIMIT ? 'text-red-400' : 'text-gray-500'}`}>
                {charCount}/{MAX_CHAR_LIMIT} characters
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}