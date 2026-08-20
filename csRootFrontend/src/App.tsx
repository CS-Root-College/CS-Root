import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Navbar } from "./components/Navbar";

import { Login } from "./pages/Login";
import { CreateAccount } from "./pages/CreateAccount";
import { VerifyEmailOtp } from "./pages/VerifyEmailOtp";

function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold">
          404
        </h1>

        <p className="mt-2 text-zinc-500">
          Page not found
        </p>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-black">

        <Navbar />

        <main>
          <Routes>

            {/* Home */}
            <Route
              path="/"
              element={
                <div className="min-h-[calc(100vh-4rem)] bg-black" />
              }
            />

            {/* Authentication */}
            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/register"
              element={<CreateAccount />}
            />

            <Route
              path="/verify-email-otp"
              element={<VerifyEmailOtp />}
            />

            {/* 404 */}
            <Route
              path="*"
              element={<NotFound />}
            />

          </Routes>
        </main>

      </div>
    </BrowserRouter>
  );
}

export default App;