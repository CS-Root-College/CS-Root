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
    FileImage,
    Plus,
    Save,
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
        className={`rounded-lg p-2 transition ${
            active
                ? "bg-gray-200 text-gray-950"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-950"
        } disabled:cursor-not-allowed disabled:opacity-30`}
    >
        {children}
    </button>
);

const inputClass =
    "w-full rounded-lg border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-100";

const labelClass = "mb-2 block text-sm font-medium text-gray-700";

const CreateResource = ({ isAdmin }: CreateResourceProps) => {
    const navigate = useNavigate();

    const imageInput = useRef<HTMLInputElement>(null);
    const coverInput = useRef<HTMLInputElement>(null);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [subject, setSubject] = useState("");
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [seoTitle, setSeoTitle] = useState("");
    const [seoDescription, setSeoDescription] = useState("");
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [coverFileName, setCoverFileName] = useState("");
    const [message, setMessage] = useState("");

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
                class: "min-h-[400px] px-6 py-5 outline-none text-gray-800 leading-7",
                spellcheck: "true",
            },
        },
    });

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
                        className="mt-5 rounded-lg bg-gray-900 px-5 py-2.5 text-sm text-white transition hover:bg-gray-700"
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

    const selectImage = (
        event: ChangeEvent<HTMLInputElement>,
        type: "content" | "cover"
    ) => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setMessage("Please select a valid image.");
            event.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setMessage("Image size cannot exceed 5 MB.");
            event.target.value = "";
            return;
        }

        const imageUrl = URL.createObjectURL(file);

        if (type === "cover") {
            if (coverImage) URL.revokeObjectURL(coverImage);

            setCoverImage(imageUrl);
            setCoverFileName(file.name);
        } else {
            editor?.chain().focus().setImage({
                src: imageUrl,
                alt: file.name,
                title: file.name,
            }).run();
        }

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

    const handleSave = () => {
        if (!title.trim() || !subject.trim()) {
            setMessage("Please enter a title and subject.");
            return;
        }

        if (!editor?.getText().trim()) {
            setMessage("Please write some resource content.");
            return;
        }

        setMessage(
            "UI preview only. Backend integration is required to save resources."
        );
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] text-gray-900">
            <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
                <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-4 lg:px-8">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate("/admin/resources")}
                            className="rounded-lg border border-gray-200 p-2.5 text-gray-600 transition hover:bg-gray-100"
                        >
                            <ArrowLeft size={18} />
                        </button>

                        <div>
                            <h1 className="text-base font-semibold">
                                Create resource
                            </h1>
                            <p className="text-xs text-gray-500">
                                Create learning material for CS Root
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleSave}
                        className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-700"
                    >
                        <Save size={16} />
                        Save draft
                    </button>
                </div>
            </header>

            <main className="mx-auto grid max-w-[1500px] grid-cols-1 items-start gap-7 px-5 py-8 lg:grid-cols-[minmax(0,1fr)_310px] lg:px-8">
                <div className="min-w-0 space-y-6">
                    {message && (
                        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                            {message}
                        </div>
                    )}

                    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="mb-6">
                            <h2 className="text-base font-semibold">
                                Basic information
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Give your resource a title and description.
                            </p>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className={labelClass}>Title</label>
                                <input
                                    value={title}
                                    onChange={(event) => setTitle(event.target.value)}
                                    maxLength={200}
                                    placeholder="Enter resource title"
                                    className={`${inputClass} text-lg font-medium`}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Description</label>
                                <textarea
                                    value={description}
                                    onChange={(event) => setDescription(event.target.value)}
                                    rows={3}
                                    maxLength={500}
                                    placeholder="What will readers learn from this resource?"
                                    className={`${inputClass} resize-y`}
                                />
                                <p className="mt-1 text-right text-xs text-gray-400">
                                    {description.length}/500
                                </p>
                            </div>

                            <div>
                                <label className={labelClass}>Subject</label>
                                <input
                                    value={subject}
                                    onChange={(event) => setSubject(event.target.value)}
                                    placeholder="e.g. Computer Networks"
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Tags</label>

                                <div className="flex gap-2">
                                    <input
                                        value={tagInput}
                                        onChange={(event) => setTagInput(event.target.value)}
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter") {
                                                event.preventDefault();
                                                addTag();
                                            }
                                        }}
                                        placeholder="Add tags..."
                                        className={inputClass}
                                    />

                                    <button
                                        type="button"
                                        onClick={addTag}
                                        className="rounded-lg border border-gray-300 px-4 text-sm font-medium transition hover:bg-gray-50"
                                    >
                                        <Plus size={17} />
                                    </button>
                                </div>

                                <div className="mt-3 flex flex-wrap gap-2">
                                    {tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-700"
                                        >
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setTags((current) =>
                                                        current.filter((item) => item !== tag)
                                                    )
                                                }
                                                className="text-gray-500 hover:text-red-600"
                                            >
                                                <X size={13} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-200 px-6 py-5">
                            <h2 className="text-base font-semibold">
                                Content editor
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Write, format and add images to your resource.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 p-3">
                            <ToolButton
                                label="Bold"
                                active={editor?.isActive("bold")}
                                onClick={() => editor?.chain().focus().toggleBold().run()}
                            >
                                <Bold size={17} />
                            </ToolButton>

                            <ToolButton
                                label="Italic"
                                active={editor?.isActive("italic")}
                                onClick={() => editor?.chain().focus().toggleItalic().run()}
                            >
                                <Italic size={17} />
                            </ToolButton>

                            <ToolButton
                                label="Strikethrough"
                                active={editor?.isActive("strike")}
                                onClick={() => editor?.chain().focus().toggleStrike().run()}
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
                                onChange={(event) => selectImage(event, "content")}
                            />
                        </div>

                        <div
                            className="
                                min-h-[450px] px-6 py-5
                                [&_.tiptap]:min-h-[400px]
                                [&_.tiptap]:text-sm
                                [&_.tiptap]:leading-7
                                [&_.tiptap]:text-gray-800
                                [&_.tiptap]:outline-none
                                [&_.tiptap_h1]:mb-4
                                [&_.tiptap_h1]:mt-6
                                [&_.tiptap_h1]:text-3xl
                                [&_.tiptap_h1]:font-bold
                                [&_.tiptap_h2]:mb-3
                                [&_.tiptap_h2]:mt-5
                                [&_.tiptap_h2]:text-2xl
                                [&_.tiptap_h2]:font-semibold
                                [&_.tiptap_p]:mb-3
                                [&_.tiptap_ul]:mb-4
                                [&_.tiptap_ul]:list-disc
                                [&_.tiptap_ul]:pl-6
                                [&_.tiptap_ol]:mb-4
                                [&_.tiptap_ol]:list-decimal
                                [&_.tiptap_ol]:pl-6
                                [&_.tiptap_blockquote]:my-4
                                [&_.tiptap_blockquote]:border-l-4
                                [&_.tiptap_blockquote]:border-gray-300
                                [&_.tiptap_blockquote]:pl-4
                                [&_.tiptap_blockquote]:italic
                                [&_.tiptap_pre]:my-4
                                [&_.tiptap_pre]:overflow-x-auto
                                [&_.tiptap_pre]:rounded-lg
                                [&_.tiptap_pre]:bg-gray-900
                                [&_.tiptap_pre]:p-4
                                [&_.tiptap_pre]:text-sm
                                [&_.tiptap_pre]:text-gray-100
                                [&_.tiptap_code]:rounded
                                [&_.tiptap_code]:bg-gray-100
                                [&_.tiptap_code]:px-1
                                [&_.tiptap_code]:py-0.5
                                [&_.tiptap_code]:text-gray-800
                                [&_.tiptap_a]:text-blue-600
                                [&_.tiptap_a]:underline
                                [&_.tiptap_img]:my-4
                                [&_.tiptap_img]:max-w-full
                                [&_.tiptap_img]:rounded-lg
                                [&_.tiptap_hr]:my-6
                                [&_.tiptap_hr]:border-gray-200
                            "
                        >
                            <EditorContent editor={editor} />
                        </div>

                        <div className="border-t border-gray-100 px-6 py-3 text-xs text-gray-400">
                            Your editor supports formatted text, lists, links, code and images.
                        </div>
                    </section>

                    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="text-base font-semibold">SEO settings</h2>

                        <div className="mt-5 space-y-5">
                            <div>
                                <label className={labelClass}>SEO title</label>
                                <input
                                    value={seoTitle}
                                    onChange={(event) => setSeoTitle(event.target.value)}
                                    maxLength={200}
                                    placeholder="Search engine title"
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>SEO description</label>
                                <textarea
                                    value={seoDescription}
                                    onChange={(event) =>
                                        setSeoDescription(event.target.value)
                                    }
                                    maxLength={500}
                                    rows={3}
                                    placeholder="Search engine description"
                                    className={`${inputClass} resize-y`}
                                />
                            </div>
                        </div>
                    </section>
                </div>

                <aside className="space-y-5">
                    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold">Cover image</h2>
                            <FileImage size={17} className="text-gray-400" />
                        </div>

                        <p className="mt-1 text-xs text-gray-500">
                            Choose a thumbnail for your resource.
                        </p>

                        {coverImage ? (
                            <div className="mt-4">
                                <img
                                    src={coverImage}
                                    alt="Resource cover preview"
                                    className="aspect-video w-full rounded-lg border border-gray-200 object-cover"
                                />

                                <p className="mt-2 truncate text-xs text-gray-500">
                                    {coverFileName}
                                </p>

                                <button
                                    type="button"
                                    onClick={() => {
                                        URL.revokeObjectURL(coverImage);
                                        setCoverImage(null);
                                        setCoverFileName("");
                                    }}
                                    className="mt-2 text-xs font-medium text-red-600 hover:text-red-700"
                                >
                                    Remove image
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => coverInput.current?.click()}
                                className="mt-4 flex aspect-video w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500 transition hover:border-gray-400 hover:bg-gray-100"
                            >
                                <ImagePlus size={23} />
                                <span className="mt-2 text-xs font-medium">
                                    Upload cover image
                                </span>
                                <span className="mt-1 text-[11px]">
                                    PNG, JPG or WEBP
                                </span>
                            </button>
                        )}

                        <input
                            ref={coverInput}
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={(event) => selectImage(event, "cover")}
                        />
                    </section>

                    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <h2 className="text-sm font-semibold">Resource status</h2>

                        <div className="mt-4 flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                                Current status
                            </span>
                            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                                Draft
                            </span>
                        </div>

                        <p className="mt-3 text-xs leading-5 text-gray-500">
                            Resources will remain unpublished until you publish them.
                        </p>
                    </section>

                    <section className="rounded-xl border border-blue-100 bg-blue-50 p-5">
                        <h2 className="text-sm font-semibold text-blue-900">
                            Editor preview
                        </h2>
                        <p className="mt-2 text-xs leading-5 text-blue-700">
                            Images are currently previewed locally. Permanent image
                            uploads and saving will be connected later.
                        </p>
                    </section>
                </aside>
            </main>
        </div>
    );
};

export default CreateResource;