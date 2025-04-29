import React from "react";

interface SectionCardProps {
  children: React.ReactNode;
  className?: string;
}

const SectionCard: React.FC<SectionCardProps> = ({ children, className }) => {
  return (
    <section className={`bg-white shadow-lg rounded-xl p-6 md:p-8 ${className ?? ''}`}>
      {children}
    </section>
  );
};

export default SectionCard;
