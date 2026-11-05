import { useEditor, EditorContent } from "@tiptap/react";
import { FloatingMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";

import { Toggle } from "@/components/ui/toggle";
import { Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
import { Italic, Underline as UnderlineIcon } from "lucide-react";

const Tiptap = () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
    ],
    content: "<p>Hello World!</p>",
    immediatelyRender: false,
  });

  return (
    <>
      {editor && (
        <>
          <Toolbar editor={editor} />

          <EditorContent editor={editor} />

          <FloatingMenu editor={editor}>
            This is the floating menu
          </FloatingMenu>
        </>
      )}
    </>
  );
};

export default Tiptap;

const Toolbar = ({ editor }: { editor: Editor }) => {
  const editorState = useEditorState({
    editor,
    selector: (ctx) => ({
      isBold: ctx.editor.isActive("bold"),
      isItalic: ctx.editor.isActive("italic"),
      isUnderline: ctx.editor.isActive("underline"),
    }),
  });

  return (
    <>
       
      <Toggle
        pressed={editorState.isBold}
        onPressedChange={() =>
          editor.chain().focus().toggleBold().run()
        }
        disabled={!editor.can().toggleBold()}
      >
        B
      </Toggle>

       
      <Toggle
        pressed={editorState.isItalic}
        onPressedChange={() =>
          editor.chain().focus().toggleItalic().run()
        }
        disabled={!editor.can().toggleItalic()}
      >
        <Italic size={16} />
      </Toggle>

      
      <Toggle
        pressed={editorState.isUnderline}
        onPressedChange={() =>
          editor.chain().focus().toggleUnderline().run()
        }
        disabled={!editor.can().toggleUnderline()}
      >
        <UnderlineIcon size={16} />
      </Toggle>
    </>
  );
};