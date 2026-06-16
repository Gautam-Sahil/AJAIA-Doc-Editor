import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FileText, Plus, LogOut, User as UserIcon, Users, Upload } from 'lucide-react';
import mammoth from 'mammoth';
import api from '../utils/api';

export default function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

useEffect(() => {
  const fetchDocuments = async () => {
    try {
      const res = await api.get('/documents');
      setDocuments(res.data);
    } catch (error) {
      console.error('Failed to fetch documents', error);
    }
  };

  fetchDocuments();
}, []);

const createNewDocument = async (customTitle = 'Untitled Document', initialContent = '') => {
    try {
      const res = await api.post('/documents', { title: customTitle });
      // If we are passing down imported text from a dashboard upload, update the record instantly
      if (initialContent) {
        await api.put(`/documents/${res.data._id}`, { title: customTitle, content: initialContent });
      }
      navigate(`/document/${res.data._id}`);
    } catch (error) {
      console.error('Failed to create document', error);
    }
  };

  const handleDashboardFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop().toLowerCase();
    const cleanTitle = file.name.replace(/\.[^/.]+$/, "");

    if (fileExtension === 'docx') {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const arrayBuffer = event.target.result;
        const result = await mammoth.convertToHtml({ arrayBuffer });
        createNewDocument(cleanTitle, result.value);
      };
      reader.readAsArrayBuffer(file);
    } else if (fileExtension === 'txt' || fileExtension === 'md') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const formattedHtml = event.target.result.split('\n').map(line => line.trim() ? `<p>${line}</p>` : '<p></p>').join('');
        createNewDocument(cleanTitle, formattedHtml);
      };
      reader.readAsText(file);
    }
  };

  // Separate document tiers into owned vs shared buckets
  const ownedDocs = documents.filter(doc => doc.owner.toString() === user?._id?.toString());
  const sharedDocs = documents.filter(doc => doc.owner.toString() !== user?._id?.toString());

  const renderDocCard = (doc, iconColor) => (
    <div 
      key={doc._id} onClick={() => navigate(`/document/${doc._id}`)}
      className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.15)] transition-all cursor-pointer group"
    >
      <div className={`bg-slate-800/50 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600/20 transition-colors`}>
        <FileText className={`text-slate-400 group-hover:${iconColor}`} />
      </div>
      <h3 className="font-semibold truncate text-slate-100">{doc.title || 'Untitled Document'}</h3>
      <p className="text-xs text-slate-500 mt-2">Last modified {new Date(doc.updatedAt).toLocaleDateString()}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Ajaia Workspace</h1>
            <p className="text-slate-400 mt-1">Welcome back, {user?.name}</p>
          </div>
          <button onClick={logout} className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors text-sm font-medium">
            <LogOut size={16} /> Sign Out
          </button>
        </header>

        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <UserIcon className="text-blue-500" size={20} />
            <h2 className="text-xl font-semibold">My Documents</h2>
          </div>
          <button onClick={createNewDocument} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg font-medium transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] text-sm">
            <Plus size={16} /> New Document
          </button>
          <input type="file" id="dash-file-upload" accept=".txt,.md,.docx" onChange={handleDashboardFileUpload} className="hidden" />
<button 
  onClick={() => document.getElementById('dash-file-upload').click()} 
  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg font-medium border border-slate-700 text-sm transition-colors"
>
  <Upload size={16} /> Create from File
</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
          {ownedDocs.map(doc => renderDocCard(doc, 'text-blue-400'))}
          {ownedDocs.length === 0 && (
            <div className="col-span-full text-center py-8 text-slate-500 bg-slate-900/10 rounded-xl border border-slate-800 border-dashed text-sm">You haven't generated any canvas entries yet.</div>
          )}
        </div>

        <div className="flex items-center gap-2 mb-8 border-t border-slate-900 pt-8">
          <Users className="text-purple-500" size={20} />
          <h2 className="text-xl font-semibold">Shared with Me</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sharedDocs.map(doc => renderDocCard(doc, 'text-purple-400'))}
          {sharedDocs.length === 0 && (
            <div className="col-span-full text-center py-8 text-slate-500 bg-slate-900/10 rounded-xl border border-slate-800 border-dashed text-sm">No incoming collaboration streams found.</div>
          )}
        </div>
      </div>
    </div>
  );
}