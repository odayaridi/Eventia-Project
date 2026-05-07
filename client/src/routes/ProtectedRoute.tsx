// import React from "react";
// import { Navigate, useLocation } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// interface ProtectedRouteProps {
//   allowedRoles?: string[];
//   children: React.ReactNode;
// }

// const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
//   const { user, isAuthenticated } = useAuth();
//   const location = useLocation();

//   if (!isAuthenticated || !user) {
//     return <Navigate to="/login" state={{ from: location }} replace />;
//   }

//   if (allowedRoles && !allowedRoles.includes(user.role)) {
//     return <Navigate to="/home" replace />;
//   }

//   return <>{children}</>;
// };

// export default ProtectedRoute;



import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Forbidden from "../components/common/Forbidden";

interface ProtectedRouteProps {
  allowedRoles?: string[];
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isAuthLoading } = useAuth();
  const location = useLocation();

  if (isAuthLoading) {
    return <div></div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
     
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
   return <Forbidden/>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
