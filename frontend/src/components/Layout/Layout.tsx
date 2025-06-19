import { ReactNode} from "react";
import Header from "./Header";
import { Outlet } from "react-router-dom";
import Page from "../containerComponents/Page";
import { ColorKey } from "../../style/colorStyle";
import { SizeKey } from "../../style/size";

type LayoutProps = {
  children?: ReactNode;
};

export const HEADER_HEIGHT = 6;

const Layout = ({ children }: LayoutProps) => {

  return (
    <div className="">
      <header
        style={{height:  `${HEADER_HEIGHT}vh` }}
        className="fixed top-0 left-0 w-full bg-gradient-to-r from-blue-500  to-black text-white items-center justify-between px-4 shadow-md z-10 "      >
        <Header />
      </header>
      <Page style={{
        colorKey: ColorKey.Base,
        sizeKey: SizeKey.MD
      }}>
        {children}
        <Outlet />
      </Page>
    </div>
  );
};

export default Layout;
