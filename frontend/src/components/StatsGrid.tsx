import React from 'react';

interface Video {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  clips: any[];
}

interface StatsGridProps {
  videos: Video[] | null;
}

const StatsGrid: React.FC<StatsGridProps> = ({ videos }) => {
  const totalVideos = videos?.length || 0;
  const totalClips = videos?.reduce((sum, video) => sum + video.clips.length, 0) || 0;
  const processingVideos = videos?.filter(video => video.status === 'processing').length || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold">Total de Vídeos</h3>
        <p className="text-2xl">{totalVideos}</p>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold">Clips Gerados</h3>
        <p className="text-2xl">{totalClips}</p>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold">Vídeos Processando</h3>
        <p className="text-2xl">{processingVideos}</p>
      </div>
    </div>
  );
};

export default StatsGrid;