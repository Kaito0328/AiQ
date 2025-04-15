import React from 'react';

interface ScoreProps {
  score: number;
  total: number;
}

const Score: React.FC<ScoreProps> = ({ score, total }) => {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-6 mt-7">スコア結果 🎯</h1>
      <p className="text-2xl mt-7">
        {total}問中 {score}問正解！ 🎉
      </p>
      <p className="mt-4 text-lg">
        {((score / total) * 100).toFixed(1)}% の正答率でした！
      </p>
    </div>
  );
};

export default Score;
