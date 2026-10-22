"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Play, X, ChevronLeft, ChevronRight, Youtube, Sparkles, BookOpen, ExternalLink } from "lucide-react";

export interface AuthorTestimonialVideo {
  id: string;
  videoId: string;
  title: string;
  authorName: string;
  displayName: string;
  bookOrTopic: string;
  views: string;
  localThumbnail: string;
  fallbackThumbnail: string;
  type: "short" | "video";
}

export const AUTHOR_TESTIMONIALS: AuthorTestimonialVideo[] = [
  {
    id: "julie-dunic",
    videoId: "7NxsDYQW2EI",
    title: "Author Testimonial | BookLeaf Publishing Honest Review | Julie Dunic, Author of Fears That Rhyme",
    authorName: "Julie Dunic",
    displayName: "Julie",
    bookOrTopic: "Fears That Rhyme",
    views: "1.2K views",
    localThumbnail: "/images/testimonials/julie-dunic.jpg",
    fallbackThumbnail: "https://i.ytimg.com/vi/7NxsDYQW2EI/hqdefault.jpg",
    type: "short",
  },
  {
    id: "melissa-jemison",
    videoId: "6B3h8T95O-s",
    title: "Author Testimonial | BookLeaf Publishing Review | Melissa Jemison, Author of Reality Check",
    authorName: "Melissa Jemison",
    displayName: "Melissa",
    bookOrTopic: "Reality Check",
    views: "630 views",
    localThumbnail: "/images/testimonials/melissa-jemison.jpg",
    fallbackThumbnail: "https://i.ytimg.com/vi/6B3h8T95O-s/hqdefault.jpg",
    type: "short",
  },
  {
    id: "ashley-boyd",
    videoId: "F8tSq3Al3yo",
    title: "Author Testimonial | BookLeaf Publishing Review | Ashley Boyd, Author",
    authorName: "Ashley Boyd",
    displayName: "Ashley",
    bookOrTopic: "First Book Journey",
    views: "516 views",
    localThumbnail: "/images/testimonials/ashley-boyd.jpg",
    fallbackThumbnail: "https://i.ytimg.com/vi/F8tSq3Al3yo/hqdefault.jpg",
    type: "short",
  },
  {
    id: "esmeralda-olivares",
    videoId: "HgZ5-zWSI1I",
    title: "Author Testimonial | BookLeaf Publishing Honest Review | Esmeralda Olivares, Author",
    authorName: "Esmeralda Olivares",
    displayName: "Esmeralda",
    bookOrTopic: "Poetry & Publishing",
    views: "1.5K views",
    localThumbnail: "/images/testimonials/esmeralda-olivares.jpg",
    fallbackThumbnail: "https://i.ytimg.com/vi/HgZ5-zWSI1I/hqdefault.jpg",
    type: "short",
  },
  {
    id: "daniel-g",
    videoId: "WwZ6aJQ0zOk",
    title: "Author Testimonial | BookLeaf Publishing Review | Daniel G, Author",
    authorName: "Daniel G",
    displayName: "Daniel",
    bookOrTopic: "21-Day Challenge",
    views: "2.4K views",
    localThumbnail: "/images/testimonials/daniel-g.jpg",
    fallbackThumbnail: "https://i.ytimg.com/vi/WwZ6aJQ0zOk/hqdefault.jpg",
    type: "short",
  },
  {
    id: "victor-salgado",
    videoId: "6gnnvdtpmXU",
    title: "Author Testimonial | BookLeaf Publishing Review | Victor Salgado, Author",
    authorName: "Victor Salgado",
    displayName: "Victor",
    bookOrTopic: "Becoming an Author",
    views: "372 views",
    localThumbnail: "/images/testimonials/victor-salgado.jpg",
    fallbackThumbnail: "https://i.ytimg.com/vi/6gnnvdtpmXU/hqdefault.jpg",
    type: "short",
  },
  {
    id: "dr-raavi-gaur",
    videoId: "KXaUUm0kkho",
    title: "BookLeaf Publishing Reviews | Dr. Raavi Gaur, Author of The SPOKEN... UNSPOKEN",
    authorName: "Dr. Raavi Gaur",
    displayName: "Dr. Raavi",
    bookOrTopic: "The SPOKEN... UNSPOKEN",
    views: "1.1K views",
    localThumbnail: "/images/testimonials/dr-raavi-gaur.jpg",
    fallbackThumbnail: "https://i.ytimg.com/vi/KXaUUm0kkho/hqdefault.jpg",
    type: "short",
  },
  {
    id: "onkar-kulkarni",
    videoId: "IQv1hNJgfR4",
    title: "BookLeaf Publishing Honest Review | Onkar Kulkarni, Author of Petrichor",
    authorName: "Onkar Kulkarni",
    displayName: "Onkar",
    bookOrTopic: "Petrichor",
    views: "1.8K views",
    localThumbnail: "/images/testimonials/onkar-kulkarni.jpg",
    fallbackThumbnail: "https://i.ytimg.com/vi/IQv1hNJgfR4/hqdefault.jpg",
    type: "short",
  },
  {
    id: "asif-motorwala",
    videoId: "yTeXLVidns0",
    title: "BookLeaf Publishing Reviews | Asif Motorwala, Author of इकीस एहसास माफ़",
    authorName: "Asif Motorwala",
    displayName: "Asif",
    bookOrTopic: "इकीस एहसास माफ़",
    views: "700 views",
    localThumbnail: "/images/testimonials/asif-motorwala.jpg",
    fallbackThumbnail: "https://i.ytimg.com/vi/yTeXLVidns0/hqdefault.jpg",
    type: "short",
  },
  {
    id: "ankit-kumar",
    videoId: "SwAwvyNMt-o",
    title: "BookLeaf Publishing Honest Review | Ankit Kumar, Author of The Pondering Thoughts",
    authorName: "Ankit Kumar",
    displayName: "Ankit",
    bookOrTopic: "The Pondering Thoughts",
    views: "1.4K views",
    localThumbnail: "/images/testimonials/ankit-kumar.jpg",
    fallbackThumbnail: "https://i.ytimg.com/vi/SwAwvyNMt-o/hqdefault.jpg",
    type: "short",
  },
  {
    id: "amit-das",
    videoId: "JJNuGdl12as",
    title: "BookLeaf Publishing Reviews | Amit Das, Author of Empathy for the Moon",
    authorName: "Amit Das",
    displayName: "Amit",
    bookOrTopic: "Empathy for the Moon",
    views: "1.1K views",
    localThumbnail: "/images/testimonials/amit-das.jpg",
    fallbackThumbnail: "https://i.ytimg.com/vi/JJNuGdl12as/hqdefault.jpg",
    type: "video",
  },
  {
    id: "antara-chakrabarti",
    videoId: "3Rlg_2_ZZtI",
    title: "BookLeaf Publishing Reviews | Antara Chakrabarti, Author of An Ounce of Poetry",
    authorName: "Antara Chakrabarti",
    displayName: "Antara",
    bookOrTopic: "An Ounce of Poetry",
    views: "1.0K views",
    localThumbnail: "/images/testimonials/antara-chakrabarti.jpg",
    fallbackThumbnail: "https://i.ytimg.com/vi/3Rlg_2_ZZtI/hqdefault.jpg",
    type: "video",
  },
];

