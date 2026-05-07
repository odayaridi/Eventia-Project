import AppRoutes from "./routes/Routes";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;



// import AppRoutes from "./routes/Routes";
// import { AuthProvider } from "./context/AuthContext";
// import CallProvider from "./context/webrtc/CallProvider";

// function App() {
//   return (
//     <AuthProvider>
//       <CallProvider>
//         <AppRoutes />
//       </CallProvider>
//     </AuthProvider>
//   );
// }

// export default App;