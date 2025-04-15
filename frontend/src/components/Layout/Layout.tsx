import { ReactNode} from "react";
import Header from "./Header";
import { Outlet } from "react-router-dom";

type LayoutProps = {
  children?: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {


  const HEADER_HEIGHT = 6 // vh

  return (
    <div className="h-[100vh]">
      <header
        style={{height:  `${HEADER_HEIGHT}vh` }}
        className="fixed top-0 left-0 w-full bg-gradient-to-r from-blue-500  to-black text-white items-center justify-between px-4 shadow-md z-10 "      >
        <Header />
      </header>
      <main style={{ paddingTop: `${HEADER_HEIGHT}vh` }} className="h-full w-full bg-gradient-to-t from-yellow-200 to-white">
        {children}
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
