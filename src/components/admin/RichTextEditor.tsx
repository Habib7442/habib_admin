'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo, 
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Heading3,
  Strikethrough,
  Underline as UnderlineIcon,
  Terminal
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null

  const addLink = () => {
    const url = window.prompt('URL')
    if (url) editor.chain().focus().setLink({ href: url }).run()
  }

  const addImage = () => {
    const url = window.prompt('Image URL')
    if (url) editor.chain().focus().setImage({ src: url }).run()
  }

  return (
    <div className="flex flex-wrap items-center gap-1 p-3 bg-[#161616] border-b border-[#262626] rounded-t-xl sticky top-0 z-10 shadow-lg">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive('heading', { level: 1 })}
        icon={<Heading1 className="w-4 h-4" />}
        label="H1"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive('heading', { level: 2 })}
        icon={<Heading2 className="w-4 h-4" />}
        label="H2"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive('heading', { level: 3 })}
        icon={<Heading3 className="w-4 h-4" />}
        label="H3"
      />
      <div className="w-[1px] h-6 bg-[#262626] mx-1" />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
        icon={<Bold className="w-4 h-4" />}
        label="Bold"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
        icon={<Italic className="w-4 h-4" />}
        label="Italic"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive('underline')}
        icon={<UnderlineIcon className="w-4 h-4" />}
        label="Underline"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive('strike')}
        icon={<Strikethrough className="w-4 h-4" />}
        label="Strike"
      />
      <div className="w-[1px] h-6 bg-[#262626] mx-1" />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')}
        icon={<List className="w-4 h-4" />}
        label="Bullet List"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')}
        icon={<ListOrdered className="w-4 h-4" />}
        label="Ordered List"
      />
      <div className="w-[1px] h-6 bg-[#262626] mx-1" />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive('blockquote')}
        icon={<Quote className="w-4 h-4" />}
        label="Blockquote"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editor.isActive('codeBlock')}
        icon={<Code className="w-4 h-4" />}
        label="Code Block"
      />
      <div className="w-[1px] h-6 bg-[#262626] mx-1" />
      <ToolbarButton onClick={addLink} active={editor.isActive('link')} icon={<LinkIcon className="w-4 h-4" />} label="Link" />
      <ToolbarButton onClick={addImage} icon={<ImageIcon className="w-4 h-4" />} label="Image" />
      <div className="flex-1" />
      <ToolbarButton onClick={() => editor.chain().focus().undo().run()} icon={<Undo className="w-4 h-4" />} label="Undo" />
      <ToolbarButton onClick={() => editor.chain().focus().redo().run()} icon={<Redo className="w-4 h-4" />} label="Redo" />
    </div>
  )
}

const ToolbarButton = ({ onClick, active, icon, label }: any) => (
  <Button
    variant="ghost"
    size="sm"
    onClick={onClick}
    type="button"
    className={cn(
      "h-8 px-2 rounded-lg transition-all duration-200",
      active 
        ? "bg-[#7C3AED]/10 text-[#7C3AED] border border-[#7C3AED]/20 hover:bg-[#7C3AED]/20 active:scale-95" 
        : "text-[#A1A1AA] hover:text-white hover:bg-[#262626] active:scale-95 border border-transparent"
    )}
    title={label}
  >
    {icon}
  </Button>
)

export function RichTextEditor({ value, onChange, placeholder = 'Start writing...' }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-[#7C3AED] underline font-bold cursor-pointer hover:text-white transition-colors' } }),
      Image.configure({ HTMLAttributes: { class: 'rounded-2xl border border-[#262626] max-w-full my-8 shadow-2xl transition-transform hover:scale-[1.02] duration-500' } }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-invert max-w-none min-h-[400px] p-8 focus:outline-none",
          "selection:bg-[#7C3AED]/40 selection:text-white",
          "prose-headings:font-bold prose-headings:tracking-tight",
          "prose-p:text-[#A1A1AA] prose-p:leading-relaxed",
          "prose-strong:text-white prose-strong:font-bold",
          "prose-a:text-[#7C3AED] prose-a:no-underline hover:prose-a:underline",
          "prose-code:text-[#7C3AED] prose-code:bg-[#161616] prose-code:px-2 prose-code:py-0.5 prose-code:rounded-lg prose-code:before:content-none prose-code:after:content-none",
          "prose-pre:bg-[#0A0A0A] prose-pre:border prose-pre:border-[#262626] prose-pre:rounded-2xl prose-pre:p-6 prose-pre:shadow-2xl"
        ),
      },
    },
  })

  return (
    <div className="border border-[#262626] rounded-2xl bg-[#111111] overflow-hidden focus-within:border-[#7C3AED]/40 transition-all shadow-2xl group/editor">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="cursor-text" />
      <div className="bg-[#161616] border-t border-[#262626] py-2 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-[#52525B]">
          <Terminal className="w-3 h-3" /> TipTap Powered Editor
        </div>
        <div className="text-[10px] font-mono text-[#52525B]">
           {editor?.getText().length || 0} characters
        </div>
      </div>
    </div>
  )
}
