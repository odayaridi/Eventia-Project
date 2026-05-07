// import React from "react";
// import { Outlet } from "react-router-dom";
// import Sidebar from "./Sidebar";
// import Topbar from "./Topbar";
// import "./Dashboard.css";

// const DashboardLayout: React.FC = () => {
//   return (
//     <div className="eventia-layout">
//       <Sidebar />

//       <div className="main-viewport">
//         <Topbar />

//         <main className="content-scroll-area">
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );
// };

// export default DashboardLayout;




import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "./Dashboard.css";

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="eventia-layout">
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <div className="main-viewport">
        <Topbar onMenuClick={openSidebar} />

        <main className="content-scroll-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;