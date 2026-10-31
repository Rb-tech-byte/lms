import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "../core/common/header/header";
import BackToTop from "../core/common/backtotop/backToTop";
import Footer from "../core/common/footer/footer";

const Feature = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const isHome = location.pathname === '/' || location.pathname === '/index' || location.pathname === '/index-6';

  return (
    <>
      <div className="main-wrapper">
        <div className={isHome ? 'home-six' : ''}>
          <Header />
          <Outlet />
          {isHome ? <></> : <Footer />}
          <BackToTop />
        </div>

      <div className="sidebar-overlay"></div>
    </div>
    </>
  );
};

export default Feature;
