import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import { generateHTML } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";

import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Hash,
  Loader2,
  UserRound,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const API_URL = import.meta.env.VITE_PUBLIC_BACKEND || "";

interface Resource {
  _id: string;
  title: string;
  slug: string;
  description: string;
  subject: string;
  tags: string[];
  content: any;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    _id: string;
    username: string;
  };
}

const extensions = [
  StarterKit,
  Image.configure({
    inline: false,
    allowBase64: false,
  }),
  Link.configure({
    openOnClick: true,
    HTMLAttributes: {
      target: "_blank",
      rel: "noopener noreferrer",
    },
  }),
];

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const ResourceDetails = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchResource = async () => {
    if (!slug) {
      setError("Invalid resource.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `${API_URL}/resources/${encodeURIComponent(slug)}`,
        {
          withCredentials: true,
        }
      );

      setResource(response.data.data);
    } catch (err: any) {
      console.error("Resource fetch error:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Unable to load this resource."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResource();
  }, [slug]);

  const htmlContent = (() => {
    if (!resource?.content) return "";

    try {
      return generateHTML(resource.content, extensions);
    } catch (error) {
      console.error("Tiptap rendering error:", error);
      return "<p>Unable to render resource content.</p>";
    }
  })();

  return (
    <main className="min-h-screen bg-[#08090d] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-48 left-1/3 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[150px]" />
        <div className="absolute top-[45%] -right-48 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="mb-10 inline-flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-2.5 text-sm text-zinc-400 transition hover:border-white/10 hover:bg-white/[0.06] hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to resources
        </button>

        {/* Loading */}
        {loading && (
          <div className="flex min-h-[50vh] flex-col items-center justify-center">
            <Loader2
              size={35}
              className="animate-spin text-violet-400"
            />

            <p className="mt-5 text-sm text-zinc-500">
              Loading learning material...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-3xl border border-red-500/10 bg-red-500/[0.03] p-10 text-center">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
              <AlertCircle size={25} />
            </div>

            <h2 className="text-xl font-semibold">
              Something went wrong
            </h2>

            <p className="mt-3 max-w-md text-sm leading-6 text-zinc-500">
              {error}
            </p>

            <button
              onClick={fetchResource}
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-zinc-300 transition hover:bg-white/[0.07]"
            >
              <RefreshCw size={15} />
              Retry
            </button>
          </div>
        )}

        {/* Resource */}
        {!loading && !error && resource && (
          <>
            {/* Header */}
            <header className="mb-12">
              {/* Subject */}
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-xl border border-violet-500/20 bg-violet-500/10 px-3.5 py-2 text-sm text-violet-300">
                  <BookOpen size={15} />
                  {resource.subject}
                </span>

                <span className="text-xs text-zinc-600">
                  CS Root Resource
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                {resource.title}
              </h1>

              {/* Description */}
              {resource.description && (
                <p className="mt-6 max-w-3xl text-base leading-8 text-zinc-400 sm:text-lg">
                  {resource.description}
                </p>
              )}

              {/* Meta */}
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-violet-500/10 bg-violet-500/10 text-violet-300">
                    <UserRound size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-zinc-300">
                      {resource.createdBy?.username ||
                        "Unknown author"}
                    </p>

                    <p className="text-xs text-zinc-600">
                      Contributor
                    </p>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <CalendarDays size={16} />
                  {formatDate(resource.createdAt)}
                </div>
              </div>

              {/* Tags */}
              {resource.tags?.length > 0 && (
                <div className="mt-8 flex flex-wrap gap-2">
                  {resource.tags.map((tag, index) => (
                    <span
                      key={`${tag}-${index}`}
                      className="inline-flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-400"
                    >
                      <Hash size={12} className="text-violet-400" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </header>

            {/* Divider */}
            <div className="mb-10 h-px bg-white/[0.06]" />

            {/* Content */}
            <article className="rounded-3xl border border-white/[0.06] bg-[#111217] px-5 py-8 sm:px-10 sm:py-12 lg:px-14">
              <div
                className="resource-content"
                dangerouslySetInnerHTML={{
                  __html: htmlContent,
                }}
              />
            </article>

            {/* Footer */}
            <footer className="mt-12 rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8">
              <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-2 text-violet-400">
                    <BookOpen size={17} />
                    <span className="text-sm font-medium">
                      CS Root
                    </span>
                  </div>

                  <h3 className="mt-3 text-xl font-semibold">
                    Keep learning. Keep growing.
                  </h3>

                  <p className="mt-2 text-sm text-zinc-500">
                    Knowledge becomes more powerful when shared.
                  </p>
                </div>

                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-zinc-300 transition hover:border-violet-500/20 hover:bg-violet-500/[0.07] hover:text-violet-300"
                >
                  Explore more
                  <ArrowUpRight size={16} />
                </button>
              </div>
            </footer>
          </>
        )}
      </div>

      {/* Content Styling */}
      <style>{`
        .resource-content {
          color: #d4d4d8;
          font-size: 16px;
          line-height: 1.85;
          overflow-wrap: break-word;
        }

        .resource-content > *:first-child {
          margin-top: 0;
        }

        .resource-content > *:last-child {
          margin-bottom: 0;
        }

        .resource-content p {
          margin: 1.25rem 0;
          color: #d4d4d8;
        }

        .resource-content h1 {
          font-size: 2.25rem;
          font-weight: 700;
          line-height: 1.25;
          color: #fafafa;
          margin: 2.5rem 0 1.25rem;
        }

        .resource-content h2 {
          font-size: 1.8rem;
          font-weight: 700;
          line-height: 1.3;
          color: #fafafa;
          margin: 2.5rem 0 1.25rem;
        }

        .resource-content h3 {
          font-size: 1.4rem;
          font-weight: 600;
          color: #f4f4f5;
          margin: 2rem 0 1rem;
        }

        .resource-content h4,
        .resource-content h5,
        .resource-content h6 {
          font-weight: 600;
          color: #f4f4f5;
          margin: 1.75rem 0 1rem;
        }

        .resource-content ul {
          list-style: disc;
          padding-left: 1.75rem;
          margin: 1.25rem 0;
        }

        .resource-content ol {
          list-style: decimal;
          padding-left: 1.75rem;
          margin: 1.25rem 0;
        }

        .resource-content li {
          margin: 0.5rem 0;
          padding-left: 0.35rem;
        }

        .resource-content li::marker {
          color: #a78bfa;
        }

        .resource-content blockquote {
          border-left: 3px solid #8b5cf6;
          padding: 1rem 1.5rem;
          margin: 1.75rem 0;
          background: rgba(139,92,246,0.05);
          border-radius: 0 1rem 1rem 0;
          color: #a1a1aa;
        }

        .resource-content blockquote p {
          margin: 0;
        }

        .resource-content hr {
          border: none;
          height: 1px;
          background: rgba(255,255,255,0.08);
          margin: 2.5rem 0;
        }

        .resource-content a {
          color: #a78bfa;
          text-decoration: underline;
          text-decoration-color: rgba(167,139,250,0.4);
          text-underline-offset: 4px;
          transition: 0.2s;
        }

        .resource-content a:hover {
          color: #c4b5fd;
          text-decoration-color: #c4b5fd;
        }

        .resource-content strong {
          color: #fafafa;
          font-weight: 700;
        }

        .resource-content em {
          color: #e4e4e7;
        }

        .resource-content code {
          font-family: monospace;
          background: rgba(139,92,246,0.1);
          border: 1px solid rgba(139,92,246,0.12);
          color: #c4b5fd;
          padding: 0.2rem 0.45rem;
          border-radius: 0.4rem;
          font-size: 0.9em;
        }

        .resource-content pre {
          overflow-x: auto;
          margin: 1.75rem 0;
          padding: 1.5rem;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 1rem;
          background: #090a0e;
        }

        .resource-content pre code {
          background: transparent;
          border: none;
          padding: 0;
          color: #d4d4d8;
          font-size: 14px;
          line-height: 1.7;
        }

        .resource-content img {
          display: block;
          max-width: 100%;
          width: auto;
          height: auto;
          margin: 2rem auto;
          border-radius: 1rem;
          border: 1px solid rgba(255,255,255,0.08);
          object-fit: contain;
        }

        .resource-content img[src=""] {
          display: none;
        }

        .resource-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.75rem 0;
          overflow-x: auto;
        }

        .resource-content th,
        .resource-content td {
          border: 1px solid rgba(255,255,255,0.08);
          padding: 0.75rem 1rem;
          text-align: left;
        }

        .resource-content th {
          background: rgba(139,92,246,0.08);
          color: #fafafa;
        }

        .resource-content td {
          color: #d4d4d8;
        }

        @media (max-width: 640px) {
          .resource-content {
            font-size: 15px;
          }

          .resource-content h1 {
            font-size: 1.8rem;
          }

          .resource-content h2 {
            font-size: 1.5rem;
          }

          .resource-content h3 {
            font-size: 1.25rem;
          }

          .resource-content pre {
            padding: 1rem;
          }
        }
      `}</style>
    </main>
  );
};

export default ResourceDetails;