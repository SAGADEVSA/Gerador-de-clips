import React from 'react';
import { API_BASE_URL } from '@/lib/api';

interface ClipCardProps {
  id: string;
  title: string;
  score: number;
  duration: string;
  token: string | null;
}

const ClipCard: React.FC<ClipCardProps> = ({ id, title, score, duration, token }) => {
  const handleDownload = async () => {
    if (!token) {
      alert('Você precisa estar autenticado para baixar clips.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/clips/download/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Falha ao baixar o clip');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `clip-${id}.mp4`;
      anchor.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Erro no download: ' + error);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h4 className="font-semibold">{title}</h4>
      <p>Score: {score}</p>
      <p>Duração: {duration}</p>
      <button onClick={handleDownload} className="mt-2 bg-green-500 text-white px-2 py-1 rounded">
        Baixar
      </button>
    </div>
  );
};

export default ClipCard;