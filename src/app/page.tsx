"use client";
import { useState } from "react";
import type { TriageOutput } from "@/lib/triage";
import SymptomForm from "@/components/SymptomForm";
import AIResponse from "@/components/AIResponse";
import ResearchSummarizer from "@/components/ResearchSummarizer";

type Message = { type: "user"; text: string } | { type: "ai"; triage: TriageOutput };

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleTriage(result: TriageOutput, symptoms: string) {
    setMessages([{ type: "user", text: symptoms }, { type: "ai", triage: result }]);
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Research Tools</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Research Section */}
          <div className="flex-1 overflow-y-auto p-4">
            <ResearchSummarizer />
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold">Symptom Checker</h1>
            </div>
            <div className="text-sm text-gray-500">
              AI-powered health guidance
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">How can I help you today?</h3>
                  <p className="text-sm text-gray-500 mt-1">Describe your symptoms and I&apos;ll provide guidance</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {messages.map((m, idx) => (
                m.type === "user" ? (
                  <div key={idx} className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl bg-blue-600 text-white px-4 py-3 text-sm shadow-sm animate-fade-in">
                      {m.text}
                    </div>
                  </div>
                ) : (
                  <div key={idx} className="flex justify-start">
                    <div className="animate-fade-in">
                      <AIResponse data={m.triage} />
                    </div>
                  </div>
                )
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 shadow-sm">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <SymptomForm onTriage={handleTriage} onLoadingChange={setIsTyping} />
        </div>
      </div>
    </div>
  );
}
