import React, { useEffect, useRef, useState } from "react";
import { FaArrowDown, FaArrowLeft, FaArrowUp } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

const PageContainer: React.FC<PageContainerProps> = ({ children, className }) => {
    const topRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [showScrollTop, setShowScrollTop] = useState(false);
  const navigate = useNavigate();
    useEffect(() => {
      const handleScroll = () => {
        setShowScrollTop(window.scrollY > 200);
      };
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }, []);

  return (
    <div className={`min-h-screen py-8 px-4 md:px-8 ${className}`}>
      <button
        onClick={() => navigate(-1)}
        className="fixed top-20 left-5 p-2 z-40 rounded-full  shadow-md text-blue-600 hover:text-blue-800 transition"
        title="戻る"
      >
        <FaArrowLeft size={18} />
      </button>
      <div className="max-w-5xl mx-auto space-y-10">
        <div ref={topRef} />
        {children}
        <div ref={bottomRef} className="pt-8" />
        <div className="fixed bottom-6 let-3 flex flex-col gap-3 z-40 items-end">
          {showScrollTop && (
            <button
              onClick={() => topRef.current?.scrollIntoView({ behavior: "smooth" })}
              className="w-12 h-12  flex items-center justify-center ml-0 rounded-full bg-white/90 hover:bg-white shadow-md backdrop-blur text-gray-800"
              aria-label="ページ上部へ"
            >
              <FaArrowUp />
            </button>
          )}
          <button
            onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white/90 hover:bg-white shadow-md backdrop-blur text-gray-800"
            aria-label="ページ下部へ"
          >
            <FaArrowDown />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PageContainer;
