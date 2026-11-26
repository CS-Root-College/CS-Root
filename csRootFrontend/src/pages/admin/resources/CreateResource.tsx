import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { EditorContent, useEditor } from "@tiptap/react";
import { generateHTML } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  X,
  Trash2,
  Send,
  Eye,
  Plus,
  ArrowLeft,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { useAuth } from "../../../context/AuthContext";

const API_URL = import.meta.env.VITE_PUBLIC_BACKEND || "";

const extensions = [
  StarterKit,
  Image.configure({
    inline: false,
    allowBase64: false,
  }),
  Link.configure({
    openOnClick: false,
    autolink: true,
    defaultProtocol: "https",
  }),
];

export default function CreateResource() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();

  const imageInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success">("error");
  const [publishing, setPublishing] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const editor = useEditor({
    extensions,
    content: {
      type: "doc",
      content: [{ type: "paragraph" }],
    },
    editorProps: {
      attributes: {
        class:
          "resource-editor prose prose-lg max-w-none focus:outline-none min-h-[420px] px-6 py-6",
      },
    },
  });

  /* ----------------------------- TAGS ----------------------------- */

  const addTag = () => {
    const value = tagInput.trim().replace(/^#/, "");

    if (!value) return;

    if (tags.includes(value)) {
      setTagInput("");
      return;
    }

    if (tags.length >= 10) {
      setMessageType("error");
      setMessage("You can add a maximum of 10 tags.");
      return;
    }

    setTags((prev) => [...prev, value]);
    setTagInput("");
    setMessage("");
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((item) => item !== tag));
  };

  /* ---------------------------- IMAGES ---------------------------- */

  const selectImage = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setMessageType("error");
      setMessage("Please select a valid image.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessageType("error");
      setMessage("Images must be smaller than 10MB.");
      return;
    }

    if (!editor) return;

    if (images.length >= 20) {
      setMessageType("error");
      setMessage("You can upload a maximum of 20 images.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setImages((prev) => [...prev, file]);
    setImageUrls((prev) => [...prev, previewUrl]);

    editor
      .chain()
      .focus()
      .setImage({ src: previewUrl, alt: file.name })
      .run();

    setMessage("");
  };

  const removeImage = (index: number) => {
    const url = imageUrls[index];

    if (url && editor) {
      const positions: number[] = [];

      editor.state.doc.descendants((node, position) => {
        if (node.type.name === "image" && node.attrs.src === url) {
          positions.push(position);
        }
      });

      const transaction = editor.state.tr;

      positions.forEach((position) => {
        const node = transaction.doc.nodeAt(position);

        if (node) {
          transaction.delete(position, position + node.nodeSize);
        }
      });

      if (positions.length) {
        editor.view.dispatch(transaction);
      }
    }

    if (url) {
      URL.revokeObjectURL(url);
    }

    setImages((prev) => prev.filter((_, i) => i !== index));
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  /* --------------------------- VALIDATION --------------------------- */

  const validate = () => {
    if (isLoading) {
      setMessageType("error");
      setMessage("Please wait while authentication is loading.");
      return false;
    }

    if (!isAuthenticated || !user) {
      setMessageType("error");
      setMessage("You must be logged in to publish a resource.");
      return false;
    }

    if (!title.trim()) {
      setMessageType("error");
      setMessage("Please enter a resource title.");
      return false;
    }

    if (title.trim().length > 150) {
      setMessageType("error");
      setMessage("Title must be less than 150 characters.");
      return false;
    }

    if (!subject.trim()) {
      setMessageType("error");
      setMessage("Please enter a subject.");
      return false;
    }

    if (!description.trim()) {
      setMessageType("error");
      setMessage("Please enter a description.");
      return false;
    }

    if (!editor) {
      setMessageType("error");
      setMessage("Editor is not ready.");
      return false;
    }

    const content = editor.getJSON();
    const text = editor.getText().trim();

    const hasImages = (() => {
      let found = false;

      content.content?.forEach((node: any) => {
        if (node.type === "image") found = true;

        node.content?.forEach((child: any) => {
          if (child.type === "image") found = true;
        });
      });

      return found;
    })();

    if (!text && !hasImages) {
      setMessageType("error");
      setMessage("Your resource content cannot be empty.");
      return false;
    }

    return true;
  };

  /* --------------------------- PUBLISH --------------------------- */

  const publish = async () => {
    if (!validate() || !editor) return;

    setPublishing(true);
    setMessage("");

    try {
      const contentJSON = editor.getJSON();

      const formData = new FormData();

      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("subject", subject.trim());
      formData.append("tags", JSON.stringify(tags));

      /*
       * IMPORTANT:
       * We map images by their exact editor src.
       * The file index is based on actual FormData upload order.
       */

      const imageMapping: Record<string, string> = {};
      const uploadFiles: File[] = [];
      const processedImageUrls = new Set<string>();

      const traverseAndMapImages = (node: any) => {
        if (!node) return;

        if (
          node.type === "image" &&
          typeof node.attrs?.src === "string" &&
          node.attrs.src.startsWith("blob:")
        ) {
          const src = node.attrs.src;

          if (!processedImageUrls.has(src)) {
            processedImageUrls.add(src);

            const fileIndex = imageUrls.indexOf(src);
            const file = fileIndex !== -1 ? images[fileIndex] : undefined;

            if (!file) {
              throw new Error(
                "An image exists in the editor but its original file is missing. Remove and insert the image again."
              );
            }

            const uploadIndex = uploadFiles.length;

            uploadFiles.push(file);
            imageMapping[src] = `upload://${uploadIndex}`;
          }
        }

        if (node.content) {
          node.content.forEach(traverseAndMapImages);
        }
      };

      traverseAndMapImages(contentJSON);

      /*
       * Make sure every blob image has a valid mapped upload.
       */

      const replaceImageSources = (node: any) => {
        if (!node) return;

        if (node.type === "image" && node.attrs?.src) {
          const src = node.attrs.src;

          if (src.startsWith("blob:")) {
            const mappedSrc = imageMapping[src];

            if (!mappedSrc) {
              throw new Error(
                "An image could not be mapped to its uploaded file. Please reinsert the image."
              );
            }

            node.attrs.src = mappedSrc;
          }
        }

        if (node.content) {
          node.content.forEach(replaceImageSources);
        }
      };

      replaceImageSources(contentJSON);

      /*
       * Append files in exactly the same order
       * as their upload:// references.
       */

      uploadFiles.forEach((file) => {
        formData.append("images", file);
      });

      formData.append("content", JSON.stringify(contentJSON));

      const response = await axios.post(
        `${API_URL}/resources/create-resource`,
        formData,
        {
          withCredentials: true,
        }
      );

      setMessageType("success");

      setMessage(
        response.data?.message || "Resource published successfully!"
      );

      navigate("/resources");
    } catch (error: any) {
      console.error("Resource publishing error:", error);

      setMessageType("error");

      setMessage(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to publish resource."
      );
    } finally {
      setPublishing(false);
    }
  };

  /* --------------------------- PREVIEW --------------------------- */

  const getPreviewHTML = () => {
    if (!editor) return "";

    try {
      return generateHTML(editor.getJSON(), extensions);
    } catch {
      return "";
    }
  };

  /* ----------------------------- LINK ----------------------------- */

  const setLink = () => {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href;

    const url = window.prompt("Enter URL", previousUrl || "https://");

    if (url === null) return;

    if (url.trim() === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor.chain().focus().setLink({ href: url }).run();
  };

  /* ---------------------------- TOOLBAR ---------------------------- */

  const toolbarButton = (
    icon: React.ReactNode,
    action: () => void,
    active = false,
    disabled = false,
    label = ""
  ) => (
    <button
      type="button"
      onClick={action}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`group flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-30 ${
        active
          ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
          : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
      }`}
    >
      {icon}
    </button>
  );

  /* -------------------------- AUTH STATES -------------------------- */

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl bg-white px-6 py-5 shadow-sm border border-slate-200">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          <p className="font-medium text-slate-600">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-xl shadow-slate-200/50">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <FileText size={30} />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-3">
            Authentication Required
          </h1>

          <p className="text-slate-500 mb-6">
            You need to log in before creating a resource.
          </p>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition shadow-lg shadow-indigo-200"
          >
            Login to Continue
          </button>
        </div>
      </div>
    );
  }

  /* ---------------------------- UI ---------------------------- */

  return (
    <div className="min-h-screen bg-[#f5f7fb] px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mt-1 flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="text-indigo-600" size={18} />

                <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
                  Creator Studio
                </span>
              </div>

              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Create Resource
              </h1>

              <p className="mt-2 text-slate-500">
                Create, format and share knowledge with CS Root.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
          >
            <Eye size={18} />
            Preview
          </button>
        </div>

        {/* MAIN LAYOUT */}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">

          {/* MAIN FORM */}

          <div className="space-y-6">

            {/* DETAILS CARD */}

            <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-8">
              <div className="mb-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <FileText size={20} />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-900">
                      Resource Details
                    </h2>

                    <p className="text-sm text-slate-500">
                      Introduce your learning material.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">

                {/* TITLE */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Resource Title
                  </label>

                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Give your resource a meaningful title..."
                    maxLength={150}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  />

                  <div className="mt-2 flex justify-end">
                    <span className="text-xs text-slate-400">
                      {title.length}/150
                    </span>
                  </div>
                </div>

                {/* DESCRIPTION */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Description
                  </label>

                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="What will readers learn from this resource?"
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  />
                </div>

                {/* SUBJECT */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Subject
                  </label>

                  <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Computer Networks, DSA, Web Development..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  />
                </div>
              </div>
            </section>

            {/* TAG CARD */}

            <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-8">
              <div className="mb-5">
                <h2 className="font-bold text-slate-900">
                  Tags
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Help people discover your resource.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Add a tag..."
                  className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                />

                <button
                  type="button"
                  onClick={addTag}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-indigo-600"
                >
                  <Plus size={18} />
                  Add Tag
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700"
                  >
                    #{tag}

                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="rounded-full p-0.5 transition hover:bg-indigo-200"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}

                {tags.length === 0 && (
                  <p className="text-sm text-slate-400">
                    Your tags will appear here.
                  </p>
                )}
              </div>
            </section>

            {/* EDITOR */}

            <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">

              {/* EDITOR HEADER */}

              <div className="border-b border-slate-100 p-5 sm:p-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <Sparkles size={20} />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-900">
                      Content Editor
                    </h2>

                    <p className="text-sm text-slate-500">
                      Write and format your resource.
                    </p>
                  </div>
                </div>
              </div>

              {/* TOOLBAR */}

              <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 p-3 backdrop-blur-xl sm:p-4">
                <div className="flex flex-wrap items-center gap-1">

                  {editor &&
                    toolbarButton(
                      <Bold size={18} />,
                      () =>
                        editor.chain().focus().toggleBold().run(),
                      editor.isActive("bold"),
                      false,
                      "Bold"
                    )}

                  {editor &&
                    toolbarButton(
                      <Italic size={18} />,
                      () =>
                        editor.chain().focus().toggleItalic().run(),
                      editor.isActive("italic"),
                      false,
                      "Italic"
                    )}

                  {editor &&
                    toolbarButton(
                      <Strikethrough size={18} />,
                      () =>
                        editor.chain().focus().toggleStrike().run(),
                      editor.isActive("strike"),
                      false,
                      "Strikethrough"
                    )}

                  <div className="mx-2 h-7 w-px bg-slate-200" />

                  {editor &&
                    toolbarButton(
                      <Heading1 size={18} />,
                      () =>
                        editor
                          .chain()
                          .focus()
                          .toggleHeading({ level: 1 })
                          .run(),
                      editor.isActive("heading", { level: 1 }),
                      false,
                      "Heading 1"
                    )}

                  {editor &&
                    toolbarButton(
                      <Heading2 size={18} />,
                      () =>
                        editor
                          .chain()
                          .focus()
                          .toggleHeading({ level: 2 })
                          .run(),
                      editor.isActive("heading", { level: 2 }),
                      false,
                      "Heading 2"
                    )}

                  <div className="mx-2 h-7 w-px bg-slate-200" />

                  {editor &&
                    toolbarButton(
                      <List size={18} />,
                      () =>
                        editor
                          .chain()
                          .focus()
                          .toggleBulletList()
                          .run(),
                      editor.isActive("bulletList"),
                      false,
                      "Bullet List"
                    )}

                  {editor &&
                    toolbarButton(
                      <ListOrdered size={18} />,
                      () =>
                        editor
                          .chain()
                          .focus()
                          .toggleOrderedList()
                          .run(),
                      editor.isActive("orderedList"),
                      false,
                      "Ordered List"
                    )}

                  {editor &&
                    toolbarButton(
                      <Quote size={18} />,
                      () =>
                        editor
                          .chain()
                          .focus()
                          .toggleBlockquote()
                          .run(),
                      editor.isActive("blockquote"),
                      false,
                      "Quote"
                    )}

                  {editor &&
                    toolbarButton(
                      <Code size={18} />,
                      () =>
                        editor
                          .chain()
                          .focus()
                          .toggleCodeBlock()
                          .run(),
                      editor.isActive("codeBlock"),
                      false,
                      "Code Block"
                    )}

                  <div className="mx-2 h-7 w-px bg-slate-200" />

                  {editor &&
                    toolbarButton(
                      <LinkIcon size={18} />,
                      setLink,
                      editor.isActive("link"),
                      false,
                      "Link"
                    )}

                  {editor &&
                    toolbarButton(
                      <ImageIcon size={18} />,
                      () => imageInputRef.current?.click(),
                      false,
                      false,
                      "Insert Image"
                    )}

                  <div className="mx-2 h-7 w-px bg-slate-200" />

                  {editor &&
                    toolbarButton(
                      <Undo size={18} />,
                      () => editor.chain().focus().undo().run(),
                      false,
                      !editor.can().undo(),
                      "Undo"
                    )}

                  {editor &&
                    toolbarButton(
                      <Redo size={18} />,
                      () => editor.chain().focus().redo().run(),
                      false,
                      !editor.can().redo(),
                      "Redo"
                    )}
                </div>
              </div>

              {/* CONTENT */}

              <EditorContent editor={editor} />

              {/* IMAGE INPUT */}

              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];

                  if (file) selectImage(file);

                  e.target.value = "";
                }}
              />

              <div className="border-t border-slate-100 px-5 py-4 sm:px-8">
                <p className="text-sm text-slate-400">
                  Use the toolbar to format content, add links, code,
                  lists, quotes and images.
                </p>
              </div>
            </section>

            {/* IMAGES */}

            {images.length > 0 && (
              <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-8">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-slate-900">
                      Image Attachments
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {images.length} image{images.length !== 1 ? "s" : ""} attached
                    </p>
                  </div>

                  <span className="rounded-xl bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-600">
                    {images.length}/20
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {images.map((image, index) => (
                    <div
                      key={`${image.name}-${index}`}
                      className="group overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                    >
                      <div className="relative">
                        <img
                          src={imageUrls[index]}
                          alt={image.name}
                          className="h-48 w-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 text-red-500 shadow-lg transition hover:bg-red-500 hover:text-white"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="p-4">
                        <p className="truncate text-sm font-semibold text-slate-700">
                          {image.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {(image.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* FEEDBACK */}

            {message && (
              <div
                className={`flex items-start gap-3 rounded-2xl border p-4 ${
                  messageType === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {messageType === "success" ? (
                  <CheckCircle2 className="mt-0.5 shrink-0" size={20} />
                ) : (
                  <AlertCircle className="mt-0.5 shrink-0" size={20} />
                )}

                <p className="text-sm font-medium">{message}</p>
              </div>
            )}

            {/* ACTIONS */}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-2xl border border-slate-200 bg-white px-6 py-3.5 font-semibold text-slate-600 transition hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Eye size={18} />
                Preview
              </button>

              <button
                type="button"
                onClick={publish}
                disabled={publishing || isLoading || !isAuthenticated}
                className="flex items-center justify-center gap-3 rounded-2xl bg-indigo-600 px-7 py-3.5 font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {publishing ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Publish Resource
                  </>
                )}
              </button>
            </div>
          </div>

          {/* SIDEBAR */}

          <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">

            {/* GUIDE */}

            <div className="overflow-hidden rounded-3xl bg-slate-900 p-6 text-white shadow-xl shadow-slate-200">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-indigo-300">
                <Sparkles size={24} />
              </div>

              <h3 className="text-xl font-bold">
                Create something valuable.
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                A well-structured resource makes learning easier
                and helps the CS Root community grow.
              </p>

              <div className="mt-6 space-y-4">
                {[
                  "Use a clear and descriptive title",
                  "Write a useful description",
                  "Organize content with headings",
                  "Add examples and images",
                  "Use relevant tags",
                ].map((item, index) => (
                  <div key={item} className="flex gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-300">
                      {index + 1}
                    </div>

                    <p className="text-sm text-slate-300">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* PROGRESS */}

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-bold text-slate-900">
                Resource Checklist
              </h3>

              <div className="mt-5 space-y-4">
                {[
                  {
                    label: "Title",
                    done: title.trim().length > 0,
                  },
                  {
                    label: "Description",
                    done: description.trim().length > 0,
                  },
                  {
                    label: "Subject",
                    done: subject.trim().length > 0,
                  },
                  {
                    label: "Content",
                    done:
                      !!editor &&
                      editor.getText().trim().length > 0,
                  },
                  {
                    label: "Tags",
                    done: tags.length > 0,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-slate-600">
                      {item.label}
                    </span>

                    {item.done ? (
                      <CheckCircle2
                        size={18}
                        className="text-emerald-500"
                      />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-slate-200" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* INFO */}

            <div className="rounded-3xl border border-indigo-100 bg-indigo-50/70 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-600">
                  <FileText size={20} />
                </div>

                <h3 className="font-bold text-indigo-900">
                  Publishing Tips
                </h3>
              </div>

              <p className="mt-4 text-sm leading-6 text-indigo-800/80">
                Your resource will be submitted to CS Root.
                Make sure your content is clear, useful and
                properly organized before publishing.
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* PREVIEW MODAL */}

      {previewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md"
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-5 backdrop-blur">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                  Preview Mode
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Resource Preview
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-red-50 hover:text-red-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* PREVIEW CONTENT */}

            <div className="p-6 sm:p-10">
              <div className="mx-auto max-w-3xl">
                <div className="mb-6 flex flex-wrap gap-2">
                  {subject && (
                    <span className="rounded-full bg-violet-50 px-3 py-1.5 text-sm font-semibold text-violet-700">
                      {subject}
                    </span>
                  )}

                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-600"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <h1 className="text-3xl font-black leading-tight text-slate-900 sm:text-5xl">
                  {title || "Untitled Resource"}
                </h1>

                <p className="mt-5 text-lg leading-8 text-slate-500">
                  {description || "No description provided."}
                </p>

                <div className="my-8 h-px bg-slate-200" />

                <div
                  className="resource-preview-content prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: getPreviewHTML(),
                  }}
                />
              </div>
            </div>

            {/* FOOTER */}

            <div className="flex justify-end border-t border-slate-200 bg-slate-50 p-5">
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-indigo-600"
              >
                Back to Editor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STYLES */}

      <style>{`
        .resource-editor {
          color: #1e293b;
          line-height: 1.8;
        }

        .resource-editor p {
          margin: 1em 0;
        }

        .resource-editor h1 {
          font-size: 2rem;
          font-weight: 800;
          line-height: 1.3;
          color: #0f172a;
          margin: 1.5rem 0 1rem;
        }

        .resource-editor h2 {
          font-size: 1.5rem;
          font-weight: 700;
          line-height: 1.4;
          color: #0f172a;
          margin: 1.3rem 0 0.8rem;
        }

        .resource-editor ul {
          list-style-type: disc;
          padding-left: 1.5rem;
        }

        .resource-editor ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
        }

        .resource-editor blockquote {
          border-left: 4px solid #6366f1;
          background: #f5f3ff;
          padding: 1rem 1.25rem;
          border-radius: 0 1rem 1rem 0;
          color: #475569;
          margin: 1.5rem 0;
        }

        .resource-editor pre {
          background: #0f172a;
          color: #e2e8f0;
          padding: 1.25rem;
          border-radius: 1rem;
          overflow-x: auto;
          margin: 1.5rem 0;
        }

        .resource-editor code {
          background: #f1f5f9;
          padding: 0.2rem 0.4rem;
          border-radius: 0.4rem;
          font-size: 0.9em;
        }

        .resource-editor pre code {
          background: transparent;
          padding: 0;
        }

        .resource-editor a {
          color: #4f46e5;
          text-decoration: underline;
        }

        .resource-editor img {
          max-width: 100%;
          height: auto;
          border-radius: 1rem;
          margin: 1.5rem auto;
          display: block;
        }

        .resource-editor > *:first-child {
          margin-top: 0;
        }

        .resource-editor > *:last-child {
          margin-bottom: 0;
        }

        .resource-preview-content {
          color: #334155;
          line-height: 1.8;
        }

        .resource-preview-content h1 {
          font-size: 2rem;
          font-weight: 800;
          color: #0f172a;
          margin: 2rem 0 1rem;
        }

        .resource-preview-content h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0f172a;
          margin: 1.5rem 0 1rem;
        }

        .resource-preview-content blockquote {
          border-left: 4px solid #6366f1;
          background: #f5f3ff;
          padding: 1rem 1.25rem;
          border-radius: 0 1rem 1rem 0;
        }

        .resource-preview-content img {
          max-width: 100%;
          height: auto;
          border-radius: 1rem;
          margin: 2rem auto;
        }

        .resource-preview-content pre {
          background: #0f172a;
          color: #e2e8f0;
          padding: 1.25rem;
          border-radius: 1rem;
          overflow-x: auto;
        }

        .resource-preview-content ul {
          list-style: disc;
          padding-left: 1.5rem;
        }

        .resource-preview-content ol {
          list-style: decimal;
          padding-left: 1.5rem;
        }
      `}</style>
    </div>
  );
}