"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Code2,
  ExternalLink,
  Lock,
  ShieldCheck,
} from "lucide-react";

interface OpenApiPathItem {
  [method: string]: {
    tags?: string[];
    summary?: string;
    responses?: Record<string, { description: string }>;
  };
}

interface OpenApiSpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
  };
  paths: Record<string, OpenApiPathItem>;
}

export default function ApiDocsPage() {
  const [spec, setSpec] = useState<OpenApiSpec | null>(null);

  useEffect(() => {
    fetch("/api/docs")
      .then((r) => r.json())
      .then((data) => setSpec(data))
      .catch(() => {});
  }, []);

  const methodColors: Record<string, string> = {
    get: "bg-sky-100 text-sky-900 border-sky-300",
    post: "bg-emerald-100 text-emerald-900 border-emerald-300",
    patch: "bg-amber-100 text-amber-900 border-amber-300",
    delete: "bg-rose-100 text-rose-900 border-rose-300",
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-up">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 mb-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Back to Portal Home
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1B4D7E] text-white">
                <Code2 className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h1 className="font-serif text-2xl font-bold text-slate-900">
                  REST API & OpenAPI 3.0 Reference
                </h1>
                <p className="text-xs text-slate-600">
                  Protected by HTTP-only JWT Session Middleware, Role-Based
                  Access Control (AUTHOR / ADMIN), and Zod Input Validation
                </p>
              </div>
            </div>
          </div>

          <a
            href="/api/docs"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0E2842] px-4 py-2 text-xs font-semibold text-white hover:bg-[#163f68]"
          >
            <span>Raw OpenAPI 3.0 JSON</span>
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>

        {/* Security Architecture Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <Lock className="h-4 w-4 text-[#1B4D7E]" aria-hidden="true" />
              Authentication Middleware
            </div>
            <p className="text-slate-600">
              Every route verifies the signed <code className="font-mono">bookleaf_session</code> HTTP-only cookie or <code className="font-mono">Authorization: Bearer</code> token.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <ShieldCheck
                className="h-4 w-4 text-emerald-600"
                aria-hidden="true"
              />
              Strict Ownership & RBAC
            </div>
            <p className="text-slate-600">
              Authors can only read/write their own <code className="font-mono">author_id</code> records; <code className="font-mono">internal_notes</code> are strictly isolated to <code className="font-mono">ADMIN</code>.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <CheckCircle2
                className="h-4 w-4 text-amber-600"
                aria-hidden="true"
              />
              Zod Schema Validation
            </div>
            <p className="text-slate-600">
              All request payloads and AI JSON outputs are validated via strict Zod schemas—returning structured <code className="font-mono">400</code> errors instead of generic 500s.
            </p>
          </div>
        </div>

        {/* Endpoints List */}
        {!spec ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 rounded-xl animate-shimmer" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(spec.paths).map(([pathUrl, methods]) =>
              Object.entries(methods).map(([method, meta]) => (
                <div
                  key={`${method}-${pathUrl}`}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span
                        className={`rounded-md border px-2.5 py-0.5 font-mono text-xs font-bold uppercase ${
                          methodColors[method] || "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {method}
                      </span>
                      <code className="font-mono text-sm font-bold text-slate-900">
                        {pathUrl}
                      </code>
                      {meta.tags?.[0] && (
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                          {meta.tags[0]}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600">{meta.summary}</p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 shrink-0">
                    {meta.responses &&
                      Object.keys(meta.responses).map((statusCode) => (
                        <span
                          key={statusCode}
                          className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[11px] text-slate-700"
                          title={meta.responses?.[statusCode]?.description}
                        >
                          HTTP {statusCode}
                        </span>
                      ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
