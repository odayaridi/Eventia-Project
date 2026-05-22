// import AppRoutes from "./routes/Routes";
// import { AuthProvider } from "./context/AuthContext";

// function App() {
//   return (
//     <AuthProvider>
//       <AppRoutes />
//     </AuthProvider>
//   );
// }

// export default App;



import AppRoutes from "./routes/Routes";
import { AuthProvider } from "./context/AuthContext";
import { WebRTCProvider, WebRTCCallUI } from "./context/webrtc";

function App() {
  return (
    <AuthProvider>
      <WebRTCProvider>
        <AppRoutes />
        <WebRTCCallUI />
      </WebRTCProvider>
    </AuthProvider>
  );
}

export default App;