// Pronounced curved arch & wave trajectory for authentic curved ribbon effect (integer constants prevent SSR hydration mismatch)
const CURVE_OFFSETS_Y = [36, 26, 16, 8, 2, 0, 2, 8, 16, 26, 36, 44];
const CURVE_ROTATIONS = [-3.5, -2.5, -1.5, -0.5, 0.5, 1.5, 2.5, 3.5, 2.5, 1.5, -0.5, -2];

export default function AuthorVideoReel() {
  const [activeVideo, setActiveVideo] = useState<AuthorTestimonialVideo | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveVideo(null);
      }
    };
    if (activeVideo) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [activeVideo]);

  // Infinite smooth continuous sliding animation (cinematic 60fps glide)
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    let animId: number;
    let lastTime = performance.now();

    const step = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      if (!isPaused && !activeVideo && el) {
        // Silky smooth continuous drift (~45px per second)
        const pixelsToMove = (delta / 16.66) * 0.75;
        el.scrollLeft += pixelsToMove;

        // When scrolled past half the duplicate track, seamlessly wrap around
        const halfWidth = el.scrollWidth / 2;
        if (halfWidth > 0 && el.scrollLeft >= halfWidth) {
          el.scrollLeft -= halfWidth;
        }
      }

      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, activeVideo]);

  // Smooth manual scroll controls (Arrow buttons)
  const handleScroll = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = direction === "left" ? -350 : 350;
    el.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });
  };

  // Duplicated list for seamless infinite loop marquee
  const displayItems = [...AUTHOR_TESTIMONIALS, ...AUTHOR_TESTIMONIALS];

  return (
    <section
      id="author-stories"
      className="relative py-20 sm:py-28 overflow-hidden bg-[#154338] border-y border-[#1C5346] text-white select-none"
    >
      {/* Decorative ambient subtle background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#00A859]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Header Badge & Title (Exact match to reference design) */}
        <div className="text-center space-y-3 mb-12 sm:mb-16">
          {/* Translucent pill badge */}
          <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-md bg-white/10 backdrop-blur-md border border-white/20 text-white/95 text-xs sm:text-sm font-medium tracking-wide shadow-sm">
            <span>Real stories and testimonials</span>
          </div>

          {/* Large Bold Headline */}
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-wider text-white drop-shadow-md font-sans">
            FROM OUR AUTHORS
          </h2>

          <p className="max-w-2xl mx-auto text-xs sm:text-sm md:text-base text-emerald-100/80 font-normal leading-relaxed pt-1">
            Over 20,000+ writers turned into published authors across 35+ countries.
            Watch their honest publishing journeys.
          </p>
        </div>
      </div>

      {/* ====================================================================
          CURVED & ANGLED VIDEO REEL CAROUSEL (Signature Arched Wave Track with Active 60fps Auto-Glide)
          ==================================================================== */}
      <div className="relative w-full overflow-hidden py-10 sm:py-14">
        {/* Angled & Curved Ribbon Container: -rotate-[3deg] provides signature tilted slope */}
        <div className="transform -rotate-[3deg] sm:-rotate-[3.5deg] transition-transform duration-500">
          <div
            ref={scrollContainerRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            className="flex items-end gap-5 sm:gap-7 overflow-x-auto no-scrollbar px-6 sm:px-12 md:px-16 pb-8 pt-4 cursor-grab active:cursor-grabbing"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {displayItems.map((item, index) => {
              const yOffset = CURVE_OFFSETS_Y[index % CURVE_OFFSETS_Y.length];
              const rotAngle = CURVE_ROTATIONS[index % CURVE_ROTATIONS.length];

              return (
                <div
                  key={`${item.id}-${index}`}
                  onClick={() => setActiveVideo(item)}
                  className="shrink-0 group cursor-pointer flex flex-col items-start transition-all duration-300 hover:scale-105 hover:-translate-y-3"
                  style={{
                    // Pronounced curved arch & parabolic trajectory
                    transform: `translateY(${yOffset}px) rotate(${rotAngle}deg)`,
                  }}
                >
                  {/* Portrait Video Card Frame */}
                  <div className="relative w-[165px] sm:w-[195px] md:w-[215px] aspect-[9/14] rounded-2xl sm:rounded-[26px] overflow-hidden bg-black shadow-2xl border-2 border-emerald-950/60 ring-1 ring-white/10 group-hover:ring-[#00A859] transition-all duration-300">
                    {/* Thumbnail Image */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.localThumbnail}
                      alt={`${item.authorName} - BookLeaf Publishing Testimonial`}
                      className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = item.fallbackThumbnail;
                      }}
                    />

                    {/* Dark gradient overlay for bottom badge legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/20 pointer-events-none" />

                    {/* Top-Right Badge: YouTube Shorts / Video Pill */}
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[10px] font-semibold text-white/90 border border-white/15 flex items-center gap-1">
                      <Youtube className="w-3 h-3 text-red-500 fill-red-500" />
                      <span>{item.type === "short" ? "Short" : "Video"}</span>
                    </div>

                    {/* Bottom-Left Vibrant Green Circular Play Button (Exact match to reference image) */}
                    <div className="absolute bottom-3 left-3 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#00A859] hover:bg-[#00914c] flex items-center justify-center text-white shadow-lg shadow-black/50 transition-all duration-300 group-hover:scale-115">
                      <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                    </div>

                    {/* Video View Count Chip */}
                    <div className="absolute bottom-3 right-3 text-[10px] text-white/80 font-medium bg-black/40 px-2 py-0.5 rounded">
                      {item.views}
                    </div>
                  </div>

                  {/* Author Name and Book Under Card (Counter-rotated for level, crisp typography) */}
                  <div
                    className="w-[165px] sm:w-[195px] md:w-[215px] pt-3 px-1 text-left space-y-0.5"
                    style={{
                      transform: `rotate(${-rotAngle + 3}deg)`,
                    }}
                  >
                    <p className="text-[#00E07A] text-sm sm:text-base font-bold tracking-wide truncate group-hover:text-emerald-300 transition-colors">
                      {item.displayName}
                    </p>
                    <p className="text-emerald-100/70 text-xs truncate font-medium">
                      {item.bookOrTopic}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation Controls & External Channel Link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-100/70">
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleScroll("left")}
            aria-label="Previous testimonials"
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleScroll("right")}
            aria-label="Next testimonials"
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <span className="hidden sm:inline-block ml-2 text-white/60">
            Click any story to watch on-demand
          </span>
        </div>

        <a
          href="https://www.youtube.com/channel/UCJAAi_L1JH8OZSTbtYZW3OQ"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium transition-all hover:scale-105"
        >
          <Youtube className="w-4 h-4 text-red-500 fill-red-500" />
          <span>Visit Official YouTube Channel (1.58K+ Subs)</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-70" />
        </a>
      </div>

      {/* ====================================================================
          HIGH-DEFINITION MODAL PLAYER (Clean, High-Converting Experience)
          ==================================================================== */}
      {activeVideo && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setActiveVideo(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 bg-slate-950/80 border-b border-slate-800">
              <div className="flex items-center gap-2 min-w-0 pr-4">
                <div className="w-2.5 h-2.5 rounded-full bg-[#00A859] animate-pulse" />
                <div className="min-w-0">
                  <h3 className="text-white text-sm font-bold truncate">
                    {activeVideo.authorName}
                  </h3>
                  <p className="text-slate-400 text-xs truncate">
                    {activeVideo.bookOrTopic}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveVideo(null)}
                aria-label="Close video player"
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Embed Frame */}
            <div className="relative w-full aspect-[9/14] sm:aspect-[9/15] bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeVideo.videoId}?autoplay=1&rel=0&modestbranding=1`}
                title={activeVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            {/* Modal Footer with Publishing CTA */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
              <a
                href={activeVideo.type === "short" ? `https://www.youtube.com/shorts/${activeVideo.videoId}` : `https://www.youtube.com/watch?v=${activeVideo.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <Youtube className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                <span>Open in YouTube</span>
              </a>

              <Link
                href="/create_book"
                onClick={() => setActiveVideo(null)}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#F05262] hover:bg-[#d94151] text-white text-xs font-bold transition-all shadow-md hover:scale-105"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Publish Your Book</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
