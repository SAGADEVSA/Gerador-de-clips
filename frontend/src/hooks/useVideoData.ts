import { useState, useEffect } from 'react';

interface Clip {
  id: string;
  title: string;
  score: number;
  start_time: number;
  end_time: number;
  status: string;
  fileUrl: string;
}

interface Video {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  clips: Clip[];
}

import { useState, useEffect } from 'react';

interface Clip {
  id: string;
  title: string;
  score: number;
  start_time: number;
  end_time: number;
  status: string;
  fileUrl: string;
}

interface Video {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  clips: Clip[];
}

export const useVideos = (userId: string, refreshKey?: number) => {
  const [data, setData] = useState<Video[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/videos?userId=${userId}`);
        if (!response.ok) throw new Error('Failed to fetch videos');
        const videos = await response.json();
        setData(videos);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchVideos();
  }, [userId, refreshKey]);

  return { data, loading, error };
};

export const useClips = (videoId: string) => {
  const [data, setData] = useState<Clip[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClips = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/clips/${videoId}`);
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