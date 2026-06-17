import React, { useState } from 'react';
import { API_BASE_URL } from '@/lib/api';

interface UploadZoneProps {
  token: string | null;
  onUpload?: () => void;
}

const UploadZone: React.FC<UploadZoneProps> = ({ token, onUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async () => {
    if (!file || !token) {
      alert('Você precisa estar autenticado para enviar vídeos.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('video', file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');
      const result = await response.json();
      alert('Vídeo enviado com sucesso!');
      console.log(result);
      onUpload?.();
    } catch (error) {
      alert('Erro no upload: ' + error);
    } finally {
      setUploading(false);
    }
  };

  const handleYouTubeUpload = async () => {
    if (!youtubeUrl || !token) {
      alert('Você precisa estar autenticado para enviar vídeos.');
      return;
    }

    setUploading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ youtubeUrl }),
      });
      if (!response.ok) throw new Error('Upload failed');
      const result = await response.json();
      alert('Vídeo do YouTube enviado com sucesso!');
      console.log(result);
      onUpload?.();
    } catch (error) {
      alert('Erro no upload: ' + error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center space-y-4">
      <div>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="mb-2"
        />
        <button
          onClick={handleFileUpload}
          disabled={!file || uploading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {uploading ? 'Enviando...' : 'Enviar Arquivo'}
        </button>
      </div>
      <div>
        <input
          type="text"
          placeholder="URL do YouTube"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          className="border p-2 w-full mb-2"
        />
        <button
          onClick={handleYouTubeUpload}
          disabled={!youtubeUrl || uploading}
          className="bg-red-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {uploading ? 'Enviando...' : 'Enviar do YouTube'}
        </button>
      </div>
    </div>
  );
};

export default UploadZone;