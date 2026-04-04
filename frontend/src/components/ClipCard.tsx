import React from 'react';

interface ClipCardProps {
  id: string;
  title: string;
  score: number;
  duration: string;
  status: string;
}

const ClipCard: React.FC<ClipCardProps> = ({ id, title, score, duration, status }) => {
  const handleDownload = () => {
    window.open(`http://localhost:8080/api/clips/download/${id}`, '_blank');
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h4 className="font-semibold">{title}</h4>
      <p>Score: {score}</p>
      <p>Duração: {duration}</p>
      <p>Status: {status}</p>
      {status === 'READY' && (
        <button onClick={handleDownload} className="mt-2 bg-green-500 text-white px-2 py-1 rounded">
          Baixar
        </button>
      )}
    </div>
  );
};

export default ClipCard;