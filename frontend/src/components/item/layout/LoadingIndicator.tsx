import React from "react";

const LoadingIndicator: React.FC<{ text?: string }> = ({ text }) => (
  <div className="flex flex-col items-center gap-2 text-gray-700">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    {text ? <p className="text-sm">{text}</p>
    : <p className="text-sm">Loading...</p>}
  </div>
);

export default LoadingIndicator;
