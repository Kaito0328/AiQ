// src/components/quiz/Loading.tsx
import React from 'react';

const Loading: React.FC = () => {
  return (
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4" />
      <p className="text-gray-600">読み込み中...</p>
    </div>
  );
};

export default Loading;
