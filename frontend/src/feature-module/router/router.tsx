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
import InstructorLayout from "../Instructor/common/instructorLayout";

const ALLRoutes: React.FC = () => {
  return (
    <>
      <Routes>
        <Route element={<Feature />}>
          {/* 1. Public Routes: Accessible by All */}
          {publicRoutes.map((route, idx) => (
            <Route path={route.path} element={route.element} key={`pub-${idx}`} />
          ))}

          {/* 2. Student Protected Routes: Restricted to Students and Admins (Course Player also accessible to Instructors) */}
          {studentProtectedRoutes.map((route, idx) => {
            const isSharedClassroom =
              route.path === all_routes.courseWatch || route.path === all_routes.courseResume;
            const allowed: ('student' | 'instructor' | 'admin')[] = isSharedClassroom
              ? ['student', 'instructor', 'admin']
              : ['student', 'admin'];
            return (
              <Route
                path={route.path}
                element={
                  <RoleGuard allowedRoles={allowed}>
                    {route.element}
                  </RoleGuard>
                }
                key={`stu-${idx}`}
              />
            );
          })}

          {/* 3. Instructor Protected Routes: rendered inside the shared Faculty Console shell */}
          <Route
            element={
              <RoleGuard allowedRoles={['instructor', 'admin']}>
                <InstructorLayout />
              </RoleGuard>
            }
          >
            {instructorProtectedRoutes.map((route, idx) => (
              <Route path={route.path} element={route.element} key={`ins-${idx}`} />
            ))}
          </Route>

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
