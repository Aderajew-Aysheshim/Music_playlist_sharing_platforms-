import { useState } from 'react';
import { Upload as UploadIcon, Music, Image as ImageIcon } from 'lucide-react';
import api from '../api/axios';

const Upload = () => {
  const [formData, setFormData] = useState({ title: '', artist: '' });
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
    data.append('audio_file', audioFile);
    if (coverImage) {
      data.append('cover_image', coverImage);
    }

    try {
      await api.post('songs/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage('Song uploaded successfully!');
      setFormData({ title: '', artist: '' });
      setAudioFile(null);
      setCoverImage(null);
    } catch (err) {
      setMessage(Object.values(err.response?.data || {}).flat().join(', ') || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center" style={{ minHeight: '60vh', paddingBottom: '100px' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
        <h2 className="heading text-center flex items-center justify-center gap-2 mb-8" style={{ fontSize: '2rem' }}>
          <UploadIcon size={24} style={{ color: 'var(--primary)' }} />
          Upload Song
        </h2>

        {message && (
          <div style={{ padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', backgroundColor: message.includes('successfully') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: message.includes('successfully') ? '#10b981' : '#ef4444' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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

          <div className="form-group">
            <label className="form-label flex items-center gap-2"><Music size={16}/> Audio File (MP3/WAV)</label>
            <input 
              type="file" 
              accept="audio/*"
              className="form-input" 
              onChange={(e) => setAudioFile(e.target.files[0])}
              style={{ padding: '0.5rem' }}
              required 
            />
          </div>

          <div className="form-group mb-8">
            <label className="form-label flex items-center gap-2"><ImageIcon size={16}/> Cover Image (Optional)</label>
            <input 
              type="file" 
              accept="image/*"
              className="form-input" 
              onChange={(e) => setCoverImage(e.target.files[0])}
              style={{ padding: '0.5rem' }}
            />
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading} style={{ padding: '1rem', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Uploading...' : 'Upload Now'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Upload;
