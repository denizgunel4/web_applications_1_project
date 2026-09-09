

import { Link, useNavigate } from "react-router-dom";

function Layout({ user, setUser, children }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch(
        "http://localhost:3001/api/sessions/current",
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        setUser(null);
        navigate("/");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      <nav>
        <div>
          <Link to="/">
            <h1>Gold Digger</h1>
          </Link>
          <p>Dig for clues. Strike for gold.</p>
        </div>

        {user && (
          <div>
            <p>Welcome, {user.username}</p>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </nav>

      <main>
        {children}
      </main>
    </>
  );
}

export default Layout;