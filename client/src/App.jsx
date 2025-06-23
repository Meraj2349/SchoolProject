import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./store/authContext";
import AppRoutes from "./routes/Routes";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <main>
          <AppRoutes />
        </main>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
