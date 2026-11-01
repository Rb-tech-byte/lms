import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import {
  authRoutes,
  publicRoutes,
  studentProtectedRoutes,
  instructorProtectedRoutes,
  adminProtectedRoutes,
} from "./router.link";
import { all_routes } from "./all_routes";
import Feature from "../feature";
import AuthFeature from "../authFeature";
import RoleGuard from "../../core/auth/RoleGuard";

const ALLRoutes: React.FC = () => {
  return (
    <>
      <Routes>
        <Route element={<Feature />}>
          {/* 1. Public Routes: Accessible by All */}
          {publicRoutes.map((route, idx) => (
            <Route path={route.path} element={route.element} key={`pub-${idx}`} />
          ))}

          {/* 2. Student Protected Routes: Restricted to Students and Admins */}
          {studentProtectedRoutes.map((route, idx) => (
            <Route
              path={route.path}
              element={
                <RoleGuard allowedRoles={['student', 'admin']}>
                  {route.element}
                </RoleGuard>
              }
              key={`stu-${idx}`}
            />
          ))}

          {/* 3. Instructor Protected Routes: Restricted to Instructors and Admins */}
          {instructorProtectedRoutes.map((route, idx) => (
            <Route
              path={route.path}
              element={
                <RoleGuard allowedRoles={['instructor', 'admin']}>
                  {route.element}
                </RoleGuard>
              }
              key={`ins-${idx}`}
            />
          ))}

          {/* 4. Administrator Protected Routes: Restricted Strictly to Administrators */}
          {adminProtectedRoutes.map((route, idx) => (
            <Route
              path={route.path}
              element={
                <RoleGuard allowedRoles={['admin']}>
                  {route.element}
                </RoleGuard>
              }
              key={`adm-${idx}`}
            />
          ))}
        </Route>

        {/* 5. Auth Routes (Login, Register, etc.) */}
        <Route element={<AuthFeature />}>
          {authRoutes.map((route, idx) => (
            <Route path={route.path} element={route.element} key={`auth-${idx}`} />
          ))}
        </Route>

        <Route path="*" element={<Navigate to={all_routes.Error404} replace />} />
      </Routes>
    </>
  );
};

export default ALLRoutes;
