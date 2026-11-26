import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { EditorContent, useEditor } from "@tiptap/react";
import { generateHTML } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import {
  ArrowLeft,
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Code,
  Undo2,
  Redo2,
  ImagePlus,
  Link2,
  Minus,
  Eye,
  Send,
  Loader2,
  X,
  FileText
} from "lucide-react";

type Props = { isAdmin?: boolean };

type ToolProps = {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

const API_URL = import.meta.env.VITE_PUBLIC_BACKEND || "";

const extensions = [
  StarterKit,
  Image.configure({
    inline: false,
    allowBase64: false
  }),
  Link.configure({
    openOnClick: false,
    autolink: true,
    defaultProtocol: "https"
  })
];

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-100 placeholder:text-gray-400";

const ToolButton = ({
  label,
  active = false,
  disabled = false,
  onClick,
  children
}: ToolProps) => (
  <button
    type="button"
    title={label}
    aria-label={label}
    disabled={disabled}
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    className={`rounded-lg p-2.5 transition ${
      active
        ? "bg-gray-900 text-white shadow-sm"
        : "text-gray-600 hover:bg-gray-200 hover:text-gray-950"
    } disabled:cursor-not-allowed disabled:opacity-30`}
  >
    {children}
  </button>
);

const CreateResource = (_props: Props) => {
  const navigate = useNavigate();
  const imageInput = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [, setEditorRevision] = useState(0);

  const editor = useEditor({
    extensions,
    content: {
      type: "doc",
      content: [{ type: "paragraph" }]
    },
    onUpdate: () => setEditorRevision((v) => v + 1),
    onSelectionUpdate: () => setEditorRevision((v) => v + 1),
    editorProps: {
      attributes: {
        class: "min-h-[520px] px-6 py-7 outline-none text-gray-800 leading-8",
        spellcheck: "true"
      }
    }
  });

  const addTag = () => {
    const value = tagInput.trim().toLowerCase();

    if (!value || tags.includes(value)) {
      setTagInput("");
      return;
    }

    if (tags.length >= 10 || value.length > 30) return;

    setTags((current) => [...current, value]);
    setTagInput("");
  };

  const selectImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage("Images cannot exceed 10 MB.");
      event.target.value = "";
      return;
    }

    if (!editor) {
      event.target.value = "";
      return;
    }

    const index = images.length;

    setImages((current) => [...current, file]);

    editor
      .chain()
      .focus()
      .setImage({
        src: `upload://${index}`,
        alt: file.name,
        title: file.name
      })
      .run();

    setMessage("");
    event.target.value = "";
  };

  const addLink = () => {
    if (!editor) return;

    const previous = editor.getAttributes("link").href || "";
    const url = window.prompt("Enter URL", previous);

    if (url === null) return;

    if (!url.trim()) {
      editor.chain().focus().unsetLink().run();
      return;
    }

    const normalized = /^https?:\/\//i.test(url)
      ? url
      : `https://${url}`;

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: normalized })
      .run();
  };

  const getContentWithPreviewImages = () => {
    const json = editor?.getJSON();

    if (!json) return null;

    const cloned = JSON.parse(JSON.stringify(json));

    const replace = (node: any) => {
      if (
        node?.type === "image" &&
        typeof node.attrs?.src === "string" &&
        node.attrs.src.startsWith("upload://")
      ) {
        const index = Number(
          node.attrs.src.slice("upload://".length)
        );

        if (Number.isInteger(index) && images[index]) {
          node.attrs.src = URL.createObjectURL(images[index]);
        }
      }

      node?.content?.forEach(replace);
    };

    replace(cloned);

    return cloned;
  };

  const validate = () => {
    if (!title.trim() || !subject.trim() || !description.trim()) {
      setMessage("Please complete the title, description and subject.");
      return false;
    }

    if (!editor?.getText().trim()) {
      setMessage("Please write some resource content.");
      return false;
    }

    const json = editor.getJSON();
    const imageSources: string[] = [];

    const collect = (node: any) => {
      if (node?.type === "image" && node.attrs?.src) {
        imageSources.push(node.attrs.src);
      }

      node?.content?.forEach(collect);
    };

    collect(json);

    for (const src of imageSources.filter(
      (s) => typeof s === "string" && s.startsWith("upload://")
    )) {
      const index = Number(src.slice("upload://".length));

      if (
        !Number.isInteger(index) ||
        index < 0 ||
        !images[index]
      ) {
        setMessage("An image in the content is missing its file.");
        return false;
      }
    }

    setMessage("");
    return true;
  };

  const openPreview = () => {
    if (!validate()) return;

    setPreviewOpen(true);
  };

  const publish = async () => {
    if (publishing || !validate() || !editor) return;

    setPublishing(true);
    setMessage("");

    try {
      const content = editor.getJSON();
      const imageSources: string[] = [];

      const collect = (node: any) => {
        if (node?.type === "image" && node.attrs?.src) {
          imageSources.push(node.attrs.src);
        }

        node?.content?.forEach(collect);
      };

      collect(content);

      const referencedIndexes = [
        ...new Set(
          imageSources
            .filter(
              (s) => typeof s === "string" && s.startsWith("upload://")
            )
            .map((s) => Number(s.slice("upload://".length)))
        )
      ];

      const fileIndexes = new Map<number, number>();
      const filesToUpload: File[] = [];

      referencedIndexes.forEach((oldIndex) => {
        if (images[oldIndex]) {
          fileIndexes.set(oldIndex, filesToUpload.length);
          filesToUpload.push(images[oldIndex]);
        }
      });

      const remap = (node: any) => {
        if (
          node?.type === "image" &&
          typeof node.attrs?.src === "string" &&
          node.attrs.src.startsWith("upload://")
        ) {
          const oldIndex = Number(
            node.attrs.src.slice("upload://".length)
          );

          if (fileIndexes.has(oldIndex)) {
            node.attrs.src = `upload://${fileIndexes.get(oldIndex)}`;
          }
        }

        node?.content?.forEach(remap);
      };

      remap(content);

      const formData = new FormData();

      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("subject", subject.trim());
      formData.append("tags", JSON.stringify(tags));
      formData.append("content", JSON.stringify(content));

      filesToUpload.forEach((file) => {
        formData.append("images", file);
      });

      const response = await axios.post(
        `${API_URL}/resources/create-resource`,
        formData,
        {
          withCredentials: true
        }
      );

      setPreviewOpen(false);
      setMessage(
        response.data?.message || "Resource published successfully."
      );

      setTimeout(() => navigate("/admin/resources"), 1000);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setMessage(
          error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            "Failed to publish resource."
        );
      } else {
        setMessage(
          error instanceof Error
            ? error.message
            : "Something went wrong while publishing."
        );
      }
    } finally {
      setPublishing(false);
    }
  };

  const previewHTML = (() => {
    const content = getContentWithPreviewImages();

    if (!content) return "";

    try {
      return generateHTML(content, extensions);
    } catch {
      return "";
    }
  })();

  return (
    <div className="min-h-screen bg-[#f6f7f9] text-gray-900">
      <header className="sticky top-0 z-30 border-b border-gray-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-xl border border-gray-200 p-2.5 text-gray-600 transition hover:bg-gray-100"
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <h1 className="font-semibold">Create resource</h1>
              <p className="text-xs text-gray-500">
                Put your knowledge into words
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openPreview}
            className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-700"
          >
            <Eye size={17} />
            Review
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] space-y-6 px-5 py-8 lg:px-8">
        {message && (
          <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">
            {message}
          </div>
        )}

        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-7 flex items-center gap-3">
            <div className="rounded-xl bg-gray-100 p-3">
              <FileText size={20} />
            </div>

            <div>
              <h2 className="font-semibold">Resource details</h2>
              <p className="text-sm text-gray-500">
                Give readers a reason to explore
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Title
              </label>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                placeholder="A clear, useful title"
                className={`${inputClass} text-lg font-medium`}
              />

              <p className="mt-2 text-right text-xs text-gray-400">
                {title.length}/200
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Briefly explain what this resource covers..."
                className={`${inputClass} resize-y`}
              />

              <p className="mt-2 text-right text-xs text-gray-400">
                {description.length}/500
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Subject
              </label>

              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Computer Networks"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Topics
              </label>

              <div className="flex gap-2">
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Add a keyword and press Enter"
                  className={inputClass}
                />

                <button
                  type="button"
                  onClick={addTag}
                  className="rounded-xl border border-gray-200 px-4 transition hover:bg-gray-50"
                >
                  Add
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-2 text-xs font-medium text-gray-700"
                  >
                    {tag}

                    <button
                      type="button"
                      onClick={() =>
                        setTags((current) =>
                          current.filter((item) => item !== tag)
                        )
                      }
                      className="text-gray-400 hover:text-red-600"
                    >
                      <X size={13} />
                    </button>
                  </span>
                ))}
              </div>

              <p className="mt-2 text-xs text-gray-400">
                Up to 10 topics
              </p>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-5 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gray-100 p-3">
                <FileText size={20} />
              </div>

              <div>
                <h2 className="font-semibold">Your content</h2>
                <p className="text-sm text-gray-500">
                  Write, format and add images wherever they belong
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 p-3">
            <ToolButton
              label="Bold"
              active={!!editor?.isActive("bold")}
              onClick={() => editor?.chain().focus().toggleBold().run()}
            >
              <Bold size={17} />
            </ToolButton>

            <ToolButton
              label="Italic"
              active={!!editor?.isActive("italic")}
              onClick={() => editor?.chain().focus().toggleItalic().run()}
            >
              <Italic size={17} />
            </ToolButton>

            <ToolButton
              label="Strikethrough"
              active={!!editor?.isActive("strike")}
              onClick={() => editor?.chain().focus().toggleStrike().run()}
            >
              <Strikethrough size={17} />
            </ToolButton>

            <span className="mx-1 h-6 w-px bg-gray-200" />

            <ToolButton
              label="Heading 1"
              active={!!editor?.isActive("heading", { level: 1 })}
              onClick={() =>
                editor?.chain().focus().toggleHeading({ level: 1 }).run()
              }
            >
              <Heading1 size={18} />
            </ToolButton>

            <ToolButton
              label="Heading 2"
              active={!!editor?.isActive("heading", { level: 2 })}
              onClick={() =>
                editor?.chain().focus().toggleHeading({ level: 2 }).run()
              }
            >
              <Heading2 size={18} />
            </ToolButton>

            <span className="mx-1 h-6 w-px bg-gray-200" />

            <ToolButton
              label="Bullet list"
              active={!!editor?.isActive("bulletList")}
              onClick={() =>
                editor?.chain().focus().toggleBulletList().run()
              }
            >
              <List size={18} />
            </ToolButton>

            <ToolButton
              label="Numbered list"
              active={!!editor?.isActive("orderedList")}
              onClick={() =>
                editor?.chain().focus().toggleOrderedList().run()
              }
            >
              <ListOrdered size={18} />
            </ToolButton>

            <ToolButton
              label="Blockquote"
              active={!!editor?.isActive("blockquote")}
              onClick={() =>
                editor?.chain().focus().toggleBlockquote().run()
              }
            >
              <Quote size={17} />
            </ToolButton>

            <ToolButton
              label="Code block"
              active={!!editor?.isActive("codeBlock")}
              onClick={() =>
                editor?.chain().focus().toggleCodeBlock().run()
              }
            >
              <Code size={17} />
            </ToolButton>

            <span className="mx-1 h-6 w-px bg-gray-200" />

            <ToolButton
              label="Link"
              active={!!editor?.isActive("link")}
              onClick={addLink}
            >
              <Link2 size={17} />
            </ToolButton>

            <ToolButton
              label="Insert image"
              onClick={() => imageInput.current?.click()}
            >
              <ImagePlus size={17} />
            </ToolButton>

            <ToolButton
              label="Horizontal line"
              onClick={() =>
                editor?.chain().focus().setHorizontalRule().run()
              }
            >
              <Minus size={18} />
            </ToolButton>

            <span className="mx-1 h-6 w-px bg-gray-200" />

            <ToolButton
              label="Undo"
              disabled={!editor?.can().undo()}
              onClick={() => editor?.chain().focus().undo().run()}
            >
              <Undo2 size={17} />
            </ToolButton>

            <ToolButton
              label="Redo"
              disabled={!editor?.can().redo()}
              onClick={() => editor?.chain().focus().redo().run()}
            >
              <Redo2 size={17} />
            </ToolButton>

            <input
              ref={imageInput}
              type="file"
              accept="image/*"
              hidden
              onChange={selectImage}
            />
          </div>

          <div className="min-h-[560px] px-2 py-2 [&_.tiptap]:min-h-[520px] [&_.tiptap]:outline-none [&_.tiptap_h1]:mb-4 [&_.tiptap_h1]:mt-6 [&_.tiptap_h1]:text-3xl [&_.tiptap_h1]:font-bold [&_.tiptap_h2]:mb-3 [&_.tiptap_h2]:mt-5 [&_.tiptap_h2]:text-2xl [&_.tiptap_h2]:font-semibold [&_.tiptap_p]:mb-3 [&_.tiptap_ul]:mb-4 [&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-6 [&_.tiptap_ol]:mb-4 [&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:pl-6 [&_.tiptap_blockquote]:my-4 [&_.tiptap_blockquote]:border-l-4 [&_.tiptap_blockquote]:border-gray-300 [&_.tiptap_blockquote]:pl-4 [&_.tiptap_blockquote]:italic [&_.tiptap_pre]:my-4 [&_.tiptap_pre]:overflow-x-auto [&_.tiptap_pre]:rounded-xl [&_.tiptap_pre]:bg-gray-900 [&_.tiptap_pre]:p-4 [&_.tiptap_pre]:text-gray-100 [&_.tiptap_code]:rounded [&_.tiptap_code]:bg-gray-100 [&_.tiptap_code]:px-1 [&_.tiptap_code]:py-0.5 [&_.tiptap_a]:text-blue-600 [&_.tiptap_a]:underline [&_.tiptap_img]:mx-auto [&_.tiptap_img]:my-5 [&_.tiptap_img]:block [&_.tiptap_img]:h-auto [&_.tiptap_img]:max-h-[450px] [&_.tiptap_img]:max-w-full [&_.tiptap_img]:rounded-xl [&_.tiptap_img]:object-contain [&_.tiptap_hr]:my-6">
            <EditorContent editor={editor} />
          </div>

          <div className="border-t border-gray-100 px-6 py-4">
            <p className="text-xs text-gray-400">
              {editor?.getText().trim().split(/\s+/).filter(Boolean).length || 0} words
              {" · "}
              {images.length} image file(s) added
            </p>
          </div>
        </section>
      </main>

      {previewOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4 sm:p-8">
          <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  Review before publishing
                </p>
                <h2 className="font-semibold">Resource preview</h2>
              </div>

              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="rounded-xl p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 sm:p-10">
              <div className="mb-8">
                <p className="text-sm font-medium text-gray-500">
                  {subject}
                </p>

                <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  {title}
                </h1>

                <p className="mt-4 text-lg leading-7 text-gray-600">
                  {description}
                </p>

                {tags.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div
                className="prose prose-gray max-w-none [&_h1]:mb-4 [&_h1]:mt-6 [&_h1]:text-3xl [&_h1]:font-bold [&_h2]:mb-3 [&_h2]:mt-5 [&_h2]:text-2xl [&_h2]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_img]:mx-auto [&_img]:my-6 [&_img]:block [&_img]:h-auto [&_img]:max-h-[450px] [&_img]:max-w-full [&_img]:rounded-xl [&_img]:object-contain"
                dangerouslySetInnerHTML={{ __html: previewHTML }}
              />
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-200 bg-gray-50 px-5 py-4 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Back to editing
              </button>

              <button
                type="button"
                disabled={publishing}
                onClick={publish}
                className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-700 disabled:opacity-60"
              >
                {publishing ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <Send size={17} />
                )}

                {publishing ? "Publishing..." : "Publish resource"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateResource;