import { useEffect, useState } from "react";
import api from "../utils/axios";

interface Subject {
  _id: string;
  name: string;
}

interface Topic {
  _id: string;
  name: string;
}

interface Chapter {
  _id: string;
  name: string;
  topics: Topic[];
}

interface ArticleBlock {
  type: "heading" | "paragraph" | "image" | "list" | "code" | "quote";
  text?: string;
  level?: number;
  src?: string;
  alt?: string;
  caption?: string;
  items?: string[];
  language?: string;
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
  const [article, setArticle] = useState<Article | null>(null);

  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedChapterId, setSelectedChapterId] = useState("");

  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [loadingArticle, setLoadingArticle] = useState(false);

  const [error, setError] = useState("");

  // Fetch subjects when the page loads
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoadingSubjects(true);
        setError("");

        const response = await api.get<ApiResponse<Subject[]>>(
          "/notes/subjects"
        );

        setSubjects(response.data.data || []);
      } catch (err) {
        console.error("Error fetching subjects:", err);
        setError("Unable to load subjects. Please try again.");
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, []);

  // Fetch chapters when a subject is selected
  useEffect(() => {
    if (!selectedSubject) {
      setChapters([]);
      setSelectedTopic("");
      setArticle(null);
      return;
    }

    const fetchChapters = async () => {
      try {
        setLoadingChapters(true);
        setError("");
        setSelectedTopic("");
        setArticle(null);

        const response = await api.get<ApiResponse<Chapter[]>>(
          `/notes/subjects/${encodeURIComponent(selectedSubject)}/chapters`
        );

        setChapters(response.data.data || []);
      } catch (err) {
        console.error("Error fetching chapters:", err);
        setError("Unable to load chapters. Please try again.");
      } finally {
        setLoadingChapters(false);
      }
    };

    fetchChapters();
  }, [selectedSubject]);

  // Fetch article when a topic is selected
  useEffect(() => {
    if (!selectedTopic) {
      setArticle(null);
      return;
    }

    const fetchArticle = async () => {
      try {
        setLoadingArticle(true);
        setError("");

        const response = await api.get<ApiResponse<Article>>(
          `/notes/topics/${encodeURIComponent(selectedTopic)}`
        );

        setArticle(response.data.data);
      } catch (err) {
        console.error("Error fetching article:", err);
        setArticle(null);
        setError("Unable to load this article. Please try again.");
      } finally {
        setLoadingArticle(false);
      }
    };

    fetchArticle();
  }, [selectedTopic]);

  const renderBlock = (block: ArticleBlock, index: number) => {
    switch (block.type) {
      case "heading": {
        const level = block.level || 2;

        if (level === 3) {
          return <h3 key={index}>{block.text}</h3>;
        }

        if (level === 4) {
          return <h4 key={index}>{block.text}</h4>;
        }

        return <h2 key={index}>{block.text}</h2>;
      }

      case "paragraph":
        return <p key={index}>{block.text}</p>;

      case "image":
        return (
          <figure key={index}>
            <img
              src={block.src}
              alt={block.alt || "Article image"}
              style={{
                maxWidth: "100%",
                height: "auto",
                borderRadius: "8px",
              }}
            />
            {block.caption && <figcaption>{block.caption}</figcaption>}
          </figure>
        );

      case "list":
        return (
          <ul key={index}>
            {(block.items || []).map((item, itemIndex) => (
              <li key={itemIndex}>{item}</li>
            ))}
          </ul>
        );

      case "code":
        return (
          <pre
            key={index}
            style={{
              background: "#171717",
              color: "#eee",
              padding: "16px",
              borderRadius: "8px",
              overflowX: "auto",
            }}
          >
            <code>{block.text}</code>
          </pre>
        );

      case "quote":
        return <blockquote key={index}>{block.text}</blockquote>;

      default:
        return null;
    }
  };

  return (
    <main
      style={{
        minHeight: "80vh",
        background: "#080808",
        color: "white",
        padding: "40px 6%",
      }}
    >
      <h1 style={{ fontSize: "32px", marginBottom: "10px" }}>
        Study Notes
      </h1>

      <p style={{ color: "#aaa", marginBottom: "30px" }}>
        Select a subject, chapter and topic to explore your notes.
      </p>

      {error && (
        <p style={{ color: "#ff7777", marginBottom: "20px" }}>
          {error}
        </p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "30px",
        }}
      >
        {/* Subject selection */}
        <div>
          <label htmlFor="subject">Subject</label>

          <select
            id="subject"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            disabled={loadingSubjects}
            style={selectStyle}
          >
            <option value="">
              {loadingSubjects ? "Loading subjects..." : "Select subject"}
            </option>

            {subjects.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        {/* Chapter selection */}
        <div>
          <label htmlFor="chapter">Chapter</label>

          <select
            id="chapter"
            disabled={!selectedSubject || loadingChapters}
            onChange={(e) => {
              setSelectedTopic("");
              setArticle(null);

              // Topic selection is handled by the topic selector below.
              const chapter = chapters.find(
                (item) => item._id === e.target.value
              );

              if (chapter) {
                setSelectedChapterId(chapter._id);
              } else {
                setSelectedChapterId("");
              }
            }}
            style={selectStyle}
          >
            <option value="">
              {loadingChapters ? "Loading chapters..." : "Select chapter"}
            </option>

            {chapters.map((chapter) => (
              <option key={chapter._id} value={chapter._id}>
                {chapter.name}
              </option>
            ))}
          </select>
        </div>

        {/* Topic selection */}
        <div>
          <label htmlFor="topic">Topic</label>

          <select
            id="topic"
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            disabled={!selectedChapterId}
            style={selectStyle}
          >
            <option value="">Select topic</option>

            {chapters
              .find((chapter) => chapter._id === selectedChapterId)
              ?.topics.map((topic) => (
                <option key={topic._id} value={topic._id}>
                  {topic.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Article display */}
      <section
        style={{
          background: "#141414",
          padding: "24px",
          borderRadius: "12px",
          lineHeight: 1.7,
        }}
      >
        {loadingArticle ? (
          <p>Loading article...</p>
        ) : article ? (
          <>
            <h1>{article.title}</h1>

            <div>
              {article.content.map((block, index) =>
                renderBlock(block, index)
              )}
            </div>
          </>
        ) : (
          <p style={{ color: "#aaa" }}>
            Select a topic to view its notes.
          </p>
        )}
      </section>
    </main>
  );
}

const selectStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "12px",
  marginTop: "8px",
  background: "#1d1d1d",
  color: "white",
  border: "1px solid #444",
  borderRadius: "8px",
};