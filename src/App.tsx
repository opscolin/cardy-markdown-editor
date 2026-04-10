/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
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
  Share2,
  Eye,
  Code,
  FileDown,
  FileArchive,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

// --- Types ---

interface NoteFile {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
  footerText?: string;
  showGrid?: boolean;
}

// --- Components ---

const MarkdownCard = ({ 
  content, 
  index, 
  total, 
  footerText, 
  showGrid 
}: { 
  content: string; 
  index: number; 
  total: number;
  footerText?: string;
  showGrid?: boolean;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    if (cardRef.current === null) return;
    
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `card-${index + 1}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 group">
      <div 
        ref={cardRef}
        className={cn(
          "exportable-card relative w-full max-w-[400px] aspect-[3/4] bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100 p-8 flex flex-col",
          showGrid && "bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]"
        )}
      >
        {/* Card Content */}
        <div className="flex-1 overflow-hidden z-10">
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h1 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">{children}</h1>,
              h2: ({ children }) => <h2 className="text-xl font-bold text-gray-800 mb-4 tracking-tight">{children}</h2>,
              p: ({ children }) => <p className="text-gray-600 leading-relaxed mb-5 text-[15px]">{children}</p>,
              strong: ({ children }) => <strong className="font-bold text-gray-900">{children}</strong>,
              pre: ({ children }) => (
                <div className="bg-[#1e1e1e] rounded-xl my-6 overflow-hidden shadow-lg border border-white/10">
                  {/* Mac Style Header */}
                  <div className="flex items-center gap-1.5 px-4 py-3 bg-[#2d2d2d] border-b border-white/5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                  </div>
                  <pre className="p-5 m-0 whitespace-pre-wrap break-words">
                    {children}
                  </pre>
                </div>
              ),
              code: ({ node, className, children, ...props }: any) => {
                const isBlock = /language-(\w+)/.test(className || '') || String(children).includes('\n');
                if (isBlock) {
                  return <code className={cn("text-gray-300 font-mono text-[13px] leading-relaxed", className)} {...props}>{children}</code>;
                }
                return <code className="bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded text-[13px] font-mono" {...props}>{children}</code>;
              },
              ul: ({ children }) => <ul className="list-disc list-outside ml-5 space-y-3 mb-6 text-gray-600 text-[15px]">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-outside ml-5 space-y-3 mb-6 text-gray-600 text-[15px]">{children}</ol>,
              li: ({ children }) => <li className="pl-1">{children}</li>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-gray-200 pl-4 italic text-gray-500 my-6">
                  {children}
                </blockquote>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>

        {/* Card Footer */}
        {footerText && (
          <div className="mt-auto pt-4 flex justify-center items-center border-t border-gray-50 text-[10px] text-gray-400 font-medium uppercase tracking-widest z-10">
            <span>{footerText}</span>
          </div>
        )}
      </div>
      
      <button 
        onClick={handleExport}
        className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-xs font-medium shadow-lg hover:scale-105 active:scale-95"
      >
        <Download size={14} />
        Export Page {index + 1}
      </button>
    </div>
  );
};

export default function App() {
  const [files, setFiles] = useState<NoteFile[]>([
    {
      id: '1',
      title: 'Getting Started',
      content: '# 使用方法\n\n**首先要确保安装 Defuddle**。如果本地没有安装 Defuddle，可以使用 npm 安装（确保你已经安装了 Node.js）：\n\n```\nnpm install -g defuddle\n```\n\n安装完成之后，可以在终端使用 `defuddle` 命令。\n\n---\n\n# 在 AI Agent 中的典型使用方式\n\n在 Claude Code 或 OpenClaw 中，可以直接发送一个 URL，并给出提示词。例如：\n\n```\n读取这个网页内容，并用 Defuddle Skill 提取正文。\n然后生成 Markdown 笔记。\nhttps://example.com/article\n```',
      updatedAt: Date.now(),
      footerText: 'Cardy Editor',
      showGrid: true,
    }
  ]);
  const [activeFileId, setActiveFileId] = useState<string>('1');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const activeFile = files.find(f => f.id === activeFileId) || files[0];

  const pages = useMemo(() => {
    return activeFile.content.split(/\n\s*---\s*\n/).filter(p => p.trim() !== '');
  }, [activeFile.content]);

  const exportAllAsPDF = async () => {
    setIsExporting(true);
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
        const dataUrl = await toPng(card, { cacheBust: true, pixelRatio: 2 });
        
        if (i > 0) pdf.addPage();
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      }
      
      pdf.save(`${activeFile.title || 'export'}.pdf`);
    } catch (err) {
      console.error('PDF export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  const exportAllAsZip = async () => {
    setIsExporting(true);
    try {
      const cards = document.querySelectorAll('.exportable-card');
      if (cards.length === 0) return;

      const zip = new JSZip();

      for (let i = 0; i < cards.length; i++) {
        const card = cards[i] as HTMLElement;
        const dataUrl = await toPng(card, { cacheBust: true, pixelRatio: 2 });
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
      setIsExporting(false);
    }
  };

  const handleContentChange = (newContent: string) => {
    setFiles(prev => prev.map(f => 
      f.id === activeFileId 
        ? { ...f, content: newContent, updatedAt: Date.now() } 
        : f
    ));
  };

  const createNewFile = () => {
    const newFile: NoteFile = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'Untitled Note',
      content: '# New Page\n\nStart writing here...\n\n---\n\n# Page 2\n\nUse `---` to create a new card.',
      updatedAt: Date.now(),
      footerText: 'Cardy Editor',
      showGrid: true,
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
    <div className="flex h-screen bg-[#F9F9F7] text-gray-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 0, opacity: sidebarOpen ? 1 : 0 }}
        className="bg-white border-r border-gray-200 flex flex-col overflow-hidden"
      >
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
              <Layout size={18} />
            </div>
            Cardy
          </h1>
          <button 
            onClick={createNewFile}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-black"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-1">
          {files.map(file => (
            <div 
              key={file.id}
              onClick={() => setActiveFileId(file.id)}
              className={cn(
                "group flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all",
                activeFileId === file.id 
                  ? "bg-gray-100 text-black shadow-sm" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <FileText size={18} className={activeFileId === file.id ? "text-black" : "text-gray-400"} />
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
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-gray-200 rounded-md transition-all text-gray-400 hover:text-red-500"
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
        <header className="h-16 border-b border-gray-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
            >
              {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
            <input 
              value={activeFile.title}
              onChange={(e) => {
                const newTitle = e.target.value;
                setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, title: newTitle } : f));
              }}
              className="text-lg font-semibold bg-transparent border-none focus:ring-0 p-0 placeholder-gray-300 w-64 outline-none"
              placeholder="Note Title..."
            />
          </div>

          <div className="flex items-center gap-3">
            {pages.length > 0 && (
              <div className="flex items-center gap-2 mr-2 border-r border-gray-200 pr-4">
                <button 
                  onClick={exportAllAsPDF}
                  disabled={isExporting}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                  title="Export All as PDF"
                >
                  {isExporting ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
                  PDF
                </button>
                <button 
                  onClick={exportAllAsZip}
                  disabled={isExporting}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                  title="Export All as ZIP"
                >
                  {isExporting ? <Loader2 size={14} className="animate-spin" /> : <FileArchive size={14} />}
                  ZIP
                </button>
              </div>
            )}
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl mr-2">
              <input 
                type="text"
                value={activeFile.footerText || ''}
                onChange={(e) => {
                  const newText = e.target.value;
                  setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, footerText: newText } : f));
                }}
                className="text-[10px] bg-transparent border-none focus:ring-0 p-1 w-24 uppercase tracking-wider placeholder-gray-400"
                placeholder="Footer Text..."
              />
              <button 
                onClick={() => {
                  setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, showGrid: !f.showGrid } : f));
                }}
                className={cn(
                  "p-1.5 rounded-lg transition-all",
                  activeFile.showGrid ? "bg-white text-black shadow-sm" : "text-gray-400 hover:text-gray-600"
                )}
                title="Toggle Grid"
              >
                <Layout size={14} />
              </button>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
              <Share2 size={20} />
            </button>
          </div>
        </header>

        {/* Workspace */}
        <div className="flex-1 overflow-hidden relative flex flex-row">
          {/* Editor Pane */}
          <div className="flex-1 h-full flex flex-col p-6 border-r border-gray-200 bg-white">
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
              <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between text-xs font-medium text-gray-400 uppercase tracking-widest">
                <span>Markdown Editor</span>
                <span>Use --- for new page</span>
              </div>
              <textarea 
                value={activeFile.content}
                onChange={(e) => handleContentChange(e.target.value)}
                className="flex-1 w-full p-8 resize-none focus:ring-0 border-none font-mono text-sm leading-relaxed text-gray-700 outline-none"
                placeholder="Write your markdown here..."
              />
            </div>
          </div>

          {/* Preview Pane */}
          <div className="flex-1 h-full overflow-y-auto p-8 flex flex-col items-center gap-12 bg-[#F9F9F7]">
            {pages.map((page, idx) => (
              <MarkdownCard 
                key={idx} 
                content={page} 
                index={idx} 
                total={pages.length} 
                footerText={activeFile.footerText}
                showGrid={activeFile.showGrid}
              />
            ))}
            
            {pages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Type size={48} strokeWidth={1} className="mb-4" />
                <p>No content to preview</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
