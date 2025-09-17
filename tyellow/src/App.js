import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar.js";
import Footer from "./components/Footer.js";

/* Pages */
import Home from "./pages/home/Home.tsx";
import About from "./pages/about/About.tsx";
import Login from "./pages/login/Login.js";
import Register from "./pages/register/Register.js";

function App() {
  return (
    <div clasName="App">
      <BrowserRouter>
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </div>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
