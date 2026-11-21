
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Code2,
  Edit3,
  FileText,
  GraduationCap,
  Layers,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import api from "../utils/axios";
import { useAuth } from "../context/AuthContext";

interface Subject {
  _id: string;
  name: string;
}

interface Chapter {
  _id: string;
  name: string;
}

interface Topic {
  _id: string;
  name: string;
}

interface ArticleBlock {
  type: string;
  content?: string;
  text?: string;
  items?: string[];
  url?: string;
  language?: string;
  caption?: string;
}

interface Article {
  _id: string;
  title: string;
  content: ArticleBlock[];
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const selectClass =
  "w-full appearance-none rounded-xl border border-white/10 bg-[#171923] px-4 py-3.5 pr-11 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-40";

export default function Notes() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isAdmin = user?.role === "admin";

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [article, setArticle] = useState<Article | null>(null);

  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get<ApiResponse<Subject[]>>("/notes/subjects");

        setSubjects(response.data.data || []);
      } catch (err) {
        console.error("Failed to fetch subjects:", err);
        setError("Unable to load subjects. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  useEffect(() => {
    if (!selectedSubject) {
      setChapters([]);
      setTopics([]);
      setSelectedChapter("");
      setSelectedTopic("");
      setArticle(null);
      return;
    }

    const fetchChapters = async () => {
      try {
        setLoading(true);
        setError("");
        setSelectedChapter("");
        setSelectedTopic("");
        setTopics([]);
        setArticle(null);

        const response = await api.get<ApiResponse<Chapter[]>>(
          `/notes/subjects/${selectedSubject}/chapters`
        );

        setChapters(response.data.data || []);
      } catch (err) {
        console.error("Failed to fetch chapters:", err);
        setError("Unable to load chapters. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchChapters();
  }, [selectedSubject]);

  useEffect(() => {
    if (!selectedChapter) {
      setTopics([]);
      setSelectedTopic("");
      setArticle(null);
      return;
    }

    const fetchTopics = async () => {
      try {
        setLoading(true);
        setError("");
        setSelectedTopic("");
        setArticle(null);

        const response = await api.get<ApiResponse<Topic[]>>(
          `/notes/chapters/${selectedChapter}/topics`
        );

        setTopics(response.data.data || []);
      } catch (err) {
        console.error("Failed to fetch topics:", err);
        setError("Unable to load topics. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, [selectedChapter]);

  useEffect(() => {
    if (!selectedTopic) {
      setArticle(null);
      return;
    }

    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get<ApiResponse<Article>>(
          `/notes/topics/${selectedTopic}`
        );

        setArticle(response.data.data || null);
      } catch (err) {
        console.error("Failed to fetch article:", err);
        setError("Unable to load notes. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [selectedTopic]);

  const renderBlock = (block: ArticleBlock, index: number) => {
    const content = block.content || block.text || "";

    switch (block.type) {
      case "heading":
        return (
          <h2
            key={index}
            className="mb-4 mt-9 border-l-2 border-blue-500 pl-4 text-xl font-bold text-white"
          >
            {content}
          </h2>
        );

      case "paragraph":
        return (
          <p
            key={index}
            className="mb-5 text-[15px] leading-8 text-slate-300"
          >
            {content}
          </p>
        );

      case "image":
        return (
          <figure key={index} className="my-8">
            {block.url && (
              <img
                src={block.url}
                alt={block.caption || "Notes illustration"}
                loading="lazy"
                className="max-h-[500px] w-full rounded-2xl border border-white/10 object-contain"
              />
            )}
            {block.caption && (
              <figcaption className="mt-3 text-center text-sm text-slate-500">
                {block.caption}
              </figcaption>
            )}
          </figure>
        );

      case "list":
        return (
          <ul
            key={index}
            className="mb-6 space-y-3 pl-6 text-[15px] leading-7 text-slate-300"
          >
            {(block.items || []).map((item, itemIndex) => (
              <li key={itemIndex} className="list-disc marker:text-blue-400">
                {item}
              </li>
            ))}
          </ul>
        );

      case "code":
        return (
          <div
            key={index}
            className="my-6 overflow-hidden rounded-xl border border-white/10 bg-[#0a0c12]"
          >
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
              <Code2 size={15} className="text-blue-400" />
              <span className="text-xs text-slate-400">
                {block.language || "Code"}
              </span>
            </div>
            <pre className="overflow-x-auto p-5">
              <code className="text-sm leading-7 text-emerald-300">
                {content}
              </code>
            </pre>
          </div>
        );

      case "quote":
        return (
          <blockquote
            key={index}
            className="my-6 rounded-r-xl border-l-4 border-blue-500 bg-blue-500/5 px-5 py-4 text-[15px] italic leading-7 text-slate-300"
          >
            {content}
          </blockquote>
        );

      default:
        return null;
    }
  };

  const selectedSubjectName = subjects.find(
    (item) => item._id === selectedSubject
  )?.name;

  const selectedChapterName = chapters.find(
    (item) => item._id === selectedChapter
  )?.name;

  const selectedTopicName = topics.find(
    (item) => item._id === selectedTopic
  )?.name;

  return (
    <div className="min-h-screen bg-[#080a12] px-4 pb-20 pt-10 text-white md:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Hero */}
        <section className="relative mb-10 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#172554] via-[#111827] to-[#10111a] p-7 md:p-10">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 right-1/3 h-60 w-60 rounded-full bg-purple-500/15 blur-3xl" />

          <div className="relative z-10 flex flex-col justify-between gap-7 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-xs font-medium text-blue-300">
                <Sparkles size={14} />
                CS-ROOT LEARNING HUB
              </div>

              <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
                Learn. Understand.
                <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Grow with Notes.
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 md:text-base">
                Explore computer science subjects, study chapters and
                understand important topics with organized learning notes.
              </p>
            </div>

            <div className="flex h-24 w-24 shrink-0 items-center justify-center self-start rounded-3xl border border-white/10 bg-white/5 md:h-32 md:w-32 md:self-center">
              <GraduationCap
                size={64}
                strokeWidth={1.2}
                className="text-blue-300"
              />
            </div>
          </div>
        </section>

        {/* Admin shortcut */}
        {isAdmin && (
          <div className="mb-7 flex flex-col justify-between gap-4 rounded-2xl border border-purple-400/20 bg-purple-500/5 p-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-purple-500/15 p-3 text-purple-300">
                <Edit3 size={21} />
              </div>
              <div>
                <h2 className="font-semibold text-white">
                  Admin Notes Management
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Create, edit and publish study notes.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/admin/notes")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-500"
            >
              Edit Notes
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Selection section */}
        <section className="mb-8 rounded-2xl border border-white/10 bg-[#11141e] p-5 md:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
              <BookOpen size={21} />
            </div>
            <div>
              <h2 className="font-semibold text-white">
                Explore Study Material
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Choose a subject, chapter and topic to begin.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div>
              <label
                htmlFor="notes-subject"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                <Layers size={14} className="mr-2 inline text-blue-400" />
                Select Subject
              </label>

              <div className="relative">
                <select
                  id="notes-subject"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className={selectClass}
                >
                  <option value="">Choose subject</option>
                  {subjects.map((subject) => (
                    <option key={subject._id} value={subject._id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={17}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="notes-chapter"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                <BookOpen size={14} className="mr-2 inline text-purple-400" />
                Select Chapter
              </label>

              <div className="relative">
                <select
                  id="notes-chapter"
                  value={selectedChapter}
                  onChange={(e) => setSelectedChapter(e.target.value)}
                  disabled={!selectedSubject}
                  className={selectClass}
                >
                  <option value="">Choose chapter</option>
                  {chapters.map((chapter) => (
                    <option key={chapter._id} value={chapter._id}>
                      {chapter.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={17}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="notes-topic"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                <FileText size={14} className="mr-2 inline text-emerald-400" />
                Select Topic
              </label>

              <div className="relative">
                <select
                  id="notes-topic"
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  disabled={!selectedChapter}
                  className={selectClass}
                >
                  <option value="">Choose topic</option>
                  {topics.map((topic) => (
                    <option key={topic._id} value={topic._id}>
                      {topic.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={17}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>
          </div>

          {(selectedSubjectName || selectedChapterName || selectedTopicName) && (
            <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4 text-xs text-slate-400">
              <span className="text-slate-500">Your selection:</span>
              {selectedSubjectName && (
                <span className="rounded-lg bg-blue-500/10 px-3 py-1.5 text-blue-300">
                  {selectedSubjectName}
                </span>
              )}
              {selectedChapterName && (
                <span className="rounded-lg bg-purple-500/10 px-3 py-1.5 text-purple-300">
                  {selectedChapterName}
                </span>
              )}
              {selectedTopicName && (
                <span className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-emerald-300">
                  {selectedTopicName}
                </span>
              )}
            </div>
          )}
        </section>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-[#11141e] py-12 text-sm text-blue-300">
            <Loader2 size={20} className="animate-spin" />
            Loading study material...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-sm text-red-300">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>{error}</span>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 rounded-lg border border-red-400/20 px-3 py-2 hover:bg-red-500/10"
              >
                <RefreshCw size={14} />
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Empty subjects */}
        {!loading && !error && subjects.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-[#11141e] px-5 py-12 text-center">
            <BookOpen size={36} className="mx-auto mb-4 text-slate-500" />
            <h3 className="font-semibold text-white">
              No study material available yet
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              Published subjects will appear here.
            </p>
          </div>
        )}

        {/* Article */}
        {!loading && !error && article && (
          <article className="overflow-hidden rounded-2xl border border-white/10 bg-[#11141e]">
            <div className="border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-6 py-6 md:px-9">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-300">
                <CheckCircle2 size={14} />
                Published Study Notes
              </div>

              <h2 className="text-2xl font-bold leading-tight text-white md:text-3xl">
                {article.title}
              </h2>

              <p className="mt-3 text-sm text-slate-400">
                {selectedSubjectName} / {selectedChapterName} / {selectedTopicName}
              </p>
            </div>

            <div className="px-6 py-7 md:px-9 md:py-9">
              {(article.content || []).map((block, index) =>
                renderBlock(block, index)
              )}
            </div>
          </article>
        )}

        {/* No article */}
        {!loading && !error && selectedTopic && !article && (
          <div className="rounded-2xl border border-white/10 bg-[#11141e] px-5 py-12 text-center">
            <FileText size={36} className="mx-auto mb-4 text-slate-500" />
            <h3 className="font-semibold text-white">
              Notes are not available yet
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              Published notes for this topic will appear here.
            </p>
          </div>
        )}

        {/* Initial state */}
        {!loading && !error && !selectedSubject && subjects.length > 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-10 text-center">
            <GraduationCap
              size={38}
              className="mx-auto mb-4 text-blue-400"
            />
            <h3 className="font-semibold text-white">
              Your learning journey starts here
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              Select a subject above to explore its chapters and topics.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
