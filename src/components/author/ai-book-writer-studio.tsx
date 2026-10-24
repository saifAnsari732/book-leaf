"use client";

import React, { useState } from "react";
import {
  BookOpen,
  PenTool,
  Copy,
  Check,
  RefreshCw,
  Send,
  FileText,
  AlignLeft,
  Sliders,
  Layers,
  ArrowRight,
  Download,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface AIBookWriterStudioProps {
  onOpenCreateBook?: (initialData?: {
    title?: string;
    genre?: string;
    blurb?: string;
  }) => void;
  defaultTitle?: string;
  defaultGenre?: string;
}

export function AIBookWriterStudio({
  onOpenCreateBook,
  defaultTitle = "",
  defaultGenre = "Literary Fiction",
}: AIBookWriterStudioProps) {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<
    "chapter" | "titles" | "blurb" | "outline" | "proofread"
  >("chapter");

  const [bookTitle, setBookTitle] = useState(defaultTitle);
  const [genre, setGenre] = useState(defaultGenre);
  const [tone, setTone] = useState("Immersive & Bestselling");
  const [promptTopic, setPromptTopic] = useState("");
  const [draftText, setDraftText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      const res = await fetch("/api/ai/write-book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: activeTab,
          title: bookTitle.trim() || undefined,
          genre,
          topic: promptTopic.trim() || undefined,
          draftText: draftText.trim() || undefined,
          tone,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate book content");
      }

      setGeneratedOutput(data.content);
      toast.success(
        "Content Generated Successfully!",
        `Editorial content created for your book.`
      );
    } catch (err: any) {
      toast.error("Generation Failed", err.message || "Could not generate content.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedOutput) return;
    navigator.clipboard.writeText(generatedOutput);
    setCopied(true);
    toast.info("Copied to Clipboard", "Content ready to paste into manuscript.");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUseInPublishing = () => {
    if (onOpenCreateBook) {
      onOpenCreateBook({
        title: bookTitle || undefined,
        genre,
        blurb: activeTab === "blurb" ? generatedOutput : undefined,
      });
      toast.success("Loaded into Publishing Wizard", "Opening book creator...");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0F223D] via-[#16365C] to-[#0F4C3A] rounded-2xl p-6 text-white border border-slate-700/50 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-emerald-300 rounded-full text-xs font-semibold uppercase tracking-wider border border-white/15">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>BookLeaf Author Studio • Editorial Suite</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Author Manuscript &amp; Drafting Studio
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl">
              Draft chapters, generate bestselling titles, plan 12-chapter outlines,
              craft back-cover blurbs, and proofread manuscript drafts with professional editorial tools.
            </p>
          </div>

          {onOpenCreateBook && (
            <button
              onClick={() => onOpenCreateBook()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#F05262] to-[#e04555] hover:opacity-95 text-white font-bold text-xs shadow-md transition"
            >
              <BookOpen className="w-4 h-4" />
              <span>Start New Book</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
        {[
          { id: "chapter", label: "Write Chapter", icon: PenTool },
          { id: "titles", label: "Title & Subtitle Ideas", icon: BookOpen },
          { id: "blurb", label: "Book Blurb & Synopsis", icon: AlignLeft },
          { id: "outline", label: "12-Chapter Plot Outline", icon: Layers },
          { id: "proofread", label: "Proofread & Polish", icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setGeneratedOutput("");
              }}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                isActive
                  ? "bg-[#0F4C3A] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Studio Workspace: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[550px]">
        {/* Left Column: Configuration Controls */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#0F4C3A]" />
              <span>Writing Parameters</span>
            </h3>
            <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
              Manuscript Editor
            </span>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Book Title (or working title)
              </label>
              <input
                type="text"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                placeholder="e.g. Echoes of the Monsoon"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F4C3A] font-medium text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Genre
                </label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F4C3A] text-slate-800"
                >
                  <option value="Literary Fiction">Literary Fiction</option>
                  <option value="Thriller & Mystery">Thriller &amp; Mystery</option>
                  <option value="Contemporary Romance">Contemporary Romance</option>
                  <option value="Self-Help & Motivation">Self-Help &amp; Motivation</option>
                  <option value="Sci-Fi & Fantasy">Sci-Fi &amp; Fantasy</option>
                  <option value="Business & Finance">Business &amp; Finance</option>
                  <option value="Poetry & Anthologies">Poetry &amp; Anthologies</option>
                  <option value="Memoir & Biography">Memoir &amp; Biography</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tone &amp; Style
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F4C3A] text-slate-800"
                >
                  <option value="Immersive & Bestselling">Immersive &amp; Bestselling</option>
                  <option value="Fast-Paced & Gripping">Fast-Paced &amp; Gripping</option>
                  <option value="Poetic & Evocative">Poetic &amp; Evocative</option>
                  <option value="Authoritative & Clear">Authoritative &amp; Clear</option>
                  <option value="Warm & Conversational">Warm &amp; Conversational</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {activeTab === "chapter"
                  ? "Chapter Focus / Scene Goal"
                  : activeTab === "titles"
                  ? "Core Story Concept / Premise"
                  : activeTab === "blurb"
                  ? "Key Plot Points & Stakes"
                  : activeTab === "outline"
                  ? "Book Premise & Central Conflict"
                  : "Text Excerpt to Polish"}
              </label>
              <textarea
                rows={4}
                value={promptTopic}
                onChange={(e) => setPromptTopic(e.target.value)}
                placeholder={
                  activeTab === "chapter"
                    ? "e.g. Maya discovers a secret letter hidden in her grandfather's old study, revealing a long-forgotten family dispute..."
                    : activeTab === "titles"
                    ? "e.g. A gripping investigative mystery set in the ghats of Varanasi involving ancient manuscripts..."
                    : activeTab === "blurb"
                    ? "e.g. A young entrepreneur loses everything, only to rebuild an empire in the tech hubs of Bangalore..."
                    : "Describe the core scene goals, plot points, or notes..."
                }
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F4C3A] text-slate-900 leading-relaxed resize-none"
              />
            </div>

            {(activeTab === "chapter" || activeTab === "proofread") && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Draft Text / Existing Manuscript Excerpt
                </label>
                <textarea
                  rows={4}
                  value={draftText}
                  onChange={(e) => setDraftText(e.target.value)}
                  placeholder="Paste existing paragraphs to continue or polish..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F4C3A] text-slate-900 leading-relaxed resize-none"
                />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-3 rounded-xl bg-[#0F4C3A] hover:bg-[#0c3d2e] text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating Manuscript Draft...</span>
              </>
            ) : (
              <>
                <PenTool className="w-4 h-4" />
                <span>
                  Generate{" "}
                  {activeTab === "chapter"
                    ? "Chapter Content"
                    : activeTab === "titles"
                    ? "Titles"
                    : activeTab === "blurb"
                    ? "Book Blurb"
                    : activeTab === "outline"
                    ? "Outline"
                    : "Polished Version"}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Output & Live Editor */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          {/* Output Toolbar */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <FileText className="w-4 h-4 text-[#0F4C3A]" />
              <span>Manuscript Output Studio</span>
            </div>

            {generatedOutput && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                {onOpenCreateBook && activeTab === "blurb" && (
                  <button
                    type="button"
                    onClick={handleUseInPublishing}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition shadow-2xs"
                  >
                    <span>Use in Book Wizard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Output Text Viewer */}
          <div className="flex-1 p-6 overflow-y-auto bg-slate-50/30">
            {isGenerating ? (
              <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#0F4C3A]">
                  <RefreshCw className="w-5 h-5 animate-spin text-[#0F4C3A]" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">
                  Drafting your manuscript content...
                </h4>
                <p className="text-xs text-slate-500 max-w-sm">
                  Analyzing narrative flow, chapter structure, and pacing according to your parameters.
                </p>
              </div>
            ) : generatedOutput ? (
              <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed font-serif">
                {generatedOutput}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-3">
                <PenTool className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">
                  No Content Generated Yet
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Select an editorial tool, provide your premise or scene details on
                  the left, and click &quot;Generate&quot; to produce publication-ready
                  material.
                </p>
              </div>
            )}
          </div>

          {/* Footer Stats */}
          {generatedOutput && (
            <div className="p-3.5 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between">
              <span>
                Word count:{" "}
                <strong>{generatedOutput.split(/\s+/).filter(Boolean).length}</strong>{" "}
                words
              </span>
              <span>
                Est. Reading time:{" "}
                <strong>
                  {Math.ceil(
                    generatedOutput.split(/\s+/).filter(Boolean).length / 200
                  )}
                </strong>{" "}
                min
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
