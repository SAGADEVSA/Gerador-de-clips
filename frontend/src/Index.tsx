import UploadZone from "@/components/UploadZone";
import StatsGrid from "@/components/StatsGrid";
import ClipCard from "@/components/ClipCard";
import RecentVideos from "@/components/RecentVideos";
import { useVideos } from "@/hooks/useVideoData";
import { useState } from "react";

const userId = 'test'; // Hardcoded for demo

const Index = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const { data: videos } = useVideos(userId);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Transforme vídeos longos em clips virais com IA
          </p>
        </div>
        <button onClick={handleRefresh} className="bg-gray-500 text-white px-4 py-2 rounded">
          Atualizar
        </button>
      </div>

      <StatsGrid videos={videos} />

      <section>
        <h2 className="mb-3 text-base font-semibold text-foreground">Novo Vídeo</h2>
        <UploadZone userId={userId} onUpload={handleRefresh} />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Últimos Clips</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {videos && videos.length > 0 ? (
            videos.flatMap(video => video.clips).slice(0, 6).map((clip) => (
              <ClipCard
                key={clip.id}
                id={clip.id}
                title={clip.title}
                score={clip.score}
                duration={`${Math.round((clip.end_time - clip.start_time))}s`}
                status={clip.status === "ready" ? "READY" : "PROCESSING"}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-sm text-muted-foreground">
              Seus clips aparecerão aqui após processar um vídeo.
            </div>
          )}
        </div>
      </section>

      <RecentVideos videos={videos} onProcess={handleRefresh} />
    </div>
  );
};

export default Index;
