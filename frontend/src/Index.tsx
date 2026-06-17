import UploadZone from '@/components/UploadZone';
import StatsGrid from '@/components/StatsGrid';
import ClipCard from '@/components/ClipCard';
import RecentVideos from '@/components/RecentVideos';
import AuthForm from '@/components/AuthForm';
import { useVideos } from '@/hooks/useVideoData';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

const Index = () => {
  const { user, token, loading, isAuthenticated, login, register, logout } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const { data: videos, loading: videosLoading, error: videosError } = useVideos(token, refreshKey);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (loading) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <AuthForm onLogin={login} onRegister={register} />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Transforme vídeos longos em clips virais com IA
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="text-sm text-gray-700">
            Olá, {user?.name || user?.email}
          </div>
          <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded">
            Sair
          </button>
          <button onClick={handleRefresh} className="bg-gray-500 text-white px-4 py-2 rounded">
            Atualizar
          </button>
        </div>
      </div>

      <StatsGrid videos={videos} />

      <section>
        <h2 className="mb-3 text-base font-semibold text-foreground">Novo Vídeo</h2>
        <UploadZone token={token} onUpload={handleRefresh} />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Últimos Clips</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {videos && videos.length > 0 ? (
            videos
              .flatMap((video) => video.clips)
              .slice(0, 6)
              .map((clip) => (
                <ClipCard
                  key={clip.id}
                  id={clip.id}
                  title={clip.title}
                  score={clip.score}
                  duration={`${Math.round(clip.end - clip.start)}s`}
                  token={token}
                />
              ))
          ) : (
            <div className="col-span-full text-center py-8 text-sm text-muted-foreground">
              {videosLoading ? 'Carregando clips...' : 'Seus clips aparecerão aqui após processar um vídeo.'}
            </div>
          )}
        </div>
      </section>

      <RecentVideos videos={videos} token={token} onProcess={handleRefresh} />

      {videosError && <div className="text-red-600">{videosError}</div>}
    </div>
  );
};

export default Index;
