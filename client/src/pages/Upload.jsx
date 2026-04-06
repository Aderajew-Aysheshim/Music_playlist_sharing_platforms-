import { FileText, Image as ImageIcon, Music, UploadCloud } from 'lucide-react';
import { useState } from 'react';

import api from '../api/axios';

const formatFileSize = (value) => {
  if (!value) {
    return 'Not selected';
  }

  if (value < 1024 * 1024) {
    return `${Math.round(value / 1024)} KB`;
  }

  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
};

const Upload = () => {
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    lyrics: '',
    synced_lyrics: '',
  });
  const [audioFile, setAudioFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const audioSummary = audioFile
    ? `${audioFile.name} - ${formatFileSize(audioFile.size)}`
    : 'No audio selected';

  const coverSummary = coverImage
    ? `${coverImage.name} - ${formatFileSize(coverImage.size)}`
    : 'No cover selected';

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!audioFile) {
      setMessage('Please select an audio file.');
      return;
    }

    if (!formData.title.trim() || !formData.artist.trim()) {
      setMessage('Title and artist are required.');
      return;
    }

    setLoading(true);
    setMessage('');

    const data = new FormData();
    data.append('title', formData.title.trim());
    data.append('artist', formData.artist.trim());
    data.append('lyrics', formData.lyrics.trim());
    data.append('synced_lyrics', formData.synced_lyrics.trim());
    data.append('audio_file', audioFile);
    if (coverImage) {
      data.append('cover_image', coverImage);
    }

    try {
      const response = await api.post('songs/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data) {
        setMessage('Song uploaded successfully!');
        setFormData({
          title: '',
          artist: '',
          lyrics: '',
          synced_lyrics: '',
        });
        setAudioFile(null);
        setCoverImage(null);

        // Clear file inputs
        const fileInputs = document.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => input.value = '');
      }
    } catch (error) {
      console.error('Upload error:', error);

      if (error.response?.data) {
        const errors = Object.entries(error.response.data)
          .map(([field, messages]) => {
            const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            const errorList = Array.isArray(messages) ? messages.join(', ') : messages;
            return `${fieldName}: ${errorList}`;
          });
        setMessage(errors.join('; '));
      } else if (error.message) {
        setMessage(`Upload failed: ${error.message}`);
      } else {
        setMessage('Upload failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-stack">
      <section className="hero-card">
        <div className="hero-copy">
          <span className="page-tag">
            <UploadCloud size={14} />
            Upload
          </span>
          <h1>Upload a track.</h1>
          <p>Add audio, artwork, and lyrics.</p>
        </div>
        <div className="hero-grid upload-hero-grid">
          <div className="spotlight-card accent">
            <div className="spotlight-icon">
              <Music size={20} />
            </div>
            <h2>Audio</h2>
            <p>{audioSummary}</p>
          </div>
          <div className="spotlight-card">
            <div className="spotlight-icon">
              <ImageIcon size={20} />
            </div>
            <h2>Cover</h2>
            <p>{coverSummary}</p>
          </div>
        </div>
      </section>

      <section className="section-card">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Song publishing</p>
            <h2>Upload details</h2>
          </div>
        </div>

        <div className="upload-layout">
          <form onSubmit={handleSubmit} className="upload-form">
            <div className="upload-grid">
              <div className="form-group">
                <label className="form-label">Song title</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Song title"
                  value={formData.title}
                  onChange={(event) =>
                    setFormData((current) => ({ ...current, title: event.target.value }))
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Artist</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Artist name"
                  value={formData.artist}
                  onChange={(event) =>
                    setFormData((current) => ({ ...current, artist: event.target.value }))
                  }
                  required
                />
              </div>
            </div>

            <div className="upload-grid">
              <div className="form-group">
                <label className="form-label">
                  <FileText size={16} />
                  Full lyrics
                </label>
                <textarea
                  className="form-input"
                  placeholder="Paste the full lyrics here."
                  value={formData.lyrics}
                  onChange={(event) =>
                    setFormData((current) => ({ ...current, lyrics: event.target.value }))
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label accent">
                  <Music size={16} />
                  Synced lyrics
                </label>
                <textarea
                  className="form-input accented"
                  placeholder="[00:10] Line 1&#10;[00:15] Line 2"
                  value={formData.synced_lyrics}
                  onChange={(event) =>
                    setFormData((current) => ({ ...current, synced_lyrics: event.target.value }))
                  }
                />
              </div>
            </div>

            <div className="upload-grid">
              <div className="form-group">
                <label className="form-label">
                  <Music size={16} />
                  Audio file
                </label>
                <input
                  className="form-input file-input"
                  type="file"
                  accept="audio/*"
                  onChange={(event) => setAudioFile(event.target.files?.[0] || null)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <ImageIcon size={16} />
                  Cover image
                </label>
                <input
                  className="form-input file-input"
                  type="file"
                  accept="image/*"
                  onChange={(event) => setCoverImage(event.target.files?.[0] || null)}
                />
              </div>
            </div>

            <button className="btn-primary" type="submit" disabled={loading}>
              <UploadCloud size={16} />
              {loading ? 'Uploading...' : 'Upload'}
            </button>

            {message && (
              <div className={`feedback-text ${message.includes('failed') || message.includes('required') ? 'error' : 'success'}`}>
                {message}
              </div>
            )}
          </form>

          <div className="upload-sidebar">
            <aside className="detail-panel">
              <div className="detail-panel-header">
                <div>
                  <p className="section-kicker">Checklist</p>
                  <h4>Before upload</h4>
                </div>
              </div>
              <div className="info-stack">
                <p>Use a clear title and artist name.</p>
                <p>Add cover art if you have it.</p>
                <p>Synced lyrics use <code>[mm:ss]</code> or <code>[mm:ss.xx]</code>.</p>
                <p>Uploads appear in playlist menus right away.</p>
              </div>
            </aside>

            <aside className="detail-panel upload-stage">
              <div className="detail-panel-header">
                <div>
                  <p className="section-kicker">Summary</p>
                  <h4>What goes live</h4>
                </div>
              </div>

              <div className="upload-file-card">
                <strong>Track file</strong>
                <span>{audioSummary}</span>
              </div>
              <div className="upload-file-card">
                <strong>Cover art</strong>
                <span>{coverSummary}</span>
              </div>
              <div className="upload-file-card">
                <strong>Lyrics mode</strong>
                <span>
                  {formData.synced_lyrics.trim()
                    ? 'Full lyrics + practice mode'
                    : formData.lyrics.trim()
                      ? 'Full lyrics only'
                      : 'No lyrics yet'}
                </span>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Upload;
