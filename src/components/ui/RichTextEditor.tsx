"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { cn } from "@/lib/utils"; // For shadcn/ui classnames

interface RichTextEditorProps {
  value: string;
  onChange: (richText: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const TiptapEditor = ({
  value,
  onChange,
  onBlur,
  placeholder,
  className,
  disabled,
}: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable heading if not needed, or configure levels
        heading: false,
        // Configure other extensions as needed
        bulletList: {
          keepMarks: true,
          keepAttributes: false, 
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: cn(
          "prose dark:prose-invert prose-sm sm:prose-base min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        ),
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onBlur: () => {
      if (onBlur) {
        onBlur();
      }
    },
    editable: !disabled,
  });

  if (!editor) {
    return null;
  }
  
  // Basic Toolbar
  const Toolbar = ({editor}: {editor: Editor | null}) => {
    if (!editor) return null;
    return (
      <div className="border border-input bg-transparent rounded-md p-1 flex gap-1 mb-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={cn("p-1 rounded hover:bg-accent hover:text-accent-foreground", editor.isActive('bold') ? 'bg-accent text-accent-foreground' : '')}
        >
          Bold
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={cn("p-1 rounded hover:bg-accent hover:text-accent-foreground", editor.isActive('italic') ? 'bg-accent text-accent-foreground' : '')}
        >
          Italic
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn("p-1 rounded hover:bg-accent hover:text-accent-foreground", editor.isActive('bulletList') ? 'bg-accent text-accent-foreground' : '')}
        >
          List
        </button>
         <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn("p-1 rounded hover:bg-accent hover:text-accent-foreground", editor.isActive('orderedList') ? 'bg-accent text-accent-foreground' : '')}
        >
          Numbered List
        </button>
        {/* Add more buttons for links, etc. as needed */}
      </div>
    )
  }


  return (
    <div>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} placeholder={placeholder} />
    </div>
  );
};

export default TiptapEditor;
