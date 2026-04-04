import React, { useState } from 'react';

interface UploadZoneProps {
  userId: string;
  onUpload?: () => void;
}

const UploadZone: React.FC<UploadZoneProps> = ({ userId, onUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('video', file);
    formData.append('userId', userId);

    try {
      const response = await fetch('http://localhost:8080/api/upload', {
        method: 'POST',
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
    if (!youtubeUrl) return;

    setUploading(true);
    try {
      const response = await fetch('http://localhost:8080/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, youtubeUrl }),
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