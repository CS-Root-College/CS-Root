
import { useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { EditorContent, useEditor } from "@tiptap/react";
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
    X,
    Plus,
    Save,
    FileText,
    Upload,
    Sparkles,
    BookOpen,
    CheckCircle2,
    Loader2,
} from "lucide-react";

type CreateResourceProps = {
    isAdmin: boolean;
};

type ToolButtonProps = {
    label: string;
    active?: boolean;
    disabled?: boolean;
    onClick: () => void;
    children: ReactNode;
};

const API_URL = import.meta.env.VITE_API_URL || "";

const ToolButton = ({
    label,
    active = false,
    disabled = false,
    onClick,
    children,
}: ToolButtonProps) => (
    <button
        type="button"
        title={label}
        aria-label={label}
        disabled={disabled}
        onMouseDown={(event) => event.preventDefault()}
        onClick={onClick}
        className={`rounded-lg p-2.5 transition ${
            active
                ? "bg-gray-900 text-white"
                : "text-gray-600 hover:bg-gray-200 hover:text-gray-950"
        } disabled:cursor-not-allowed disabled:opacity-30`}
    >
        {children}
    </button>
);

const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-100";

const CreateResource = ({ isAdmin }: CreateResourceProps) => {
    const navigate = useNavigate();
    const imageInput = useRef<HTMLInputElement>(null);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [subject, setSubject] = useState("");
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [message, setMessage] = useState("");
    const [images, setImages] = useState<File[]>([]);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Image.configure({
                inline: false,
            }),
            Link.configure({
                openOnClick: false,
                autolink: true,
                defaultProtocol: "https",
            }),
        ],
        content: {
            type: "doc",
            content: [{ type: "paragraph" }],
        },
        editorProps: {
            attributes: {
                class: "min-h-[450px] px-6 py-6 outline-none text-gray-800 leading-8",
                spellcheck: "true",
            },
        },
    });

    if (!isAdmin) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Access denied
                    </h1>
                    <p className="mt-2 text-sm text-gray-500">
                        You do not have permission to access this page.
                    </p>
                    <button
                        onClick={() => navigate("/")}
                        className="mt-5 rounded-xl bg-gray-900 px-5 py-3 text-sm text-white transition hover:bg-gray-700"
                    >
                        Go home
                    </button>
                </div>
            </div>
        );
    }

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

    const selectImage = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setMessage("Please select a valid image.");
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

        editor.chain().focus().setImage({
            src: `upload://${index}`,
            alt: file.name,
            title: file.name,
        }).run();

        setMessage("");
        event.target.value = "";
    };

    const addLink = () => {
        if (!editor) return;

        const previousUrl = editor.getAttributes("link").href || "";
        const url = window.prompt("Enter URL", previousUrl);

        if (url === null) return;

        if (!url.trim()) {
            editor.chain().focus().unsetLink().run();
            return;
        }

        const normalizedUrl = /^https?:\/\//i.test(url)
            ? url
            : `https://${url}`;

        editor.chain().focus().extendMarkRange("link").setLink({
            href: normalizedUrl,
        }).run();
    };

    const handleSave = async () => {
        if (saving) return;

        if (!title.trim() || !subject.trim()) {
            setMessage("Please enter a title and subject.");
            return;
        }

        if (!editor?.getText().trim()) {
            setMessage("Please write some resource content.");
            return;
        }

        const content = editor.getJSON();

        const imageNodes: string[] = [];

        const findImages = (node: any) => {
            if (!node || typeof node !== "object") return;

            if (node.type === "image" && node.attrs?.src) {
                imageNodes.push(node.attrs.src);
            }

            if (Array.isArray(node.content)) {
                node.content.forEach(findImages);
            }
        };

        findImages(content);

        const referencedImages = imageNodes.filter((src) =>
            typeof src === "string" && src.startsWith("upload://")
        );

        for (const src of referencedImages) {
            const index = Number(src.replace("upload://", ""));

            if (!Number.isInteger(index) || index < 0 || index >= images.length) {
                setMessage("An image in the editor is missing its uploaded file.");
                return;
            }
        }

        setSaving(true);
        setMessage("");
        setSuccess(false);

        try {
            const formData = new FormData();

            formData.append("title", title.trim());
            formData.append("description", description.trim());
            formData.append("subject", subject.trim());
            formData.append("tags", JSON.stringify(tags));
            formData.append("content", JSON.stringify(content));

            images.forEach((file) => {
                formData.append("images", file);
            });

            const response = await fetch(`${API_URL}/api/resources`, {
                method: "POST",
                credentials: "include",
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || result.error || "Failed to create resource."
                );
            }

            setSuccess(true);
            setMessage(result.message || "Resource created successfully.");

            setTimeout(() => {
                navigate("/admin/resources");
            }, 1200);
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Something went wrong while saving."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f6f7f9] text-gray-900">
            <header className="sticky top-0 z-30 border-b border-gray-200/80 bg-white/90 backdrop-blur-xl">
                <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-4 lg:px-8">
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => navigate("/admin/resources")}
                            className="rounded-xl border border-gray-200 p-2.5 text-gray-600 transition hover:bg-gray-100"
                        >
                            <ArrowLeft size={18} />
                        </button>

                        <div>
                            <h1 className="font-semibold">Create resource</h1>
                            <p className="text-xs text-gray-500">
                                Build something worth learning
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-700 disabled:opacity-60"
                    >
                        {saving ? (
                            <Loader2 size={17} className="animate-spin" />
                        ) : (
                            <Save size={17} />
                        )}
                        {saving ? "Saving..." : "Save draft"}
                    </button>
                </div>
            </header>

            <main className="mx-auto grid max-w-[1500px] grid-cols-1 items-start gap-7 px-5 py-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8">
                <div className="min-w-0 space-y-6">
                    {message && (
                        <div
                            className={`flex items-start gap-3 rounded-2xl border px-4 py-4 text-sm ${
                                success
                                    ? "border-green-200 bg-green-50 text-green-700"
                                    : "border-gray-200 bg-white text-gray-700"
                            }`}
                        >
                            {success && <CheckCircle2 size={18} />}
                            <span>{message}</span>
                        </div>
                    )}

                    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                        <div className="mb-7 flex items-center gap-3">
                            <div className="rounded-xl bg-gray-100 p-3">
                                <FileText size={20} />
                            </div>
                            <div>
                                <h2 className="font-semibold">
                                    Resource information
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Introduce your learning material
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Resource title
                                </label>
                                <input
                                    value={title}
                                    onChange={(event) => setTitle(event.target.value)}
                                    maxLength={200}
                                    placeholder="Give your resource a meaningful title"
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
                                    onChange={(event) =>
                                        setDescription(event.target.value)
                                    }
                                    rows={4}
                                    maxLength={500}
                                    placeholder="What will learners gain from this resource?"
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
                                    onChange={(event) =>
                                        setSubject(event.target.value)
                                    }
                                    placeholder="e.g. Computer Networks"
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Tags
                                </label>

                                <div className="flex gap-2">
                                    <input
                                        value={tagInput}
                                        onChange={(event) =>
                                            setTagInput(event.target.value)
                                        }
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter") {
                                                event.preventDefault();
                                                addTag();
                                            }
                                        }}
                                        placeholder="Add a topic or keyword"
                                        className={inputClass}
                                    />

                                    <button
                                        type="button"
                                        onClick={addTag}
                                        className="rounded-xl border border-gray-200 px-4 transition hover:bg-gray-50"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
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
                                                        current.filter(
                                                            (item) => item !== tag
                                                        )
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
                                    Up to 10 tags
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-200 px-6 py-5 sm:px-8">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-gray-100 p-3">
                                    <BookOpen size={20} />
                                </div>
                                <div>
                                    <h2 className="font-semibold">
                                        Learning content
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        Write, structure and illustrate
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 p-3">
                            <ToolButton
                                label="Bold"
                                active={editor?.isActive("bold")}
                                onClick={() =>
                                    editor?.chain().focus().toggleBold().run()
                                }
                            >
                                <Bold size={17} />
                            </ToolButton>

                            <ToolButton
                                label="Italic"
                                active={editor?.isActive("italic")}
                                onClick={() =>
                                    editor?.chain().focus().toggleItalic().run()
                                }
                            >
                                <Italic size={17} />
                            </ToolButton>

                            <ToolButton
                                label="Strikethrough"
                                active={editor?.isActive("strike")}
                                onClick={() =>
                                    editor?.chain().focus().toggleStrike().run()
                                }
                            >
                                <Strikethrough size={17} />
                            </ToolButton>

                            <span className="mx-1 h-6 w-px bg-gray-200" />

                            <ToolButton
                                label="Heading 1"
                                active={editor?.isActive("heading", { level: 1 })}
                                onClick={() =>
                                    editor?.chain().focus().toggleHeading({ level: 1 }).run()
                                }
                            >
                                <Heading1 size={18} />
                            </ToolButton>

                            <ToolButton
                                label="Heading 2"
                                active={editor?.isActive("heading", { level: 2 })}
                                onClick={() =>
                                    editor?.chain().focus().toggleHeading({ level: 2 }).run()
                                }
                            >
                                <Heading2 size={18} />
                            </ToolButton>

                            <span className="mx-1 h-6 w-px bg-gray-200" />

                            <ToolButton
                                label="Bullet list"
                                active={editor?.isActive("bulletList")}
                                onClick={() =>
                                    editor?.chain().focus().toggleBulletList().run()
                                }
                            >
                                <List size={18} />
                            </ToolButton>

                            <ToolButton
                                label="Numbered list"
                                active={editor?.isActive("orderedList")}
                                onClick={() =>
                                    editor?.chain().focus().toggleOrderedList().run()
                                }
                            >
                                <ListOrdered size={18} />
                            </ToolButton>

                            <ToolButton
                                label="Blockquote"
                                active={editor?.isActive("blockquote")}
                                onClick={() =>
                                    editor?.chain().focus().toggleBlockquote().run()
                                }
                            >
                                <Quote size={17} />
                            </ToolButton>

                            <ToolButton
                                label="Code block"
                                active={editor?.isActive("codeBlock")}
                                onClick={() =>
                                    editor?.chain().focus().toggleCodeBlock().run()
                                }
                            >
                                <Code size={17} />
                            </ToolButton>

                            <span className="mx-1 h-6 w-px bg-gray-200" />

                            <ToolButton
                                label="Link"
                                active={editor?.isActive("link")}
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
                                onClick={() =>
                                    editor?.chain().focus().undo().run()
                                }
                            >
                                <Undo2 size={17} />
                            </ToolButton>

                            <ToolButton
                                label="Redo"
                                disabled={!editor?.can().redo()}
                                onClick={() =>
                                    editor?.chain().focus().redo().run()
                                }
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

                        <div className="min-h-[500px] px-2 py-2 [&_.tiptap]:min-h-[450px] [&_.tiptap]:outline-none [&_.tiptap_h1]:mb-4 [&_.tiptap_h1]:mt-6 [&_.tiptap_h1]:text-3xl [&_.tiptap_h1]:font-bold [&_.tiptap_h2]:mb-3 [&_.tiptap_h2]:mt-5 [&_.tiptap_h2]:text-2xl [&_.tiptap_h2]:font-semibold [&_.tiptap_p]:mb-3 [&_.tiptap_ul]:mb-4 [&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-6 [&_.tiptap_ol]:mb-4 [&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:pl-6 [&_.tiptap_blockquote]:my-4 [&_.tiptap_blockquote]:border-l-4 [&_.tiptap_blockquote]:border-gray-300 [&_.tiptap_blockquote]:pl-4 [&_.tiptap_blockquote]:italic [&_.tiptap_pre]:my-4 [&_.tiptap_pre]:overflow-x-auto [&_.tiptap_pre]:rounded-xl [&_.tiptap_pre]:bg-gray-900 [&_.tiptap_pre]:p-4 [&_.tiptap_pre]:text-gray-100 [&_.tiptap_code]:rounded [&_.tiptap_code]:bg-gray-100 [&_.tiptap_code]:px-1 [&_.tiptap_code]:py-0.5 [&_.tiptap_a]:text-blue-600 [&_.tiptap_a]:underline [&_.tiptap_img]:my-5 [&_.tiptap_img]:max-w-full [&_.tiptap_img]:rounded-xl [&_.tiptap_hr]:my-6">
                            <EditorContent editor={editor} />
                        </div>

                        <div className="border-t border-gray-100 px-6 py-4">
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <Sparkles size={14} />
                                Rich content, images, code, links and formatting
                            </div>
                        </div>
                    </section>
                </div>

                <aside className="space-y-5">
                    <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-gray-100 p-3">
                                <Upload size={18} />
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold">
                                    Content images
                                </h2>
                                <p className="text-xs text-gray-500">
                                    Uploaded with your resource
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 rounded-2xl bg-gray-50 p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">
                                    Selected images
                                </span>
                                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700">
                                    {images.length}
                                </span>
                            </div>
                            <p className="mt-2 text-xs leading-5 text-gray-400">
                                Images inserted in your editor are uploaded to Cloudinary when you save.
                            </p>
                        </div>

                        {images.length > 0 && (
                            <div className="mt-4 space-y-3">
                                {images.map((file, index) => (
                                    <div
                                        key={`${file.name}-${index}`}
                                        className="flex items-center gap-3 rounded-xl border border-gray-100 p-3"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-gray-700">
                                                {file.name}
                                            </p>
                                            <p className="mt-1 text-xs text-gray-400">
                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={() => imageInput.current?.click()}
                            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                            <ImagePlus size={17} />
                            Add image to content
                        </button>
                    </section>

                    <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                        <h2 className="text-sm font-semibold">
                            Resource status
                        </h2>

                        <div className="mt-4 flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                                Publication
                            </span>
                            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                                Draft
                            </span>
                        </div>

                        <p className="mt-3 text-xs leading-5 text-gray-500">
                            This resource will be saved as a draft and won't be published automatically.
                        </p>
                    </section>

                    <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                        <h2 className="text-sm font-semibold">
                            Before saving
                        </h2>

                        <div className="mt-4 space-y-3">
                            {[
                                "Add a descriptive title",
                                "Select the subject",
                                "Write your learning content",
                                "Check inserted images",
                            ].map((item) => (
                                <div
                                    key={item}
                                    className="flex items-start gap-3 text-sm text-gray-600"
                                >
                                    <CheckCircle2
                                        size={16}
                                        className="mt-0.5 shrink-0 text-gray-400"
                                    />
                                    {item}
                                </div>
                            ))}
                        </div>
                    </section>
                </aside>
            </main>
        </div>
    );
};

export default CreateResource;
