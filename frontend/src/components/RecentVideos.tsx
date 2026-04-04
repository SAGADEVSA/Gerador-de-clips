import React, { useState } from 'react';

interface Video {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  clips: any[];
}

interface RecentVideosProps {
  videos: Video[] | null;
  onProcess?: () => void;
}

const RecentVideos: React.FC<RecentVideosProps> = ({ videos, onProcess }) => {
  const [processing, setProcessing] = useState<string | null>(null);

  const handleProcess = async (videoId: string) => {
    setProcessing(videoId);
    try {
      const response = await fetch('http://localhost:8080/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId }),
      });
      if (!response.ok) throw new Error('Process failed');
      alert('Processamento iniciado!');
      onProcess?.();
    } catch (error) {
      alert('Erro no processamento: ' + error);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <section>
      <h2 className="text-base font-semibold">Vídeos Recentes</h2>
      <div className="space-y-2">
        {videos && videos.length > 0 ? (
          videos.slice(0, 5).map((video) => (
            <div key={video.id} className="flex justify-between items-center p-2 border rounded">
              <div>
                <p className="font-medium">{video.title}</p>
                <p className="text-sm text-gray-500">Status: {video.status}</p>
              </div>
              <button
                onClick={() => handleProcess(video.id)}
                disabled={processing === video.id}
                className="bg-blue-500 text-white px-3 py-1 rounded disabled:opacity-50"
              >
                {processing === video.id ? 'Processando...' : 'Processar'}
              </button>
            </div>
          ))
        ) : (
          <p>Nenhum vídeo encontrado.</p>
        )}
      </div>
    </section>
  );
};

export default RecentVideos;