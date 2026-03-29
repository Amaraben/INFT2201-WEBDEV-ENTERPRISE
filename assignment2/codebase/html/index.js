const { useState, useEffect } = React;

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [accessToken, setAccessToken] = useState(null);
  const [mail, setMail] = useState([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- Helpers -------------------------------------------------------

  const fetchMail = async (token) => {
    if (!token) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/mail/", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to load mail");
      }

      const data = await res.json();
      setMail(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error loading mail");
      setMail([]);
    } finally {
      setLoading(false);
    }
  };

  // Re-load mail whenever we get a new token
  useEffect(() => {
    if (accessToken) {
      fetchMail(accessToken);
    } else {
      setMail([]);
    }
  }, [accessToken]);

  // --- Event handlers -----------------------------------------------

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/node/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        throw new Error("Login failed");
      }

      const data = await res.json();

      if (!data.token) {
        throw new Error("No token returned from server");
      }

      setAccessToken(data.token);
      setPassword("");
    } catch (err) {
      console.error(err);
      setError(err.message || "Login error");
      setAccessToken(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMail = async (event) => {
    event.preventDefault();
    if (!accessToken) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/mail/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ name, message }),
      });

      if (!res.ok) {
        throw new Error("Failed to create mail");
      }

      // Re-fetch mail so RBAC / scoping is visible in the UI
      await fetchMail(accessToken);
      setName("");
      setMessage("");
    } catch (err) {
      console.error(err);
      setError(err.message || "Error creating mail");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAccessToken(null);
    setMail([]);
    setUsername("");
    setPassword("");
    setError("");
  };

  // --- Render --------------------------------------------------------

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        fontFamily: "system-ui, sans-serif",
        padding: "1rem",
      }}
    >
      <h1>Mail App</h1>

      {!accessToken ? (
        <form onSubmit={handleLogin}>
          <h2>Login</h2>
          <div style={{ marginBottom: "0.5rem" }}>
            <label>
              Username:{" "}
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </label>
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <label>
              Password:{" "}
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
          {error && (
            <p style={{ color: "red", marginTop: "0.5rem" }}>{error}</p>
          )}
        </form>
      ) : (
        <>
          <p>
            Logged in.{" "}
            <button type="button" onClick={handleLogout}>
              Logout
            </button>
          </p>

          <form onSubmit={handleCreateMail}>
            <h2>New Mail</h2>
            <div style={{ marginBottom: "0.5rem" }}>
              <label>
                Name:{" "}
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </label>
            </div>
            <div style={{ marginBottom: "0.5rem" }}>
              <label>
                Message:{" "}
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </label>
            </div>
            <button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Send"}
            </button>
          </form>

          <section style={{ marginTop: "1rem" }}>
            <h2>Mail</h2>
            {loading && <p>Loading…</p>}
            {error && (
              <p style={{ color: "red", marginTop: "0.5rem" }}>{error}</p>
            )}
            {mail.length === 0 ? (
              <p>No mail found.</p>
            ) : (
              <ul>
                {mail.map((item) => (
                  <li key={item.id}>
                    #{item.id} — {item.name}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
