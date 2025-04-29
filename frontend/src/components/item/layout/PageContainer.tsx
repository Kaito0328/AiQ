import React from "react";

interface PageContainerProps {
  children: React.ReactNode;
  backgroundClassName?: string;
  className?: string;
}

const PageContainer: React.FC<PageContainerProps> = ({ children, backgroundClassName, className }) => {
  return (
    <div className={`min-h-screen ${backgroundClassName ?? 'bg-gray-100'} py-8 px-4 md:px-8 ${className}`}>
      <div className="max-w-5xl mx-auto space-y-10">
        {children}
      </div>
    </div>
  );
};

export default PageContainer;
