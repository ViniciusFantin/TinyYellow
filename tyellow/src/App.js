import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

/* Pages */
import Home from "./pages/home/Home.tsx";
import About from "./pages/about/About.tsx";
import Navbar from "./components/Navbar.js";
import Footer from "./components/Footer.js";

function App() {
  return (
    <div clasName="App">
      <BrowserRouter>
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" elemente={<About />} />
          </Routes>
        </div>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
