/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useMemo, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { 
  Plus, 
  Download, 
  Layout, 
  Type, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  FileText,
  Github,
  Eye,
  Code,
  FileDown,
  FileArchive,
  Loader2,
  Play,
  X,
  Image as ImageIcon,
  Sun,
  Moon,
  Heart,
  Menu,
  Sliders
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { SponsorModal } from './components/SponsorModal';

// --- Types ---

interface NoteFile {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
  footerText?: string;
  showGrid?: boolean;
  fontSize?: 'xs' | 'sm' | 'base' | 'lg';
}


// --- Components ---


const MarkdownCard = ({ 
  content, 
  index, 
  total, 
  footerText, 
  showGrid,
  fontSize = 'base',
  isDarkMode = false
}: { 
  content: string; 
  index: number; 
  total: number;
  footerText?: string;
  showGrid?: boolean;
  fontSize?: 'xs' | 'sm' | 'base' | 'lg';
  isDarkMode?: boolean;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    if (cardRef.current === null) return;
    
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `card-${index + 1}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 group w-full max-w-[400px] shrink-0">
      <div 
        ref={cardRef}
        className={cn(
          "exportable-card relative w-full aspect-[3/4] shadow-xl rounded-2xl overflow-hidden p-8 flex flex-col transition-all duration-300",
          isDarkMode 
            ? "bg-zinc-900 border border-zinc-800 text-zinc-100" 
            : "bg-white border border-gray-100 text-gray-900",
          showGrid && (
            isDarkMode 
              ? "bg-[radial-gradient(#3f3f46_1px,transparent_1px)] [background-size:20px_20px]"
              : "bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]"
          )
        )}
      >
        {/* Card Content */}
        <div className={cn(
          "flex-1 overflow-hidden z-10",
          fontSize === 'xs' && "text-[12px]",
          fontSize === 'sm' && "text-[14px]",
          fontSize === 'base' && "text-[15px]",
          fontSize === 'lg' && "text-[18px]"
        )}>
          <ReactMarkdown
            urlTransform={(uri) => uri.startsWith('blob:') ? uri : uri}
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => <h1 className={cn("font-bold mb-[0.6em] tracking-tight leading-tight text-[2em] transition-colors", isDarkMode ? "text-white" : "text-gray-900")}>{children}</h1>,
              h2: ({ children }) => <h2 className={cn("font-bold mb-[0.5em] tracking-tight leading-tight text-[1.5em] transition-colors", isDarkMode ? "text-zinc-100" : "text-gray-800")}>{children}</h2>,
              h3: ({ children }) => <h3 className={cn("font-bold mb-[0.4em] tracking-tight leading-tight text-[1.25em] transition-colors", isDarkMode ? "text-zinc-200" : "text-gray-800")}>{children}</h3>,
              h4: ({ children }) => <h4 className={cn("font-bold mb-[0.4em] tracking-tight leading-tight text-[1.1em] transition-colors", isDarkMode ? "text-zinc-200" : "text-gray-800")}>{children}</h4>,
              p: ({ children }) => <p className={cn("leading-relaxed mb-[1em] transition-colors", isDarkMode ? "text-zinc-300" : "text-gray-600")}>{children}</p>,
              strong: ({ children }) => <strong className={cn("font-bold transition-colors", isDarkMode ? "text-white" : "text-gray-900")}>{children}</strong>,
              img: ({ src, alt }) => (
                <img 
                  src={src} 
                  alt={alt} 
                  className={cn("max-w-full h-auto rounded-lg my-[1em] shadow-md mx-auto transition-colors", isDarkMode ? "border border-zinc-800" : "border border-gray-100")} 
                  referrerPolicy="no-referrer"
                />
              ),
              pre: ({ children }) => (
                <div className={cn("rounded-xl my-[1.2em] overflow-hidden shadow-lg border transition-colors", isDarkMode ? "bg-zinc-950 border-zinc-800/80" : "bg-[#1e1e1e] border-white/10")}>
                  {/* Mac Style Header */}
                  <div className={cn("flex items-center gap-1.5 px-4 py-3 border-b transition-colors", isDarkMode ? "bg-zinc-900 border-zinc-800/50" : "bg-[#2d2d2d] border-white/5")}>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                  </div>
                  <pre className={cn("p-5 m-0 whitespace-pre-wrap break-words text-[0.85em] transition-colors", isDarkMode ? "text-zinc-300 bg-zinc-950" : "text-gray-300")}>
                    {children}
                  </pre>
                </div>
              ),
              code: ({ node, className, children, ...props }: any) => {
                const isBlock = /language-(\w+)/.test(className || '') || String(children).includes('\n');
                if (isBlock) {
                  return <code className={cn("font-mono leading-relaxed transition-colors", isDarkMode ? "text-zinc-300" : "text-gray-300", className)} {...props}>{children}</code>;
                }
                return <code className={cn("px-[0.4em] py-[0.1em] rounded font-mono text-[0.9em] transition-colors", isDarkMode ? "bg-zinc-800 text-zinc-300 border border-zinc-750" : "bg-orange-50 text-orange-600")} {...props}>{children}</code>;
              },
              ul: ({ className, children }: any) => {
                const isTaskList = className?.includes('contains-task-list');
                return (
                  <ul className={cn(
                    "list-outside space-y-[0.5em] mb-[1em] transition-colors",
                    isTaskList ? "list-none ml-0 pl-[0.2em]" : "list-disc ml-[1.2em]",
                    isDarkMode ? "text-zinc-300" : "text-gray-600",
                    className
                  )}>
                    {children}
                  </ul>
                );
              },
              ol: ({ className, children }: any) => <ol className={cn("list-decimal list-outside ml-[1.2em] space-y-[0.5em] mb-[1em] transition-colors", isDarkMode ? "text-zinc-300" : "text-gray-600", className)}>{children}</ol>,
              li: ({ className, children }: any) => {
                const isTask = className?.includes('task-list-item');
                return (
                  <li className={cn(
                    "pl-[0.2em] transition-colors", 
                    isTask ? "list-none pl-0 flex items-start gap-2" : ""
                  )}>
                    {children}
                  </li>
                );
              },
              input: ({ type, checked, className, ...props }: any) => {
                if (type === 'checkbox') {
                  return (
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled
                      className={cn(
                        "mt-1 h-4 w-4 shrink-0 rounded border transition-colors cursor-default accent-blue-500 bg-transparent",
                        isDarkMode
                          ? "border-zinc-700 text-blue-500"
                          : "border-gray-300 text-blue-600",
                        className
                      )}
                      {...props}
                    />
                  );
                }
                return <input type={type} className={className} {...props} />;
              },
              blockquote: ({ children }) => (
                <blockquote className={cn("border-l-[0.25em] pl-[1em] italic my-[1.2em] transition-colors", isDarkMode ? "border-zinc-700 text-zinc-400" : "border-gray-200 text-gray-500")}>
                  {children}
                </blockquote>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto mb-[1em]">
                  <table className={cn("w-full border-collapse border text-left text-[0.9em] transition-colors", isDarkMode ? "border-zinc-800" : "border-gray-200")}>
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }) => <thead className={cn("transition-colors", isDarkMode ? "bg-zinc-800/50" : "bg-gray-50")}>{children}</thead>,
              th: ({ children }) => <th className={cn("border p-[0.6em] font-semibold transition-colors", isDarkMode ? "border-zinc-800 text-zinc-200 bg-zinc-900/50" : "border-gray-200 text-gray-700")}>{children}</th>,
              td: ({ children }) => <td className={cn("border p-[0.6em] transition-colors", isDarkMode ? "border-zinc-800 text-zinc-350" : "border-gray-200 text-gray-600")}>{children}</td>,
            }}
          >
            {content}
          </ReactMarkdown>
        </div>

        {/* Card Watermark */}
        {footerText && (
          <div className={cn(
            "absolute bottom-4 right-4 z-20 text-[9px] font-semibold tracking-widest select-none pointer-events-none transition-colors",
            isDarkMode ? "text-white/20" : "text-black/20"
          )}>
            {footerText}
          </div>
        )}
      </div>
      
      <button 
        onClick={handleExport}
        className={cn(
          "opacity-0 group-hover:opacity-100 transition-all flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium shadow-lg hover:scale-105 active:scale-95",
          isDarkMode ? "bg-white text-zinc-950 hover:bg-zinc-200" : "bg-black text-white hover:bg-zinc-900"
        )}
      >
        <Download size={14} />
        Export Page {index + 1}
      </button>
    </div>
  );
};

export default function App() {
  const [files, setFiles] = useState<NoteFile[]>(() => {
    const saved = localStorage.getItem('cardy-files');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved files', e);
      }
    }
    return [
      {
        id: '1',
        title: 'Getting Started',
        content: '## Cardy应用介绍\n\n`一个基于文件维度拆分成多个卡片形式的 Markdown 编辑器`。创建一个文件，其中的内容按分页或幻灯片形式展示。每个页面或幻灯片均独立采用 Markdown 格式撰写。\n\n+ 可导出为 PDF 文件，或打包为图片列表\n\n+ 每张图片对应一个幻灯片或分页支持`在线预览`。\n\n+ 支持`暗黑/亮色`模式切换。\n\n\n\n> 2026-05-20 新增了个`打赏功能`，如果您觉得对您有帮助，也欢迎请杯咖啡哦~  \n\n---\n\n# 支持Markdown语法\n\n1、支持基本的Markdown语法\n\n2、支持Mac风格代码块\n\n```python\nprint("I like Cardy!")\n```\n3、支持插入图片\n\n3.1、插入粘贴板中的图片(即复制然后粘贴)\n\n3.2、支持 `![xx](image-addr)` 图片语法插入\n\n4、支持ToDo任务\n\n- [ ] 任务1\n- [x] 任务2\n',
        updatedAt: Date.now(),
        footerText: '',
        showGrid: true,
        fontSize: 'base',
      }
    ];
  });
  const [activeFileId, setActiveFileId] = useState<string>(() => {
    return localStorage.getItem('cardy-active-file-id') || '1';
  });
  const [isDrawer, setIsDrawer] = useState(() => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      const height = window.innerHeight;
      return width < 768 || (width <= 1024 && height > width);
    }
    return false;
  });
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isInitialDrawer = width < 768 || (width <= 1024 && height > width);
      if (isInitialDrawer) return false;
      return width >= 1350;
    }
    return true;
  });
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false);
  const [exportingType, setExportingType] = useState<'pdf' | 'zip' | null>(null);
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [isPresenting, setIsPresenting] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('cardy-dark-mode') === 'true';
  });

  // Persistence logic
  useEffect(() => {
    localStorage.setItem('cardy-files', JSON.stringify(files));
    localStorage.setItem('cardy-active-file-id', activeFileId);
    setLastSaved(Date.now());
  }, [files, activeFileId]);

  useEffect(() => {
    localStorage.setItem('cardy-dark-mode', String(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let prevWidth = window.innerWidth;
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      const currentHeight = window.innerHeight;
      const isCurrentPortrait = currentHeight > currentWidth;
      const nextIsDrawer = currentWidth < 768 || (currentWidth <= 1024 && isCurrentPortrait);
      
      setIsDrawer(nextIsDrawer);

      // Auto close sidebar below 1350px for wider workspace; auto open above 1350px (only on non-drawer desktop)
      if (!nextIsDrawer) {
        if (prevWidth >= 1350 && currentWidth < 1350) {
          setSidebarOpen(false);
        } else if (prevWidth < 1350 && currentWidth >= 1350) {
          setSidebarOpen(true);
        }
      } else {
        // If transitioning into drawer mode, we generally want the sidebar closed
        const prevIsDrawer = prevWidth < 768 || (prevWidth <= 1024 && window.innerHeight > prevWidth);
        if (!prevIsDrawer) {
          setSidebarOpen(false);
        }
      }
      prevWidth = currentWidth;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeFile = files.find(f => f.id === activeFileId) || files[0];

  const pages = useMemo(() => {
    return activeFile.content.split(/\n\s*---\s*\n/).filter(p => p.trim() !== '');
  }, [activeFile.content]);

  // Keyboard navigation for presentation
  useEffect(() => {
    if (!isPresenting) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        setCurrentSlide(prev => Math.min(prev + 1, pages.length - 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setCurrentSlide(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape') {
        setIsPresenting(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresenting, pages.length]);

  const exportAllAsPDF = async () => {
    setExportingType('pdf');
    try {
      const cards = document.querySelectorAll('.exportable-card');
      if (cards.length === 0) return;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [400, 533.33] // 3:4 aspect ratio
      });

      for (let i = 0; i < cards.length; i++) {
        const card = cards[i] as HTMLElement;
        const dataUrl = await toPng(card, { pixelRatio: 2 });
        
        if (i > 0) pdf.addPage();
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      }
      
      pdf.save(`${activeFile.title || 'export'}.pdf`);
    } catch (err) {
      console.error('PDF export failed', err);
    } finally {
      setExportingType(null);
    }
  };

  const exportAllAsZip = async () => {
    setExportingType('zip');
    try {
      const cards = document.querySelectorAll('.exportable-card');
      if (cards.length === 0) return;

      const zip = new JSZip();

      for (let i = 0; i < cards.length; i++) {
        const card = cards[i] as HTMLElement;
        const dataUrl = await toPng(card, { pixelRatio: 2 });
        const base64Data = dataUrl.replace(/^data:image\/(png|jpeg);base64,/, "");
        zip.file(`card-${i + 1}.png`, base64Data, { base64: true });
      }
      
      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `${activeFile.title || 'export'}.zip`;
      link.click();
    } catch (err) {
      console.error('ZIP export failed', err);
    } finally {
      setExportingType(null);
    }
  };

  const exportAsMarkdown = () => {
    const blob = new Blob([activeFile.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeFile.title || 'note'}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleContentChange = (newContent: string) => {
    setFiles(prev => prev.map(f => 
      f.id === activeFileId 
        ? { ...f, content: newContent, updatedAt: Date.now() } 
        : f
    ));
  };

  const editorRef = useRef<HTMLDivElement>(null);

  // Helper to convert editor HTML to Markdown
  const getMarkdownFromEditor = (el: HTMLElement) => {
    let md = "";
    const walk = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        md += node.textContent;
      } else if (node instanceof HTMLImageElement) {
        md += `\n![image](${node.src})\n`;
      } else if (node instanceof HTMLBRElement) {
        md += "\n";
      } else if (node instanceof HTMLDivElement) {
        if (md.length > 0 && !md.endsWith('\n')) md += "\n";
        node.childNodes.forEach(walk);
        if (!md.endsWith('\n')) md += "\n";
      } else {
        node.childNodes.forEach(walk);
      }
    };
    el.childNodes.forEach(walk);
    return md;
  };

  // Helper to convert Markdown to Editor HTML
  const formatMarkdownToHtml = (md: string) => {
    return md.split('\n').map(line => {
      const imgMatch = line.match(/^!\[image\]\((blob:.*?)\)$/);
      if (imgMatch) {
        return `<img src="${imgMatch[1]}" class="max-w-full h-auto rounded-lg my-2 shadow-sm border border-gray-100">`;
      }
      return line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }).join('<br>');
  };

  const syncEditorToMarkdown = () => {
    if (!editorRef.current) return;
    const md = getMarkdownFromEditor(editorRef.current);
    handleContentChange(md.trim());
  };

  // Update editor content only when switching files
  React.useEffect(() => {
    if (editorRef.current) {
      const currentMd = getMarkdownFromEditor(editorRef.current).trim();
      if (currentMd !== activeFile.content.trim()) {
        editorRef.current.innerHTML = formatMarkdownToHtml(activeFile.content);
      }
    }
  }, [activeFileId]);

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64 = event.target?.result as string;
            const img = document.createElement('img');
            img.src = base64;
            img.className = "max-w-full h-auto rounded-lg my-2 shadow-sm border border-gray-100";
            
            // Insert at cursor
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              range.deleteContents();
              range.insertNode(img);
              range.setStartAfter(img);
              range.setEndAfter(img);
              selection.removeAllRanges();
              selection.addRange(range);
            } else {
              editorRef.current?.appendChild(img);
            }
            syncEditorToMarkdown();
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const insertImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          const img = document.createElement('img');
          img.src = base64;
          img.className = "max-w-full h-auto rounded-lg my-2 shadow-sm border border-gray-100";
          editorRef.current?.appendChild(img);
          syncEditorToMarkdown();
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const createNewFile = () => {
    const newFile: NoteFile = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'Untitled Note',
      content: '# New Page\n\nStart writing here...\n\n---\n\n# Page 2\n\nUse `---` to create a new card.',
      updatedAt: Date.now(),
      footerText: '',
      showGrid: true,
      fontSize: 'base',
    };
    setFiles([newFile, ...files]);
    setActiveFileId(newFile.id);
  };

  const deleteFile = (id: string) => {
    if (files.length === 1) return;
    const newFiles = files.filter(f => f.id !== id);
    setFiles(newFiles);
    if (activeFileId === id) {
      setActiveFileId(newFiles[0].id);
    }
  };

  return (
    <div className={cn(
      "flex h-screen font-sans overflow-hidden transition-colors duration-300",
      isDarkMode ? "bg-zinc-950 text-zinc-100" : "bg-[#F9F9F7] text-gray-900"
    )}>
      {/* Sidebar Backdrop on Mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className={cn(
              "fixed inset-0 z-40 bg-black/40 backdrop-blur-xs",
              isDrawer ? "block" : "hidden"
            )}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={
          isDrawer
            ? { x: sidebarOpen ? 0 : -280, opacity: sidebarOpen ? 1 : 0, width: 280 }
            : { width: sidebarOpen ? 280 : 0, opacity: sidebarOpen ? 1 : 0, x: 0 }
        }
        transition={{ type: "tween", duration: 0.2 }}
        className={cn(
          "border-r flex flex-col overflow-hidden transition-colors duration-300 shrink-0",
          isDrawer ? "fixed" : "static",
          "inset-y-0 left-0 z-50 h-full",
          isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200"
        )}
      >
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center text-white transition-colors duration-250",
              isDarkMode ? "bg-zinc-700" : "bg-black"
            )}>
              <Layout size={18} />
            </div>
            Cardy
          </h1>
          <div className="flex items-center gap-1">
            <button 
              onClick={createNewFile}
              className={cn(
                "p-2 rounded-lg transition-colors",
                isDarkMode ? "hover:bg-zinc-800 text-zinc-400 hover:text-white" : "p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-black"
              )}
            >
              <Plus size={20} />
            </button>
            <button 
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "p-2 text-zinc-400 hover:text-zinc-650",
                isDrawer ? "block" : "hidden"
              )}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-1">
          {files.map(file => (
            <div 
              key={file.id}
              onClick={() => {
                setActiveFileId(file.id);
                if (isDrawer) {
                  setSidebarOpen(false);
                }
              }}
              className={cn(
                "group flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all",
                activeFileId === file.id 
                  ? (isDarkMode ? "bg-zinc-850 text-white shadow-md shadow-black/10" : "bg-gray-100 text-black shadow-sm") 
                  : (isDarkMode ? "text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900")
              )}
            >
              <FileText size={18} className={activeFileId === file.id ? (isDarkMode ? "text-white" : "text-black") : "text-gray-400"} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{file.title || 'Untitled'}</div>
                <div className="text-[10px] opacity-60 uppercase tracking-wider">
                  {new Date(file.updatedAt).toLocaleDateString()}
                </div>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  deleteFile(file.id);
                }}
                className={cn(
                  "opacity-0 group-hover:opacity-100 p-1.5 rounded-md transition-all",
                  isDarkMode ? "hover:bg-zinc-700 text-zinc-500 hover:text-red-400" : "hover:bg-gray-200 text-gray-400 hover:text-red-500"
                )}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <header className={cn(
          "h-16 border-b flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10 transition-colors duration-300 backdrop-blur-md",
          isDarkMode 
            ? "bg-zinc-900/80 border-zinc-800 text-white" 
            : "bg-white/80 border-gray-200 text-black"
        )}>
          <div className="flex items-center gap-2 sm:p-0">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                isDarkMode ? "hover:bg-zinc-800 text-zinc-400" : "hover:bg-gray-100 text-gray-500"
              )}
            >
              <Menu size={20} />
            </button>
            <input 
              value={activeFile.title}
              onChange={(e) => {
                const newTitle = e.target.value;
                setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, title: newTitle, updatedAt: Date.now() } : f));
              }}
              className={cn(
                "text-base sm:text-lg font-semibold bg-transparent border-none focus:ring-0 p-0 w-28 xs:w-36 min-[400px]:w-44 md:w-44 min-[1400px]:w-64 focus:w-64 outline-none transition-all duration-200",
                isDarkMode ? "text-white placeholder-zinc-700" : "text-black placeholder-gray-300"
              )}
              placeholder="Note Title..."
            />
            {lastSaved && (
              <span className={cn(
                "text-[10px] items-center gap-1 ml-2 transition-colors hidden xl:flex",
                isDarkMode ? "text-zinc-500" : "text-gray-400"
              )}>
                <div className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
                Saved
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 min-[1400px]:gap-3">
            {/* Desktop Only Actions Panel */}
            <div className={cn(
              isDrawer ? "hidden" : "flex",
              "items-center gap-2 min-[1400px]:gap-3"
            )}>
              {pages.length > 0 && (
                <div className={cn(
                  "flex items-center gap-1 min-[1400px]:gap-1.5 pr-1.5 min-[1400px]:pr-3 border-r transition-colors",
                  isDarkMode ? "border-zinc-800" : "border-gray-200"
                )}>
                  <button 
                    onClick={exportAllAsPDF}
                    disabled={!!exportingType}
                    className={cn(
                      "p-1.5 min-[1400px]:p-2 rounded-lg transition-all disabled:opacity-50 relative group",
                      isDarkMode ? "hover:bg-zinc-800 text-red-400" : "hover:bg-red-50 text-red-600"
                    )}
                    title="Export All as PDF"
                  >
                    {exportingType === 'pdf' ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">PDF Export</span>
                  </button>
                  <button 
                    onClick={exportAllAsZip}
                    disabled={!!exportingType}
                    className={cn(
                      "p-1.5 min-[1400px]:p-2 rounded-lg transition-all disabled:opacity-50 relative group",
                      isDarkMode ? "hover:bg-zinc-800 text-blue-400" : "hover:bg-blue-50 text-blue-600"
                    )}
                    title="Export All as ZIP"
                  >
                    {exportingType === 'zip' ? <Loader2 size={16} className="animate-spin" /> : <FileArchive size={16} />}
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">ZIP Export</span>
                  </button>
                  <button 
                    onClick={exportAsMarkdown}
                    className={cn(
                      "p-1.5 min-[1400px]:p-2 rounded-lg transition-all relative group",
                      isDarkMode ? "hover:bg-zinc-800 text-green-400" : "hover:bg-green-50 text-green-600"
                    )}
                    title="Export as Markdown"
                  >
                    <FileText size={16} />
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">Markdown Export</span>
                  </button>
                  <button 
                    onClick={() => {
                      setCurrentSlide(0);
                      setIsPresenting(true);
                    }}
                    className={cn(
                      "p-1.5 min-[1400px]:p-2 rounded-lg transition-all relative group",
                      isDarkMode ? "hover:bg-zinc-800 text-indigo-400" : "hover:bg-indigo-50 text-indigo-600"
                    )}
                    title="Start Presentation"
                  >
                    <Play size={16} fill="currentColor" />
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">Present</span>
                  </button>
                </div>
              )}
              <div className={cn(
                "flex items-center gap-1 min-[1400px]:gap-2 p-1 rounded-xl mr-1 min-[1400px]:mr-2 transition-colors",
                isDarkMode ? "bg-zinc-855 border border-zinc-800" : "bg-gray-100"
              )}>
                <div className={cn(
                  "flex items-center border-r pr-0.5 min-[1400px]:pr-1 mr-0.5 min-[1400px]:mr-1 transition-colors",
                  isDarkMode ? "border-zinc-800" : "border-gray-200"
                )}>
                  {(['xs', 'sm', 'base', 'lg'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, fontSize: size } : f));
                      }}
                      className={cn(
                        "w-6 h-6 min-[1400px]:w-7 min-[1400px]:h-7 flex items-center justify-center rounded-lg text-[10px] font-bold transition-all uppercase",
                        activeFile.fontSize === size 
                          ? (isDarkMode ? "bg-zinc-700 text-white shadow-sm" : "bg-white text-black shadow-sm") 
                          : (isDarkMode ? "text-zinc-500 hover:text-zinc-300" : "text-gray-400 hover:text-gray-600")
                      )}
                      title={`Font Size: ${size}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                 <input 
                  type="text"
                  value={activeFile.footerText || ''}
                  onChange={(e) => {
                    const newText = e.target.value;
                    setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, footerText: newText } : f));
                  }}
                  className={cn(
                    "text-[10px] bg-transparent border-none focus:ring-0 p-1 w-14 focus:w-24 min-[1400px]:w-24 tracking-wider transition-all outline-none",
                    isDarkMode ? "text-zinc-200 placeholder-zinc-650" : "text-gray-800 placeholder-gray-400"
                  )}
                  placeholder="Watermark..."
                />
                <button 
                  onClick={() => {
                    setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, showGrid: !f.showGrid } : f));
                  }}
                  className={cn(
                    "p-1.5 rounded-lg transition-all",
                    activeFile.showGrid 
                      ? (isDarkMode ? "bg-zinc-700 text-white shadow-sm" : "bg-white text-black shadow-sm") 
                      : (isDarkMode ? "text-zinc-400 hover:text-gray-600" : "text-gray-400 hover:text-gray-600")
                  )}
                  title="Toggle Grid"
                >
                  <Layout size={14} />
                </button>
              </div>

              <button 
                onClick={() => {
                  setIsDonateOpen(true);
                }}
                className={cn(
                  "p-2 rounded-lg transition-all duration-200 relative group",
                  isDarkMode 
                    ? "hover:bg-zinc-800 text-pink-400 hover:text-pink-300" 
                    : "hover:bg-pink-50 text-pink-500 hover:text-pink-600"
                )}
                title="Donate / Tip"
              >
                <Heart size={20} className="text-pink-500 fill-pink-500/10 group-hover:scale-110 group-hover:fill-pink-500 transition-all duration-300" />
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">
                  Donate / Tip
                </span>
              </button>

              <a 
                href="https://github.com/opscolin/cardy-markdown-editor" 
                target="_blank" 
                rel="noopener noreferrer"
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  isDarkMode ? "hover:bg-zinc-800 text-zinc-400 hover:text-zinc-250" : "p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                )}
                title="View on GitHub"
              >
                <Github size={20} />
              </a>
            </div>

            {/* Mobile Only Settings Drawer Trigger */}
            <button 
              onClick={() => setIsMobileSettingsOpen(true)}
              className={cn(
                isDrawer ? "block" : "hidden",
                "p-2 rounded-lg transition-colors duration-250",
                isDarkMode ? "hover:bg-zinc-800 text-zinc-400 hover:text-white" : "hover:bg-gray-100 text-gray-500 hover:text-black"
              )}
              title="Card options & exports"
            >
              <Sliders size={20} />
            </button>

            {/* Light/Dark Mode Toggle (Visible Everywhere for easy access) */}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={cn(
                "p-2 rounded-lg transition-colors duration-200 relative group",
                isDarkMode 
                  ? "hover:bg-zinc-800 text-amber-400 hover:text-amber-300" 
                  : "hover:bg-gray-100 text-gray-500 hover:text-amber-500"
              )}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">
                {isDarkMode ? "Light Mode" : "Dark Mode"}
              </span>
            </button>
          </div>
        </header>

        {/* Workspace */}
        <div className="flex-1 h-[calc(100vh-4rem)] overflow-hidden relative flex flex-row">
          {/* Editor Pane */}
          <div className={cn(
            "flex-1 h-full flex flex-col p-3 sm:p-6 border-r transition-all duration-300 overflow-hidden",
            isDarkMode ? "bg-zinc-950 border-zinc-800" : "bg-white border-gray-200",
            isDrawer ? (mobileTab === 'editor' ? "flex" : "hidden") : "flex"
          )}>
            <div className={cn(
              "flex-1 rounded-2xl shadow-sm border overflow-hidden flex flex-col transition-colors duration-300",
              isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200"
            )}>
              <div className={cn(
                "px-4 sm:px-6 py-3 border-b flex items-center justify-between text-xs font-medium uppercase tracking-widest transition-colors",
                isDarkMode ? "border-zinc-800 text-zinc-500 bg-zinc-900/40" : "border-gray-100 text-gray-400 bg-white"
              )}>
                <div className="flex items-center gap-4">
                  <span>Markdown Editor</span>
                  <button 
                    onClick={insertImage}
                    className={cn(
                      "p-1.5 rounded-lg transition-colors",
                      isDarkMode ? "hover:bg-zinc-805 text-zinc-400 hover:text-zinc-200" : "hover:bg-gray-100 text-gray-500 hover:text-black"
                    )}
                    title="Insert Image"
                  >
                    <ImageIcon size={16} />
                  </button>
                </div>
                <span className="hidden sm:inline">Use --- for new page</span>
              </div>
              <div 
                ref={editorRef}
                contentEditable
                onInput={syncEditorToMarkdown}
                onPaste={handlePaste}
                className={cn(
                  "flex-1 w-full p-4 pb-28 sm:p-8 overflow-y-auto focus:outline-none font-mono text-xs sm:text-sm leading-relaxed whitespace-pre-wrap transition-colors duration-300",
                  isDarkMode ? "bg-zinc-900 text-zinc-200" : "bg-white text-gray-700"
                )}
                spellCheck={false}
              />
            </div>
          </div>

          {/* Preview Pane */}
          <div className={cn(
            "flex-1 h-full overflow-y-auto overflow-x-hidden pt-10 pb-28 px-4 sm:p-8 flex flex-col items-center gap-12 transition-all duration-300 md:pb-8",
            isDarkMode ? "bg-zinc-950" : "bg-[#F9F9F7]",
            isDrawer ? (mobileTab === 'preview' ? "flex" : "hidden") : "flex"
          )}>
            {pages.map((page, idx) => (
              <div 
                key={idx} 
                className="scale-[0.74] min-[370px]:scale-[0.78] min-[400px]:scale-[0.84] sm:scale-100 origin-top mt-0 mb-[-130px] min-[370px]:mb-[-100px] min-[400px]:mb-[-70px] sm:mb-0 transition-transform duration-250 w-full flex justify-center"
              >
                <MarkdownCard 
                  content={page} 
                  index={idx} 
                  total={pages.length} 
                  footerText={activeFile.footerText}
                  showGrid={activeFile.showGrid}
                  fontSize={activeFile.fontSize}
                  isDarkMode={isDarkMode}
                />
              </div>
            ))}
            
            {pages.length === 0 && (
              <div className={cn("flex flex-col items-center justify-center h-full transition-colors", isDarkMode ? "text-zinc-600" : "text-gray-400")}>
                <Type size={48} strokeWidth={1} className="mb-4" />
                <p>No content to preview</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Presentation Mode Overlay */}
      <AnimatePresence>
        {isPresenting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4 md:p-10"
          >
            {/* Close Button */}
            <button 
              onClick={() => setIsPresenting(false)}
              className="absolute top-6 right-6 p-3 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all z-50"
            >
              <X size={24} />
            </button>

            {/* Slide Navigation Info */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 z-50">
              <button 
                onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                disabled={currentSlide === 0}
                className="p-2 text-white/40 hover:text-white disabled:opacity-0 transition-all focus:outline-none"
              >
                <ChevronLeft size={32} />
              </button>
              <span className="text-white/60 font-mono text-sm min-w-[60px] text-center">
                {currentSlide + 1} / {pages.length}
              </span>
              <button 
                onClick={() => setCurrentSlide(prev => Math.min(pages.length - 1, prev + 1))}
                disabled={currentSlide === pages.length - 1}
                className="p-2 text-white/40 hover:text-white disabled:opacity-0 transition-all focus:outline-none"
              >
                <ChevronRight size={32} />
              </button>
            </div>

            {/* Slide Viewport */}
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ y: 50, opacity: 0, scale: 0.95 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: -50, opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  drag="y"
                  dragConstraints={{ top: 0, bottom: 0 }}
                  onDragEnd={(_, info) => {
                    if (info.offset.y < -50) {
                      setCurrentSlide(prev => Math.min(pages.length - 1, prev + 1));
                    } else if (info.offset.y > 50) {
                      setCurrentSlide(prev => Math.max(0, prev - 1));
                    }
                  }}
                  className="cursor-ns-resize h-full flex items-center justify-center w-full"
                >
                  <div className="pointer-events-none transform origin-center scale-[0.6] sm:scale-[0.8] md:scale-[1] lg:scale-[1.2] xl:scale-[1.3] transition-transform duration-300">
                    <MarkdownCard 
                      content={pages[currentSlide]}
                      index={currentSlide}
                      total={pages.length}
                      footerText={activeFile.footerText}
                      showGrid={activeFile.showGrid}
                      fontSize={activeFile.fontSize}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Hint */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 text-white/20 text-[10px] font-medium tracking-[0.2em] hidden md:block uppercase">
              Drag Up/Down, Arrows, or Space to navigate
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Bottom Toggle for Mobile */}
      <div className={cn(
        isDrawer ? "flex" : "hidden",
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200/60 dark:border-zinc-800/80 p-1.5 rounded-full shadow-lg gap-1"
      )}>
        <button
          onClick={() => setMobileTab('editor')}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all select-none",
            mobileTab === 'editor'
              ? (isDarkMode ? "bg-zinc-800 text-white shadow-md" : "bg-black text-white shadow-md")
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-850 dark:hover:text-zinc-100"
          )}
        >
          <Code size={14} />
          <span>编辑</span>
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all select-none",
            mobileTab === 'preview'
              ? (isDarkMode ? "bg-zinc-800 text-white shadow-md" : "bg-black text-white shadow-md")
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-855 dark:hover:text-zinc-100"
          )}
        >
          <Eye size={14} />
          <span>预览</span>
        </button>
      </div>

      {/* Mobile Drawer Settings Sheet */}
      <AnimatePresence>
        {isMobileSettingsOpen && (
          <div className={cn(
            isDrawer ? "flex" : "hidden",
            "fixed inset-0 z-[110] items-end"
          )}>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSettingsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />
            {/* Drawer Body */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className={cn(
                "relative w-full rounded-t-[2rem] p-6 pb-10 border-t shadow-2xl z-10 max-h-[85vh] overflow-y-auto flex flex-col",
                isDarkMode 
                  ? "bg-zinc-900 border-zinc-800 text-zinc-100" 
                  : "bg-white border-zinc-150 text-zinc-900"
              )}
            >
              <div className="w-12 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-6 shrink-0" />

              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-bold tracking-tight">卡片个性化设置</h3>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-semibold mt-0.5 tracking-wider">Card Customization & Export</p>
                </div>
                <button 
                  onClick={() => setIsMobileSettingsOpen(false)}
                  className={cn(
                    "p-1.5 rounded-full transition-colors",
                    isDarkMode ? "hover:bg-zinc-800 text-zinc-400" : "hover:bg-gray-100 text-gray-400"
                  )}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-6">
                {/* 1. Font Sizes */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">正文字体大小 (Font Size)</label>
                  <div className={cn(
                    "flex p-1 rounded-xl gap-1 border",
                    isDarkMode ? "bg-zinc-950 border-zinc-800" : "bg-gray-50 border-gray-150"
                  )}>
                    {(['xs', 'sm', 'base', 'lg'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => {
                          setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, fontSize: size } : f));
                        }}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-xs font-bold transition-all uppercase text-center",
                          activeFile.fontSize === size 
                            ? (isDarkMode ? "bg-zinc-800 text-white shadow" : "bg-white text-black shadow") 
                            : (isDarkMode ? "text-zinc-500 hover:text-zinc-300" : "text-gray-400 hover:text-gray-600")
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Grid Toggle & Watermark text */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">卡片水印 (Watermark)</label>
                    <input 
                      type="text"
                      value={activeFile.footerText || ''}
                      onChange={(e) => {
                        const newText = e.target.value;
                        setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, footerText: newText } : f));
                      }}
                      className={cn(
                        "w-full text-xs font-medium bg-transparent border rounded-xl py-2 px-3 tracking-wider outline-none transition-all",
                        isDarkMode 
                          ? "border-zinc-800 text-zinc-200 bg-zinc-950 focus:border-zinc-700" 
                          : "border-gray-200 text-gray-800 bg-gray-50 focus:border-gray-300"
                      )}
                      placeholder="WATERMARK..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">网格底纹 (Grid)</label>
                    <button 
                      onClick={() => {
                        setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, showGrid: !f.showGrid } : f));
                      }}
                      className={cn(
                        "w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition-all",
                        activeFile.showGrid 
                          ? (isDarkMode ? "bg-zinc-800 border-zinc-700 text-white shadow-sm" : "bg-white border-zinc-200 text-black shadow-sm") 
                          : (isDarkMode ? "text-zinc-400 border-zinc-800 hover:bg-zinc-800/40" : "text-gray-400 border-gray-150 hover:bg-gray-100")
                      )}
                    >
                      <Layout size={14} />
                      <span>{activeFile.showGrid ? "显示网格" : "隐藏网格"}</span>
                    </button>
                  </div>
                </div>

                {/* 3. Export tools */}
                {pages.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">文档及卡片导出 (Export Options)</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button 
                        onClick={() => {
                          setIsMobileSettingsOpen(false);
                          exportAllAsPDF();
                        }}
                        disabled={!!exportingType}
                        className={cn(
                          "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all text-[10px] font-bold",
                          isDarkMode 
                            ? "bg-zinc-950/40 border-zinc-800 hover:border-zinc-700 text-red-400" 
                            : "bg-red-50/20 border-red-100 hover:border-red-200 text-red-600"
                        )}
                      >
                        {exportingType === 'pdf' ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
                        <span>PDF 导出</span>
                      </button>

                      <button 
                        onClick={() => {
                          setIsMobileSettingsOpen(false);
                          exportAllAsZip();
                        }}
                        disabled={!!exportingType}
                        className={cn(
                          "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all text-[10px] font-bold",
                          isDarkMode 
                            ? "bg-zinc-950/40 border-zinc-800 hover:border-zinc-700 text-blue-400" 
                            : "bg-blue-50/20 border-blue-100 hover:border-blue-200 text-blue-600"
                        )}
                      >
                        {exportingType === 'zip' ? <Loader2 size={16} className="animate-spin" /> : <FileArchive size={16} />}
                        <span>图片打包</span>
                      </button>

                      <button 
                        onClick={() => {
                          setIsMobileSettingsOpen(false);
                          exportAsMarkdown();
                        }}
                        className={cn(
                          "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all text-[10px] font-bold",
                          isDarkMode 
                            ? "bg-zinc-950/40 border-zinc-800 hover:border-zinc-700 text-green-400" 
                            : "bg-green-50/20 border-green-100 hover:border-green-200 text-green-600"
                        )}
                      >
                        <FileText size={16} />
                        <span>MD 源码</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. Controls */}
                <div className="space-y-2 pt-2 border-t border-zinc-200/50 dark:border-zinc-800/80">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Presentation Mode */}
                    {pages.length > 0 && (
                      <button 
                        onClick={() => {
                          setIsMobileSettingsOpen(false);
                          setCurrentSlide(0);
                          setIsPresenting(true);
                        }}
                        className={cn(
                          "flex items-center justify-center gap-2 p-3 rounded-xl border transition-all text-xs font-bold",
                          isDarkMode 
                            ? "bg-zinc-800 border-zinc-700 text-indigo-400" 
                            : "bg-indigo-50 border-indigo-150 text-indigo-600"
                        )}
                      >
                        <Play size={14} fill="currentColor" />
                        <span>幻灯放映</span>
                      </button>
                    )}

                    {/* Tip button */}
                    <button 
                      onClick={() => {
                        setIsMobileSettingsOpen(false);
                        setIsDonateOpen(true);
                      }}
                      className={cn(
                        "flex items-center justify-center gap-2 p-3 rounded-xl border transition-all text-xs font-bold",
                        isDarkMode 
                          ? "bg-zinc-800 border-zinc-700 text-pink-400" 
                          : "bg-pink-50 border-pink-150 text-pink-600"
                      )}
                    >
                      <Heart size={14} className="fill-pink-500/10 text-pink-500" />
                      <span>打赏咖啡</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Donation/Tipping Modal */}
      <SponsorModal
        isOpen={isDonateOpen}
        onClose={() => setIsDonateOpen(false)}
        isDarkMode={isDarkMode}
        projectName="Cardy"
        authorName="作者"
      />
    </div>
  );
}
