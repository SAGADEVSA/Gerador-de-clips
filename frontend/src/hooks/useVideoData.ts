import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/api';

interface Clip {
  id: string;
  title: string;
  score: number;
  start: number;
  end: number;
  hook?: string;
  fileUrl: string;
}

interface Video {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  clips: Clip[];
}

export const useVideos = (token: string | null, refreshKey?: number) => {
  const [data, setData] = useState<Video[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      if (!token) {
        setError('Usuário não autenticado');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/videos`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error('Falha ao buscar vídeos');
        const videos = await response.json();
        setData(videos);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      setLoading(true);
      fetchVideos();
    } else {
      setData(null);
      setLoading(false);
    }
  }, [token, refreshKey]);

  return { data, loading, error };
};

export const useClips = (videoId: string) => {
  const [data, setData] = useState<Clip[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClips = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/clips/${videoId}`);
        if (!response.ok) throw new Error('Failed to fetch clips');
        const clips = await response.json();
        setData(clips);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (videoId) fetchClips();
  }, [videoId]);

  return { data, loading, error };
};