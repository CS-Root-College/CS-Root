import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";

function NotFound() {
  return (
    <div className="p-8">
      <h1>404 - Page Not Found</h1>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Navbar />

        <main>
          <Routes>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;