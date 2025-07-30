import { ReactNode} from "react";
import Header from "./Header";
import { Outlet } from "react-router-dom";
type LayoutProps = {
  children?: ReactNode;
};

export const HEADER_HEIGHT = 6;

const Layout = ({ children }: LayoutProps) => {

  return (
    <div>
        <Header />
        {children}
        <Outlet />
    </div>
  );
};

export default Layout;
