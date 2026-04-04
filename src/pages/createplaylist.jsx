import { useState } from 'react';
import { Upload as UploadIcon, Music, Image as ImageIcon, FileText } from 'lucide-react';
import api from '../api/axios';

const Upload = () => {
  const [formData, setFormData] = useState({ title: '', artist: '', lyrics: '', synced_lyrics: '' });
  const [audioFile, setAudioFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!audioFile) {
      setMessage('Audio file is required');
      return;
    }
    
    setLoading(true);
    setMessage('');
    
    const data = new FormData();
    data.append('title', formData.title);
    data.append('artist', formData.artist);
    data.append('lyrics', formData.lyrics);
    data.append('synced_lyrics', formData.synced_lyrics);
    data.append('audio_file', audioFile);
    if (coverImage) {
      data.append('cover_image', coverImage);
    }

    try {
      await api.post('songs/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage('Song uploaded successfully!');
      setFormData({ title: '', artist: '', lyrics: '', synced_lyrics: '' });
      setAudioFile(null);
      setCoverImage(null);
    } catch (err) {
      setMessage(Object.values(err.response?.data || {}).flat().join(', ') || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center" style={{ minHeight: '60vh', paddingBottom: '140px' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '800px', padding: '2.5rem', borderRadius: '24px' }}>
        <h2 className="heading text-center flex items-center justify-center gap-3 mb-8" style={{ fontSize: '2.5rem' }}>
          <UploadIcon size={32} style={{ color: 'var(--primary)' }} />
          Publish New Music
        </h2>

        {message && (
          <div style={{ padding: '1.25rem', borderRadius: '12px', marginBottom: '2rem', textAlign: 'center', backgroundColor: message.includes('successfully') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: message.includes('successfully') ? '#10b981' : '#ef4444', border: message.includes('successfully') ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="form-label">Song Title</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Bohemian Rhapsody"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Artist</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Queen"
                value={formData.artist}
                onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="form-group">
               <label className="form-label flex items-center gap-2"><FileText size={16}/> Normal Lyrics</label>
               <textarea 
                 className="form-input" 
                 placeholder="Paste text normally here..."
                 value={formData.lyrics}
                 onChange={(e) => setFormData({ ...formData, lyrics: e.target.value })}
                 style={{ minHeight: '180px', resize: 'vertical' }}
               />
             </div>

             <div className="form-group">
               <label className="form-label flex items-center gap-2" style={{ color: 'var(--secondary)' }}>
                 <Music size={16}/> Practice Mode (Synced) 
               </label>
               <textarea 
                 className="form-input" 
                 placeholder="[00:10] First Line&#10;[00:15] Second Line..."
                 value={formData.synced_lyrics}
                 onChange={(e) => setFormData({ ...formData, synced_lyrics: e.target.value })}
                 style={{ minHeight: '180px', resize: 'vertical', border: '1px solid rgba(236,72,153,0.3)' }}
               />
               <div style={{ backgroundColor: 'rgba(236,72,153,0.05)', padding: '1rem', borderRadius: '12px', marginTop: '1rem', border: '1px dashed rgba(236,72,153,0.2)' }}>
                 <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>Format Guide:</p>
                 <code style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', lineHeight: '1.6' }}>
                   [00:12] Hello world!<br/>
                   [00:15] This is the second line<br/>
                   [00:20.50] Use decimals for precision!
                 </code>
               </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="form-label flex items-center gap-2"><Music size={16}/> Audio File</label>
              <input 
                type="file" 
                accept="audio/*"
                className="form-input" 
                onChange={(e) => setAudioFile(e.target.files[0])}
                style={{ padding: '0.4rem' }}
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label flex items-center gap-2"><ImageIcon size={16}/> Cover (Optional)</label>
              <input 
                type="file" 
                accept="image/*"
                className="form-input" 
                onChange={(e) => setCoverImage(e.target.files[0])}
                style={{ padding: '0.4rem' }}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '1.25rem', fontSize: '1.1rem', marginTop: '1rem', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Uploading Magic...' : 'Publish Song'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Upload;