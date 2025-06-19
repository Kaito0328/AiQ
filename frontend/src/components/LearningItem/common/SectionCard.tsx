import React from "react";

interface SectionCardProps {
  children: React.ReactNode;
  className?: string;
}

const SectionCard: React.FC<SectionCardProps> = ({ children, className }) => {
  return (
    <section className={`rounded-xl p-4 md:p-8 ${className ?? ''}`}>
      {children}
    </section>
  );
};

export default SectionCard;
