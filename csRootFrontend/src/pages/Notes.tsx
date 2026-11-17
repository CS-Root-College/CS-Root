
import { useEffect, useState } from "react";
import api from "../utils/axios";

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

export default function Notes() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [article, setArticle] = useState<Article | null>(null);

  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch subjects
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

  // Fetch chapters when subject changes
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

  // Fetch topics when chapter changes
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

        // Topics are returned through the chapter's data.
        const response = await api.get<ApiResponse<Topic[]>>(
          `/notes/chapters/${selectedChapter}/topics`
        );

        setTopics(response.data.data || []);
      } catch (err) {
        console.error("Failed to fetch topics:", err);
        setError("Unable to load topics. Please check the backend API.");
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, [selectedChapter]);

  // Fetch article when topic changes
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
          <h2 key={index} className="text-2xl font-bold text-white mt-6 mb-3">
            {content}
          </h2>
        );

      case "paragraph":
        return (
          <p key={index} className="text-zinc-300 leading-7 mb-4">
            {content}
          </p>
        );

      case "image":
        return (
          <figure key={index} className="my-6">
            {block.url && (
              <img
                src={block.url}
                alt={block.caption || "Notes illustration"}
                className="rounded-xl max-w-full h-auto"
              />
            )}
            {block.caption && (
              <figcaption className="text-sm text-zinc-500 mt-2">
                {block.caption}
              </figcaption>
            )}
          </figure>
        );

      case "list":
        return (
          <ul key={index} className="list-disc pl-6 text-zinc-300 mb-4 space-y-2">
            {(block.items || []).map((item, itemIndex) => (
              <li key={itemIndex}>{item}</li>
            ))}
          </ul>
        );

      case "code":
        return (
          <pre
            key={index}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 overflow-x-auto my-4"
          >
            <code className="text-green-300 text-sm">
              {content}
            </code>
          </pre>
        );

      case "quote":
        return (
          <blockquote
            key={index}
            className="border-l-4 border-blue-500 pl-4 py-2 text-zinc-300 italic my-4"
          >
            {content}
          </blockquote>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">
            Study Notes
          </h1>
          <p className="text-zinc-400 mt-2">
            Explore subjects, chapters and topics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div>
            <label className="block text-sm text-zinc-400 mb-2">
              Select Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3"
            >
              <option value="">Choose subject</option>
              {subjects.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">
              Select Chapter
            </label>
            <select
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(e.target.value)}
              disabled={!selectedSubject}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 disabled:opacity-50"
            >
              <option value="">Choose chapter</option>
              {chapters.map((chapter) => (
                <option key={chapter._id} value={chapter._id}>
                  {chapter.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">
              Select Topic
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              disabled={!selectedChapter}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 disabled:opacity-50"
            >
              <option value="">Choose topic</option>
              {topics.map((topic) => (
                <option key={topic._id} value={topic._id}>
                  {topic.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading && (
          <p className="text-blue-400 py-6">Loading...</p>
        )}

        {error && (
          <p className="text-red-400 py-4">{error}</p>
        )}

        {!loading && !error && subjects.length === 0 && (
          <p className="text-zinc-400 py-6">
            No published subjects available yet.
          </p>
        )}

        {!loading && article && (
          <article className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 md:p-8">
            <h2 className="text-2xl font-bold mb-6">
              {article.title}
            </h2>

            <div>
              {(article.content || []).map((block, index) =>
                renderBlock(block, index)
              )}
            </div>
          </article>
        )}

        {!loading && selectedTopic && !article && !error && (
          <p className="text-zinc-400 py-6">
            No published notes available for this topic.
          </p>
        )}
      </div>
    </div>
  );
}
