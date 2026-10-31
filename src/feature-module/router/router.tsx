import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { authRoutes, publicRoutes } from "./router.link";
import { all_routes } from "./all_routes";
import Feature from "../feature";
import AuthFeature from "../authFeature";

const ALLRoutes: React.FC = () => {
  return (
    <>
      <Routes>
        <Route element={<Feature />}>
          {publicRoutes.map((route, idx) => (
            <Route path={route.path} element={route.element} key={idx} />
          ))}
        </Route>

        <Route element={<AuthFeature />}>
          {authRoutes.map((route, idx) => (
            <Route path={route.path} element={route.element} key={idx} />
          ))}
        </Route>

        <Route path="*" element={<Navigate to={all_routes.Error404} replace />} />
      </Routes>
    </>
  );
};

export default ALLRoutes;
