import { BrowserRouter, Routes, Route, Link, NavLink, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth";
import { Drop, HOME } from "./lib";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Hospital from "./pages/Hospital";
import Admin from "./pages/Admin";

function Guard({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  if (user.role !== role) return <Navigate to={HOME[user.role]} replace />;
  return children;
}

function Nav() {
  const { user, signOut } = useAuth();
  const go = useNavigate();
  return (
    <header className="nav">
      <div className="wrap nav-in">
        <Link to="/" className="brand"><Drop size={22} /> LifeDrop</Link>
        <nav>
          {user ? (
            <>
              <NavLink to={HOME[user.role]}>Dashboard</NavLink>
              <button className="link" onClick={() => { signOut(); go("/"); }}>Sign out</button>
            </>
          ) : (
            <>
              <NavLink to="/auth">Sign in</NavLink>
              <Link className="btn small" to="/auth?mode=register">Join</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Nav />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Guard role="USER"><Dashboard /></Guard>} />
            <Route path="/hospital" element={<Guard role="HOSPITAL"><Hospital /></Guard>} />
            <Route path="/admin" element={<Guard role="ADMIN"><Admin /></Guard>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer className="wrap foot">LifeDrop is a college project. Do not rely on it for real emergencies.</footer>
      </BrowserRouter>
    </AuthProvider>
  );
}
