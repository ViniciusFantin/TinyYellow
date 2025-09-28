import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar.js";
import Footer from "./components/Footer.js";

import { onAuthStateChanged } from "firebase/auth";

/* Context */
import { AuthProvider } from "./context/AuthContext.js";

/* hooks */
import { useState, useEffect } from "react";
import { useAuthentication } from "./hooks/useAuthentication.js";

/* Pages */
import Home from "./pages/home/Home.js";
import About from "./pages/about/About.js";
import Search from "./pages/search/Search.js";
import Login from "./pages/login/Login.js";
import Register from "./pages/register/Register.js";
import Dashboard from "./pages/Dashboard/Dashboard.js";
import CreatePost from "./pages/CreatePost/CreatePost.js";
import Post from "./pages/post/Post.js";
import EditPost from "./pages/EditPost/EditPost.js";

function App() {
  const [user, setUser] = useState(undefined);
  const { auth } = useAuthentication();

  const loadingUser = user === undefined;

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
  }, [auth]);

  if (loadingUser) {
    return <p>...Carregando</p>;
  }

  return (
    <AuthProvider value={{ user }}>
      <div className="App">
        <BrowserRouter>
          <Navbar />
          <div className="container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/search" element={<Search />} />
              <Route path="/posts/:id" element={<Post />} />
              <Route
                path="/login"
                element={!user ? <Login /> : <Navigate to="/" />}
              />
              <Route
                path="/register"
                element={!user ? <Register /> : <Navigate to="/" />}
              />
              <Route
                path="/posts/create"
                element={user ? <CreatePost /> : <Navigate to="/login" />}
              />
              <Route
                path="/posts/edit/:id"
                element={user ? <EditPost /> : <Navigate to="/login" />}
              />
              <Route
                path="/dashboard"
                element={user ? <Dashboard /> : <Navigate to="/login" />}
              />
            </Routes>
          </div>
          <Footer />
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;
