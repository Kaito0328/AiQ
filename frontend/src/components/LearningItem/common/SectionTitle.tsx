import React from "react";

interface SectionTitleProps {
  children: React.ReactNode;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ children }) => {
  return (
    <h2 className="text-2xl md:text-3xl font-bold mb-6 border-b-2 border-gray-200 pb-3 text-gray-800">
      {children}
    </h2>
  );
};

export default SectionTitle;
