import { Link, useNavigate } from "react-router-dom";
import styles from "./homeStyle.module.css";
import { useEffect, useMemo, useState } from "react";
/*

Caso for utilizado o hook usePosts terá que refatorar a home

*/
const Home = () => {
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:4000";

  // função para listar posts
  const listPosts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/posts/list`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erro ao listar posts");
      setPosts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    listPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    if (!query) return posts;
    const q = query.toLowerCase();
    return posts.filter((p) => {
      const tags = String(p.post_tags || p.tags || "").toLowerCase();
      const title = String(p.post_tittle || p.title || "").toLowerCase();
      const content = String(p.post_content || p.content || "").toLowerCase();
      return tags.includes(q) || title.includes(q) || content.includes(q);
    });
  }, [posts, query]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (query) {
      return navigate(`/search?q=${query}`);
    }
  };

  return (
    <div className={styles.home}>
      <h1>Posts Recentes</h1>
      <form onSubmit={handleSubmit} className={styles.search_form}>
        <input
          type="text"
          placeholder="Ou busque por tags"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="btn btn-dark">
          Pesquisar
        </button>
      </form>

      <div>
        {loading && <p>Carregando...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && filtered && filtered.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0, marginTop: 16 }}>
            {filtered.map((post) => {
              const id =
                post.id || post.post_id || `${post.userID}-${post.post_tittle}`;
              const title = post.post_tittle || post.title || "(Sem título)";
              const content = post.post_content || post.content || "";
              const tags = post.post_tags || post.tags || "";
              return (
                <li
                  key={id}
                  style={{ borderBottom: "1px solid #ddd", padding: "12px 0" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                    }}
                  >
                    {post.post_image && (
                      <img
                        src={post.post_image}
                        alt={title}
                        style={{
                          width: 64,
                          height: 64,
                          objectFit: "cover",
                          borderRadius: 4,
                        }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: 0 }}>{title}</h3>
                      <p style={{ margin: "6px 0", color: "#555" }}>
                        {String(content).slice(0, 180)}
                        {String(content).length > 180 ? "..." : ""}
                      </p>
                      {tags && (
                        <div
                          style={{ display: "flex", flexWrap: "wrap", gap: 6 }}
                        >
                          {String(tags)
                            .split(/[,.;#]/)
                            .map((t) => t.trim())
                            .filter(Boolean)
                            .map((t) => (
                              <span
                                key={t}
                                style={{
                                  background: "#f1f3f5",
                                  padding: "2px 8px",
                                  borderRadius: 12,
                                  fontSize: 12,
                                }}
                              >
                                #{t}
                              </span>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {!loading && !error && filtered && filtered.length === 0 && (
          <div className={styles.noposts}>
            <p>Não foram encontrados posts</p>
            <Link to="/posts/create" className="btn">
              Criar primeiro post
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
