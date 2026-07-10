import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered, Heading2, Strikethrough, Undo, Redo } from 'lucide-react';
import { useEffect } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-[#2A2A2A] bg-[#111111] rounded-t-[8px]">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-1.5 rounded-md ${editor.isActive('bold') ? 'bg-white/10 text-white' : 'text-[#888] hover:text-[#F5F5F5] hover:bg-white/5'}`}
      >
        <Bold size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded-md ${editor.isActive('italic') ? 'bg-white/10 text-white' : 'text-[#888] hover:text-[#F5F5F5] hover:bg-white/5'}`}
      >
        <Italic size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`p-1.5 rounded-md ${editor.isActive('strike') ? 'bg-white/10 text-white' : 'text-[#888] hover:text-[#F5F5F5] hover:bg-white/5'}`}
      >
        <Strikethrough size={16} />
      </button>

      <div className="w-px h-5 bg-[#2A2A2A] mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-1.5 rounded-md ${editor.isActive('heading', { level: 2 }) ? 'bg-white/10 text-white' : 'text-[#888] hover:text-[#F5F5F5] hover:bg-white/5'}`}
      >
        <Heading2 size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded-md ${editor.isActive('bulletList') ? 'bg-white/10 text-white' : 'text-[#888] hover:text-[#F5F5F5] hover:bg-white/5'}`}
      >
        <List size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded-md ${editor.isActive('orderedList') ? 'bg-white/10 text-white' : 'text-[#888] hover:text-[#F5F5F5] hover:bg-white/5'}`}
      >
        <ListOrdered size={16} />
      </button>

      <div className="w-px h-5 bg-[#2A2A2A] mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="p-1.5 rounded-md text-[#888] hover:text-[#F5F5F5] hover:bg-white/5 disabled:opacity-50"
      >
        <Undo size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="p-1.5 rounded-md text-[#888] hover:text-[#F5F5F5] hover:bg-white/5 disabled:opacity-50"
      >
        <Redo size={16} />
      </button>
    </div>
  );
};

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-sm max-w-none focus:outline-none min-h-[200px] p-4 text-[#F5F5F5] font-body',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="border border-[#2A2A2A] rounded-[8px] overflow-hidden focus-within:border-[#C0132A] focus-within:ring-1 focus-within:ring-[#C0132A]/30 transition-all bg-[#1A1A1A]">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
