import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Send, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/axios";

type NoteItem = {
  _id: string;
  name: string;
  isPublished: boolean;
};

type ArticleBlock = {
  type: "heading" | "paragraph" | "quote" | "code" | "list" | "image";
  content?: string;
  items?: string[];
  url?: string;
  caption?: string;
  language?: string;
};

type NoteArticle = {
  _id: string;
  title: string;
  status: "draft" | "published";
  content: ArticleBlock[];
};

type Props = {
  isAdmin: boolean;
};

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-400";

const labelClass = "mb-2 block text-sm font-medium text-gray-700";

const buttonClass =
  "rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40";

const NotesManagement = ({ isAdmin }: Props) => {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState<NoteItem[]>([]);
  const [chapters, setChapters] = useState<NoteItem[]>([]);
  const [topics, setTopics] = useState<NoteItem[]>([]);

  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");

  const [subjectName, setSubjectName] = useState("");
  const [chapterName, setChapterName] = useState("");
  const [topicName, setTopicName] = useState("");
  const [articleTitle, setArticleTitle] = useState("");

  const [blocks, setBlocks] = useState<ArticleBlock[]>([
    { type: "paragraph", content: "" },
  ]);

  const [article, setArticle] = useState<NoteArticle | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [message, setMessage] = useState("");

  const getResponseData = <T,>(response: { data: { data: T } }): T =>
    response.data.data;

  const getError = (error: unknown) => {
    const err = error as {
      response?: { data?: { message?: string } };
    };

    return err.response?.data?.message || "Something went wrong.";
  };

  const showStatus = (published: boolean) => (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
        published ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
      }`}
    >
      {published ? "Published" : "Draft"}
    </span>
  );

  // Load all subjects, including drafts.
  const loadSubjects = async () => {
    try {
      setPageLoading(true);
      const response = await api.get("/notes/admin/subjects");
      setSubjects(getResponseData<NoteItem[]>(response));
    } catch (error) {
      setMessage(getError(error));
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  // Load all chapters of selected subject.
  useEffect(() => {
    setSelectedChapter("");
    setSelectedTopic("");
    setChapters([]);
    setTopics([]);
    setArticle(null);

    if (!selectedSubject) return;

    const loadChapters = async () => {
      try {
        const response = await api.get(
          `/notes/admin/subjects/${selectedSubject}/chapters`,
        );
        setChapters(getResponseData<NoteItem[]>(response));
      } catch (error) {
        setMessage(getError(error));
      }
    };

    loadChapters();
  }, [selectedSubject]);

  // Load all topics of selected chapter.
  useEffect(() => {
    setSelectedTopic("");
    setTopics([]);
    setArticle(null);

    if (!selectedChapter) return;

    const loadTopics = async () => {
      try {
        const response = await api.get(
          `/notes/admin/chapters/${selectedChapter}/topics`,
        );
        setTopics(getResponseData<NoteItem[]>(response));
      } catch (error) {
        setMessage(getError(error));
      }
    };

    loadTopics();
  }, [selectedChapter]);

  // Load existing article of selected topic.
  useEffect(() => {
    setArticle(null);
    setArticleTitle("");
    setBlocks([{ type: "paragraph", content: "" }]);

    if (!selectedTopic) return;

    const loadArticle = async () => {
      try {
        const response = await api.get(
          `/notes/admin/topics/${selectedTopic}/article`,
        );

        const existingArticle = getResponseData<NoteArticle | null>(response);

        setArticle(existingArticle);

        if (existingArticle) {
          setArticleTitle(existingArticle.title);
          setBlocks(existingArticle.content || []);
        }
      } catch (error) {
        setMessage(getError(error));
      }
    };

    loadArticle();
  }, [selectedTopic]);

  // Create subject.
  const createSubject = async () => {
    if (subjectName.trim().length < 2) {
      setMessage("Subject name must contain at least 2 characters.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await api.post("/notes/admin/subjects", {
        name: subjectName.trim(),
        displayOrder: subjects.length,
      });

      const created = getResponseData<NoteItem>(response);

      setSubjects((current) => [...current, created]);
      setSelectedSubject(created._id);
      setSubjectName("");
      setMessage("Subject created as draft.");
    } catch (error) {
      setMessage(getError(error));
    } finally {
      setLoading(false);
    }
  };

  // Publish subject.
  const publishSubject = async () => {
    if (!selectedSubject) return;

    setLoading(true);
    setMessage("");

    try {
      await api.patch(`/notes/admin/subjects/${selectedSubject}/publish`);

      setSubjects((current) =>
        current.map((item) =>
          item._id === selectedSubject ? { ...item, isPublished: true } : item,
        ),
      );

      setMessage("Subject published successfully.");
    } catch (error) {
      setMessage(getError(error));
    } finally {
      setLoading(false);
    }
  };

  // Create chapter.
  const createChapter = async () => {
    if (!selectedSubject || chapterName.trim().length < 2) {
      setMessage("Select a subject and enter a valid chapter name.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await api.post("/notes/admin/chapters", {
        subjectId: selectedSubject,
        name: chapterName.trim(),
        displayOrder: chapters.length,
      });

      const created = getResponseData<NoteItem>(response);

      setChapters((current) => [...current, created]);
      setSelectedChapter(created._id);
      setChapterName("");
      setMessage("Chapter created as draft.");
    } catch (error) {
      setMessage(getError(error));
    } finally {
      setLoading(false);
    }
  };

  // Publish chapter.
  const publishChapter = async () => {
    if (!selectedChapter) return;

    setLoading(true);
    setMessage("");

    try {
      await api.patch(`/notes/admin/chapters/${selectedChapter}/publish`);

      setChapters((current) =>
        current.map((item) =>
          item._id === selectedChapter ? { ...item, isPublished: true } : item,
        ),
      );

      setMessage("Chapter published successfully.");
    } catch (error) {
      setMessage(getError(error));
    } finally {
      setLoading(false);
    }
  };

  // Create topic.
  const createTopic = async () => {
    if (!selectedChapter || topicName.trim().length < 2) {
      setMessage("Select a chapter and enter a valid topic name.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await api.post("/notes/admin/topics", {
        chapterId: selectedChapter,
        name: topicName.trim(),
        displayOrder: topics.length,
      });

      const created = getResponseData<NoteItem>(response);

      setTopics((current) => [...current, created]);
      setSelectedTopic(created._id);
      setTopicName("");
      setMessage("Topic created as draft.");
    } catch (error) {
      setMessage(getError(error));
    } finally {
      setLoading(false);
    }
  };

  // Publish topic.
  const publishTopic = async () => {
    if (!selectedTopic) return;

    setLoading(true);
    setMessage("");

    try {
      await api.patch(`/notes/admin/topics/${selectedTopic}/publish`);

      setTopics((current) =>
        current.map((item) =>
          item._id === selectedTopic ? { ...item, isPublished: true } : item,
        ),
      );

      setMessage("Topic published successfully.");
    } catch (error) {
      setMessage(getError(error));
    } finally {
      setLoading(false);
    }
  };

  // Update a content block.
  const updateBlock = (index: number, changes: Partial<ArticleBlock>) => {
    setBlocks((current) =>
      current.map((block, i) =>
        i === index ? { ...block, ...changes } : block,
      ),
    );
  };

  // Create article.
  const createArticle = async () => {
    if (!selectedTopic) {
      setMessage("Select a topic first.");
      return;
    }

    if (articleTitle.trim().length < 3) {
      setMessage("Article title must contain at least 3 characters.");
      return;
    }

    const validBlocks = blocks.filter((block) => {
      if (block.type === "image") {
        return !!block.url?.trim();
      }

      if (block.type === "list") {
        return !!block.items?.some((item) => item.trim());
      }

      return !!block.content?.trim();
    });

    if (validBlocks.length === 0) {
      setMessage("Add at least one content block.");
      return;
    }

    const content = validBlocks.map((block) => {
      if (block.type === "image") {
        return {
          type: "image",
          url: block.url,
          ...(block.caption ? { caption: block.caption } : {}),
        };
      }

      if (block.type === "list") {
        return {
          type: "list",
          items: block.items?.filter((item) => item.trim()),
        };
      }

      return {
        type: block.type,
        content: block.content,
        ...(block.type === "code" && block.language
          ? { language: block.language }
          : {}),
      };
    });

    setLoading(true);
    setMessage("");

    try {
      const response = await api.post("/notes/admin/articles", {
        topicId: selectedTopic,
        title: articleTitle.trim(),
        content,
      });

      const created = getResponseData<NoteArticle>(response);

      setArticle(created);
      setMessage("Article created as draft.");
    } catch (error) {
      setMessage(getError(error));
    } finally {
      setLoading(false);
    }
  };
  // Update existing article.
  const saveArticleChanges = async () => {
    if (!article) return;

    if (articleTitle.trim().length < 3) {
      setMessage("Article title must contain at least 3 characters.");
      return;
    }

    const validBlocks = blocks.filter((block) => {
      if (block.type === "image") return !!block.url?.trim();
      if (block.type === "list") {
        return !!block.items?.some((item) => item.trim());
      }
      return !!block.content?.trim();
    });

    if (validBlocks.length === 0) {
      setMessage("Add at least one content block.");
      return;
    }

    const content = validBlocks.map((block) => {
      if (block.type === "image") {
        return {
          type: "image",
          url: block.url,
          ...(block.caption ? { caption: block.caption } : {}),
        };
      }

      if (block.type === "list") {
        return {
          type: "list",
          items: block.items?.filter((item) => item.trim()),
        };
      }

      return {
        type: block.type,
        content: block.content,
        ...(block.type === "code" && block.language
          ? { language: block.language }
          : {}),
      };
    });

    setLoading(true);
    setMessage("");

    try {
      const response = await api.put(`/notes/admin/articles/${article._id}`, {
        title: articleTitle.trim(),
        content,
      });

      const updated = getResponseData<NoteArticle>(response);
      setArticle(updated);
      setIsEditing(false);
      setMessage("Article updated successfully.");
    } catch (error) {
      setMessage(getError(error));
    } finally {
      setLoading(false);
    }
  };

  // Publish existing article.
  const publishArticle = async () => {
    if (!article) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await api.patch(
        `/notes/admin/articles/${article._id}/publish`,
      );

      const updated = getResponseData<NoteArticle>(response);

      setArticle(updated);
      setMessage("Article published successfully.");
    } catch (error) {
      setMessage(getError(error));
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Access denied
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            You do not have permission to access this page.
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-5 rounded-lg bg-gray-900 px-5 py-2.5 text-sm text-white"
          >
            Go home
          </button>
        </div>
      </div>
    );
  }

  const selectedSubjectItem = subjects.find(
    (item) => item._id === selectedSubject,
  );

  const selectedChapterItem = chapters.find(
    (item) => item._id === selectedChapter,
  );

  const selectedTopicItem = topics.find((item) => item._id === selectedTopic);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900">
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin")}
              className="rounded-lg border border-gray-200 p-2"
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <h1 className="font-semibold">Notes Management</h1>
              <p className="text-xs text-gray-500">
                Create and publish learning notes
              </p>
            </div>
          </div>

          <button
            onClick={loadSubjects}
            disabled={pageLoading}
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-5 py-8">
        {message && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            {message}
          </div>
        )}

        {pageLoading && (
          <p className="text-sm text-gray-500">Loading subjects...</p>
        )}

        {/* SUBJECT */}
        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 font-semibold">1. Subject</h2>

          <label className={labelClass}>Create new subject</label>

          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              className={inputClass}
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              placeholder="e.g. Computer Science"
            />

            <button
              className={buttonClass}
              disabled={loading}
              onClick={createSubject}
            >
              <Plus className="mr-1 inline" size={16} />
              Create
            </button>
          </div>

          <label className={`${labelClass} mt-5`}>Select subject</label>

          <select
            className={inputClass}
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="">Choose subject</option>
            {subjects.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name} ({item.isPublished ? "Published" : "Draft"})
              </option>
            ))}
          </select>

          {selectedSubjectItem && (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {showStatus(selectedSubjectItem.isPublished)}

              {!selectedSubjectItem.isPublished && (
                <button
                  className={buttonClass}
                  disabled={loading}
                  onClick={publishSubject}
                >
                  <Send className="mr-1 inline" size={15} />
                  Publish subject
                </button>
              )}
            </div>
          )}
        </section>

        {/* CHAPTER */}
        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 font-semibold">2. Chapter</h2>

          <label className={labelClass}>
            Create chapter under selected subject
          </label>

          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              className={inputClass}
              value={chapterName}
              onChange={(e) => setChapterName(e.target.value)}
              placeholder="e.g. Introduction"
            />

            <button
              className={buttonClass}
              disabled={loading || !selectedSubject}
              onClick={createChapter}
            >
              <Plus className="mr-1 inline" size={16} />
              Create
            </button>
          </div>

          <label className={`${labelClass} mt-5`}>Select chapter</label>

          <select
            className={inputClass}
            value={selectedChapter}
            onChange={(e) => setSelectedChapter(e.target.value)}
            disabled={!selectedSubject}
          >
            <option value="">Choose chapter</option>
            {chapters.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name} ({item.isPublished ? "Published" : "Draft"})
              </option>
            ))}
          </select>

          {selectedChapterItem && (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {showStatus(selectedChapterItem.isPublished)}

              {!selectedChapterItem.isPublished && (
                <button
                  className={buttonClass}
                  disabled={loading}
                  onClick={publishChapter}
                >
                  <Send className="mr-1 inline" size={15} />
                  Publish chapter
                </button>
              )}
            </div>
          )}
        </section>

        {/* TOPIC */}
        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 font-semibold">3. Topic</h2>

          <label className={labelClass}>
            Create topic under selected chapter
          </label>

          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              className={inputClass}
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              placeholder="e.g. What is Computer Science?"
            />

            <button
              className={buttonClass}
              disabled={loading || !selectedChapter}
              onClick={createTopic}
            >
              <Plus className="mr-1 inline" size={16} />
              Create
            </button>
          </div>

          <label className={`${labelClass} mt-5`}>Select topic</label>

          <select
            className={inputClass}
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            disabled={!selectedChapter}
          >
            <option value="">Choose topic</option>
            {topics.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name} ({item.isPublished ? "Published" : "Draft"})
              </option>
            ))}
          </select>

          {selectedTopicItem && (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {showStatus(selectedTopicItem.isPublished)}

              {!selectedTopicItem.isPublished && (
                <button
                  className={buttonClass}
                  disabled={loading}
                  onClick={publishTopic}
                >
                  <Send className="mr-1 inline" size={15} />
                  Publish topic
                </button>
              )}
            </div>
          )}
        </section>

        {/* ARTICLE */}
        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-2 font-semibold">4. Article</h2>

          <p className="mb-5 text-sm text-gray-500">
            Create or publish an article for the selected topic.
          </p>

          {!selectedTopic ? (
            <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
              Select a topic to view or create its article.
            </p>
          ) : article && !isEditing ? (
            <div className="rounded-lg border border-gray-200 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-semibold">{article.title}</h3>

                <div className="flex items-center gap-3">
                  {showStatus(article.status === "published")}

                  <button
                    type="button"
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Article
                  </button>
                </div>
              </div>

              <p className="mt-2 text-xs text-gray-500">
                Article ID: {article._id}
              </p>

              <p className="mt-4 text-sm text-gray-600">
                {article.content?.length || 0} content blocks saved.
              </p>

              {article.status === "draft" && (
                <button
                  className={`${buttonClass} mt-5`}
                  disabled={
                    loading ||
                    !selectedTopicItem?.isPublished ||
                    !selectedChapterItem?.isPublished ||
                    !selectedSubjectItem?.isPublished
                  }
                  onClick={publishArticle}
                >
                  <Send className="mr-1 inline" size={15} />
                  Publish article
                </button>
              )}

              {article.status === "draft" &&
                (!selectedTopicItem?.isPublished ||
                  !selectedChapterItem?.isPublished ||
                  !selectedSubjectItem?.isPublished) && (
                  <p className="mt-3 text-xs text-amber-700">
                    Publish the parent subject, chapter and topic before
                    publishing this article.
                  </p>
                )}

              {article.status === "published" && (
                <p className="mt-4 text-sm text-green-700">
                  This article is already published.
                </p>
              )}
            </div>
          ) : (
            <>
              <label className={labelClass}>Article title</label>

              <input
                className={inputClass}
                value={articleTitle}
                onChange={(e) => setArticleTitle(e.target.value)}
                placeholder="Enter article title"
              />

              <div className="mt-5 space-y-4">
                {blocks.map((block, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-gray-200 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Content block {index + 1}
                      </span>

                      <button
                        type="button"
                        className="text-xs text-red-600"
                        onClick={() =>
                          setBlocks((current) =>
                            current.filter((_, i) => i !== index),
                          )
                        }
                      >
                        Remove
                      </button>
                    </div>

                    <label className={labelClass}>Block type</label>

                    <select
                      className={inputClass}
                      value={block.type}
                      onChange={(e) => {
                        const type = e.target.value as ArticleBlock["type"];

                        updateBlock(index, {
                          type,
                          content: "",
                          items: type === "list" ? [""] : undefined,
                          url: "",
                          caption: "",
                          language: "",
                        });
                      }}
                    >
                      <option value="heading">Heading</option>
                      <option value="paragraph">Paragraph</option>
                      <option value="quote">Quote</option>
                      <option value="code">Code</option>
                      <option value="list">List</option>
                      <option value="image">Image URL</option>
                    </select>

                    {block.type === "image" ? (
                      <div className="mt-3 space-y-3">
                        <input
                          className={inputClass}
                          value={block.url || ""}
                          onChange={(e) =>
                            updateBlock(index, { url: e.target.value })
                          }
                          placeholder="https://example.com/image.jpg"
                        />

                        <input
                          className={inputClass}
                          value={block.caption || ""}
                          onChange={(e) =>
                            updateBlock(index, { caption: e.target.value })
                          }
                          placeholder="Image caption (optional)"
                        />
                      </div>
                    ) : block.type === "list" ? (
                      <div className="mt-3 space-y-2">
                        {(block.items || [""]).map((item, itemIndex) => (
                          <input
                            key={itemIndex}
                            className={inputClass}
                            value={item}
                            onChange={(e) => {
                              const items = [...(block.items || [""])];
                              items[itemIndex] = e.target.value;
                              updateBlock(index, { items });
                            }}
                            placeholder={`List item ${itemIndex + 1}`}
                          />
                        ))}

                        <button
                          type="button"
                          className="text-sm font-medium text-blue-700"
                          onClick={() =>
                            updateBlock(index, {
                              items: [...(block.items || []), ""],
                            })
                          }
                        >
                          + Add list item
                        </button>
                      </div>
                    ) : (
                      <div className="mt-3 space-y-3">
                        <textarea
                          className={`${inputClass} resize-y`}
                          rows={block.type === "code" ? 6 : 4}
                          value={block.content || ""}
                          onChange={(e) =>
                            updateBlock(index, { content: e.target.value })
                          }
                          placeholder={`Write ${block.type} content...`}
                        />

                        {block.type === "code" && (
                          <input
                            className={inputClass}
                            value={block.language || ""}
                            onChange={(e) =>
                              updateBlock(index, {
                                language: e.target.value,
                              })
                            }
                            placeholder="Language (e.g. javascript)"
                          />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="mt-4 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium hover:bg-gray-50"
                onClick={() =>
                  setBlocks((current) => [
                    ...current,
                    { type: "paragraph", content: "" },
                  ])
                }
              >
                <Plus className="mr-1 inline" size={16} />
                Add content block
              </button>

              <div>
                <button
                  className={`${buttonClass} mt-6`}
                  disabled={loading}
                  onClick={article ? saveArticleChanges : createArticle}
                >
                  {article ? "Save Changes" : "Save article as draft"}
                </button>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default NotesManagement;
