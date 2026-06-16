import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import mammoth from 'mammoth';
import { 
  Share2, Upload, Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, List, ListOrdered, Quote, Code, Paperclip, FileText,
  ArrowLeft, Loader2, Check, AlertCircle, X, Download, FileCode, Save, Clock,
  Eye, Trash2
} from 'lucide-react';
import api from '../utils/api';
import useDebounce from '../hooks/useDebounce';

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState({ message: '', isError: false });
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString());
  const [lastModifiedTime, setLastModifiedTime] = useState('');
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [showAttachmentViewer, setShowAttachmentViewer] = useState(false);

  // Interface Toggle Triggers
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [isAttachmentSidebarOpen, setIsAttachmentSidebarOpen] = useState(false);
  
  const [shareEmail, setShareEmail] = useState('');
  const [shareRole, setShareRole] = useState('viewer');
  const [isSharingAction, setIsSharingAction] = useState(false);

  const isContentInitialized = useRef(false);
  const fileInputRef = useRef(null);
  const attachmentInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Add this helper at the top of your component
const getFriendlyType = (mimeType) => {
  if (!mimeType) return 'File';
  if (mimeType.includes('word')) return 'Word';
  if (mimeType.includes('spreadsheet')) return 'Excel';
  if (mimeType.includes('pdf')) return 'PDF';
  if (mimeType.includes('image')) return 'Image';
  if (mimeType.includes('text')) return 'Text';
  if (mimeType.includes('json')) return 'JSON';
  return 'File';
};

  // --- MOVED triggerSave BEFORE it's used in useEffect ---
  const triggerSave = async (isManual = false, updatedAttachments = null) => {
    if (isLoading || !isContentInitialized.current) return;
    setIsSaving(true);
    try {
      const res = await api.put(`/documents/${id}`, { 
        title, 
        content,
        attachments: updatedAttachments || attachments
      });
      const updatedTimestamp = new Date(res.data.updatedAt).toLocaleString();
      setLastModifiedTime(updatedTimestamp);
      
      if (isManual) {
        setNotification({ message: `Document saved successfully at ${updatedTimestamp}`, isError: false });
        setTimeout(() => setNotification({ message: '', isError: false }), 3000);
      }
      setTimeout(() => setIsSaving(false), 600);
    } catch (error) {
      console.error("Save error:", error);
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    editorProps: {
      attributes: { class: 'prose prose-invert max-w-none focus:outline-none min-h-[55vh] p-6 text-slate-100 whitespace-pre-wrap' },
    },
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsExportDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await api.get(`/documents/${id}`);
        setTitle(res.data.title || 'Untitled Document');
        setContent(res.data.content || '');
        setAttachments(res.data.attachments || []);
        setLastModifiedTime(new Date(res.data.updatedAt).toLocaleString());
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch document:", error);
        navigate('/');
      }
    };
    if (editor) fetchDoc();
  }, [id, editor, navigate]);

  useEffect(() => {
    if (editor && !isLoading && !isContentInitialized.current) {
      editor.commands.setContent(content);
      isContentInitialized.current = true;
    }
  }, [editor, isLoading, content]);

  const debouncedContent = useDebounce(content, 1500);
  const debouncedTitle = useDebounce(title, 1500);

  // --- Now this useEffect can use triggerSave safely ---
  useEffect(() => {
    if (!isLoading && isContentInitialized.current) {
      triggerSave(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedContent, debouncedTitle]);

  // --- RECONSTRUCTED NATIVE FILE INGESTION LAYER (.txt, .md, .docx) ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    setNotification({ message: '', isError: false });
    if (!file) return;

    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (fileExtension === 'docx') {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target.result;
          const result = await mammoth.convertToHtml({ arrayBuffer });
          if (editor) {
            editor.commands.setContent(result.value);
            setContent(result.value);
            if (title === 'Untitled Document') setTitle(file.name.replace(/\.[^/.]+$/, ""));
          }
        } catch {
          setNotification({ message: 'Failed parsing external Word Document.', isError: true });
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (fileExtension === 'txt' || fileExtension === 'md') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const formattedHtml = event.target.result.split('\n').map(line => line.trim() ? `<p>${line}</p>` : '<p></p>').join('');
        if (editor) {
          editor.commands.setContent(formattedHtml);
          setContent(formattedHtml);
          if (title === 'Untitled Document') setTitle(file.name.replace(/\.[^/.]+$/, ""));
        }
      };
      reader.readAsText(file);
    } else {
      setNotification({ message: 'File format unreadable. Only .txt, .md, or .docx files are supported.', isError: true });
    }
  };

  const handleAttachmentUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const newAttachment = {
        name: file.name,
        type: file.type,
        data: reader.result
      };
      const updatedList = [...attachments, newAttachment];
      setAttachments(updatedList);
      triggerSave(false, updatedList);
      setNotification({ message: `"${file.name}" attached successfully`, isError: false });
      setTimeout(() => setNotification({ message: '', isError: false }), 3000);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // --- VIEW ATTACHMENT ---
  const viewAttachment = (attachment) => {
    setSelectedAttachment(attachment);
    setShowAttachmentViewer(true);
  };

  // --- DOWNLOAD ATTACHMENT ---
  const downloadAttachment = (attachment) => {
    try {
      // Extract base64 data
      const base64Data = attachment.data.split(',')[1] || attachment.data;
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: attachment.type || 'application' });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      setNotification({ message: 'Failed to download attachment', isError: true });
    }
  };

  // --- REMOVE ATTACHMENT ---
  const removeAttachment = (index) => {
    const updatedList = attachments.filter((_, i) => i !== index);
    setAttachments(updatedList);
    triggerSave(false, updatedList);
    setNotification({ message: 'Attachment removed', isError: false });
    setTimeout(() => setNotification({ message: '', isError: false }), 2000);
  };

  // --- Added handleShareSubmit function ---
  const handleShareSubmit = async (e) => {
    e.preventDefault();
    if (!shareEmail) {
      setNotification({ message: 'Please enter an email address', isError: true });
      return;
    }
    
    setIsSharingAction(true);
    try {
      await api.post(`/documents/${id}/share`, {
        email: shareEmail,
        role: shareRole
      });
      setNotification({ message: `Document shared with ${shareEmail} as ${shareRole}`, isError: false });
      setIsShareModalOpen(false);
      setShareEmail('');
      setShareRole('viewer');
      setTimeout(() => setNotification({ message: '', isError: false }), 3000);
    } catch (error) {
      setNotification({ 
        message: error.response?.data?.error || 'Failed to share document', 
        isError: true 
      });
    } finally {
      setIsSharingAction(false);
    }
  };

  const wordCount = editor ? editor.getText().trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = editor ? editor.getText().length : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="animate-spin text-blue-500" size={32} />
        <span className="text-sm font-medium tracking-wide">Syncing workspace data...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col print:bg-white print:text-black">
      
      {/* Top Metrics Ribbon */}
      <div className="bg-slate-900 px-6 py-1 border-b border-slate-800 text-[11px] font-mono tracking-wider text-slate-500 flex justify-between select-none print:hidden">
        <span>ENVIRONMENT: MERN_PRODUCTION_STACK_ACTIVE</span>
        <span className="text-blue-400 font-semibold">CURRENT SESSION: {currentTime}</span>
      </div>

      {/* Main Structural Nav Layer */}
      <nav className="flex items-center justify-between px-6 py-4 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 sticky top-0 z-10 print:hidden">
        
        {/* Left Hand Cluster: Title, System Status, and Presence Avatars */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          
          <input 
            type="text" 
            value={title} 
            placeholder="Untitled Document" 
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 w-56 text-slate-100 border-b border-transparent hover:border-slate-800 transition-all"
          />
          
          <div className="flex items-center text-xs text-slate-400 font-medium bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 h-7 select-none">
            {isSaving ? (
              <><Loader2 size={12} className="animate-spin mr-1.5 text-blue-400" /> Syncing...</>
            ) : (
              <><Check size={12} className="text-green-500 mr-1.5" /> Saved</>
            )}
          </div>

          {/* User Presence Avatars */}
          <div className="flex -space-x-1.5 items-center ml-2 select-none border-l border-slate-800 pl-4 h-6">
            <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center text-[9px] font-bold text-slate-950 shadow-md">JD</div>
            <div className="w-6 h-6 rounded-full bg-purple-500 border-2 border-slate-950 flex items-center justify-center text-[9px] font-bold text-white shadow-md">SM</div>
            <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-slate-950 flex items-center justify-center text-[9px] font-bold text-white shadow-md ring-2 ring-blue-500/30 animate-pulse">You</div>
          </div>
        </div>

        {/* Center-Right Desk Layout Section */}
        <div className="flex items-center gap-4 ml-auto mr-6">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 font-medium bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 select-none">
            <Clock size={13} className="text-blue-400" />
            <span>Modified: {lastModifiedTime || 'Fresh Instance'}</span>
          </div>

          <button 
            onClick={() => triggerSave(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all text-sm font-medium shadow-[0_0_15px_rgba(37,99,235,0.25)] border border-blue-500 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Save size={15} /> Save Canvas
          </button>
        </div>
        
        {/* Far-Right Utilities Control Deck */}
        <div className="flex gap-2 items-center">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".txt,.md,.docx" 
            className="hidden" 
          />
          <input 
            type="file" 
            ref={attachmentInputRef} 
            onChange={handleAttachmentUpload} 
            className="hidden" 
          />
          
          <button 
            onClick={() => setIsAttachmentSidebarOpen(true)} 
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-sm font-medium border border-slate-700 relative"
          >
            <Paperclip size={14} /> Attachments
            {attachments.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                {attachments.length}
              </span>
            )}
          </button>

          <button 
            onClick={() => fileInputRef.current?.click()} 
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-sm font-medium border border-slate-700"
          >
            <Upload size={14} /> Import File
          </button>
          
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)} 
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-sm font-medium border border-slate-700"
            >
              <Download size={14} /> Export
            </button>
            {isExportDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 py-1">
                <button 
                  onClick={() => { 
                    const markdown = editor?.getText() || ''; 
                    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' }); 
                    const url = URL.createObjectURL(blob); 
                    const link = document.createElement('a'); 
                    link.href = url; 
                    link.setAttribute('download', `${title || 'Untitled'}.md`); 
                    document.body.appendChild(link); 
                    link.click(); 
                    document.body.removeChild(link); 
                    setIsExportDropdownOpen(false); 
                  }} 
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 transition-colors text-left"
                >
                  <FileCode size={14} className="text-blue-400" /> Markdown (.md)
                </button>
                <button 
                  onClick={() => { 
                    window.print(); 
                    setIsExportDropdownOpen(false); 
                  }} 
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 transition-colors text-left"
                >
                  <FileText size={14} className="text-purple-400" /> PDF Document
                </button>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setIsShareModalOpen(true)} 
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium border border-slate-700 transition-all"
          >
            <Share2 size={14} /> Share
          </button>
        </div>
      </nav>

      {/* Primary Layout Block */}
      <div className="flex flex-grow relative overflow-hidden">
        <main className="flex-grow max-w-4xl w-full mx-auto p-8 print:p-0 print:max-w-none transition-all duration-300">
          {notification.message && (
            <div className={`flex items-center gap-2 border p-4 rounded-xl mb-6 text-sm print:hidden ${notification.isError ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-green-500/10 border-green-500/30 text-green-400'}`}>
              <AlertCircle size={16} />
              <span>{notification.message}</span>
            </div>
          )}

          <div className="bg-slate-900 rounded-xl shadow-2xl border border-slate-800 overflow-hidden print:bg-transparent print:border-none print:shadow-none">
            <div className="flex flex-wrap gap-1 p-2 bg-slate-950 border-b border-slate-800 print:hidden select-none items-center">
              <button 
                onClick={() => editor?.chain().focus().toggleBold().run()} 
                className={`p-2 rounded hover:bg-slate-800 transition-colors ${editor?.isActive('bold') ? 'bg-slate-800 text-blue-400' : ''}`}
              >
                <Bold size={16} />
              </button>
              <button 
                onClick={() => editor?.chain().focus().toggleItalic().run()} 
                className={`p-2 rounded hover:bg-slate-800 transition-colors ${editor?.isActive('italic') ? 'bg-slate-800 text-blue-400' : ''}`}
              >
                <Italic size={16} />
              </button>
              <button 
                onClick={() => editor?.chain().focus().toggleUnderline().run()} 
                className={`p-2 rounded hover:bg-slate-800 transition-colors ${editor?.isActive('underline') ? 'bg-slate-800 text-blue-400' : ''}`}
              >
                <UnderlineIcon size={16} />
              </button>
              <button 
                onClick={() => editor?.chain().focus().toggleStrike().run()} 
                className={`p-2 rounded hover:bg-slate-800 transition-colors ${editor?.isActive('strike') ? 'bg-slate-800 text-blue-400' : ''}`}
              >
                <Strikethrough size={16} />
              </button>
              <div className="w-px h-5 bg-slate-800 mx-1.5" />
              <button 
                onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} 
                className={`p-2 rounded hover:bg-slate-800 transition-colors ${editor?.isActive('heading', { level: 1 }) ? 'bg-slate-800 text-blue-400' : ''}`}
              >
                <Heading1 size={16} />
              </button>
              <button 
                onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} 
                className={`p-2 rounded hover:bg-slate-800 transition-colors ${editor?.isActive('heading', { level: 2 }) ? 'bg-slate-800 text-blue-400' : ''}`}
              >
                <Heading2 size={16} />
              </button>
              <div className="w-px h-5 bg-slate-800 mx-1.5" />
              <button 
                onClick={() => editor?.chain().focus().toggleBulletList().run()} 
                className={`p-2 rounded hover:bg-slate-800 transition-colors ${editor?.isActive('bulletList') ? 'bg-slate-800 text-blue-400' : ''}`}
              >
                <List size={16} />
              </button>
              <button 
                onClick={() => editor?.chain().focus().toggleOrderedList().run()} 
                className={`p-2 rounded hover:bg-slate-800 transition-colors ${editor?.isActive('orderedList') ? 'bg-slate-800 text-blue-400' : ''}`}
              >
                <ListOrdered size={16} />
              </button>
              <div className="w-px h-5 bg-slate-800 mx-1.5" />
              <button 
                onClick={() => editor?.chain().focus().toggleBlockquote().run()} 
                className={`p-2 rounded hover:bg-slate-800 transition-colors ${editor?.isActive('blockquote') ? 'bg-slate-800 text-blue-400' : ''}`}
              >
                <Quote size={16} />
              </button>
              <button 
                onClick={() => editor?.chain().focus().toggleCodeBlock().run()} 
                className={`p-2 rounded hover:bg-slate-800 transition-colors ${editor?.isActive('codeBlock') ? 'bg-slate-800 text-blue-400' : ''}`}
              >
                <Code size={16} />
              </button>
            </div>
            
            <div className="print:text-black print:prose-neutral text-slate-100">
              <EditorContent editor={editor} />
            </div>

            <div className="bg-slate-950 px-6 py-2 border-t border-slate-800 text-xs text-slate-500 flex gap-4 select-none print:hidden font-medium">
              <span>Words: <strong className="text-slate-300 font-semibold">{wordCount}</strong></span>
              <span>Characters: <strong className="text-slate-300 font-semibold">{charCount}</strong></span>
            </div>
          </div>
        </main>

        {/* Attachment Sidebar with View, Download, Remove */}
        {isAttachmentSidebarOpen && (
          <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col p-6 absolute right-0 top-0 bottom-0 z-20 shadow-2xl overflow-y-auto">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-slate-900 py-2">
              <h4 className="text-sm font-bold tracking-wider uppercase text-slate-400 flex items-center gap-2">
                <Paperclip size={16} className="text-blue-500" /> Attached Files ({attachments.length})
              </h4>
              <button onClick={() => setIsAttachmentSidebarOpen(false)} className="text-slate-500 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <button 
              onClick={() => attachmentInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-slate-700 hover:border-blue-500 rounded-xl text-xs font-semibold text-slate-400 hover:text-blue-400 transition-all bg-slate-950/40 mb-6"
            >
              <Upload size={14} /> Add Attachment
            </button>

            <div className="flex-grow space-y-3">
              {attachments.map((file, index) => (
                <div key={index} className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-500/10 p-2 rounded-lg text-blue-400 shrink-0">
                      <FileText size={16} />
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-xs font-semibold truncate text-slate-200">{file.name}</p>
                      <p className="text-[10px] text-slate-500">
  {getFriendlyType(file.type)}
</p>
                    </div>
                    <div className="flex gap-1">
                      {/* View Button */}
                      <button 
                        onClick={() => viewAttachment(file)}
                        className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-blue-400"
                        title="View"
                      >
                        <Eye size={14} />
                      </button>
                      {/* Download Button */}
                      <button 
                        onClick={() => downloadAttachment(file)}
                        className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-green-400"
                        title="Download"
                      >
                        <Download size={14} />
                      </button>
                      {/* Remove Button */}
                      <button 
                        onClick={() => removeAttachment(index)}
                        className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-red-400"
                        title="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {attachments.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-8">No attachments found.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Attachment Viewer Modal */}
      {showAttachmentViewer && selectedAttachment && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[80vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <FileText size={16} className="text-blue-400" />
                {selectedAttachment.name}
              </h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => downloadAttachment(selectedAttachment)}
                  className="text-slate-400 hover:text-green-400 transition-colors p-1"
                  title="Download"
                >
                  <Download size={18} />
                </button>
                <button 
                  onClick={() => {
                    setShowAttachmentViewer(false);
                    setSelectedAttachment(null);
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="p-4 overflow-y-auto flex-grow">
              {selectedAttachment.type?.startsWith('image/') ? (
                <img 
                  src={selectedAttachment.data} 
                  alt={selectedAttachment.name}
                  className="max-w-full h-auto rounded-lg"
                />
              ) : selectedAttachment.type?.startsWith('text/') || 
                  selectedAttachment.name.endsWith('.txt') ||
                  selectedAttachment.name.endsWith('.md') ||
                  selectedAttachment.name.endsWith('.json') ||
                  selectedAttachment.name.endsWith('.js') ||
                  selectedAttachment.name.endsWith('.css') ||
                  selectedAttachment.name.endsWith('.html') ? (
                <pre className="whitespace-pre-wrap text-sm text-slate-300 bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono max-h-[50vh] overflow-y-auto">
                  {(() => {
                    try {
                      const base64Data = selectedAttachment.data.split(',')[1] || selectedAttachment.data;
                      const decoded = atob(base64Data);
                      // Try to format JSON if it looks like JSON
                      try {
                        const parsed = JSON.parse(decoded);
                        return JSON.stringify(parsed, null, 2);
                      } catch {
                        return decoded;
                      }
                    } catch {
                      return 'Unable to display file content';
                    }
                  })()}
                </pre>
              ) : (
                <div className="text-center text-slate-400 py-8">
                  <FileText size={48} className="mx-auto mb-4 text-slate-600" />
                  <p>Preview not available for this file type</p>
                  <button 
                    onClick={() => downloadAttachment(selectedAttachment)}
                    className="mt-4 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    Download File
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
            <button 
              onClick={() => setIsShareModalOpen(false)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold text-slate-100 mb-2 flex items-center gap-2">
              <Share2 size={18} className="text-blue-500" /> Share Document
            </h3>
            <p className="text-slate-400 text-xs mb-6">Manage user access and permissions.</p>
            
            <form onSubmit={handleShareSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Collaborator Email
                </label>
                <input 
                  type="email" 
                  required 
                  placeholder="name@domain.com" 
                  value={shareEmail} 
                  onChange={(e) => setShareEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Access Level
                </label>
                <select 
                  value={shareRole} 
                  onChange={(e) => setShareRole(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="viewer">Can View Only (Read-Only)</option>
                  <option value="editor">Can Edit & Modify (Full Write)</option>
                </select>
              </div>
              <button 
                type="submit" 
                disabled={isSharingAction} 
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-colors mt-6 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSharingAction ? <Loader2 size={18} className="animate-spin" /> : 'Grant Permissions'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}