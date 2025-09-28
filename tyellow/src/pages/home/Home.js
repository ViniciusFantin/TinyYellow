import { Link, useNavigate } from "react-router-dom";
import styles from "./homeStyle.module.css";
import { useEffect, useMemo, useState } from "react";
import { useAuthValue } from "../../context/AuthContext";

const Home = () => {
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:37844";
  const { user } = useAuthValue();

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

  // useEffect(() => {
  //   listPosts();
  // }, []);

  const filtered = useMemo(() => {
    if (!query) return posts;
    const q = query.toLowerCase();
    return posts.filter((p) => {
      const tags = String(p.post_tags || p.tags || "").toLowerCase();
      const title = String(p.post_tittle || p.title || "").toLowerCase();
      const content = String(p.post_content || p.content || "").toLowerCase();
      const author = String(p.author_name || p.author || "").toLowerCase();
      return (
        tags.includes(q) ||
        title.includes(q) ||
        content.includes(q) ||
        author.includes(q)
      );
    });
  }, [posts, query]);

  const tagsFrom = (p) => String(p.post_tags || p.tags || "");

  const trends = useMemo(() => {
    const counts = new Map();
    posts.forEach((p) => {
      tagsFrom(p)
        .split(/[,.;#]/)
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
        .forEach((t) => counts.set(t, (counts.get(t) || 0) + 1));
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [posts]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query) navigate(`/search?q=${query}`);
  };

  return (
    <div className={styles.home}>
      <div className={styles.columns}>
        {/* Left sidebar */}
        <aside className={styles.left}>
          <div className={styles.profileCard}>
            <div className={styles.avatar}>
              {(user?.displayName || user?.email || "U")
                .charAt(0)
                .toUpperCase()}
            </div>
            <div>
              <div className={styles.profileName}>{user?.displayName}</div>
              <div className={styles.profileHandle}>{user?.email}</div>
            </div>
          </div>
          <nav className={styles.menu}>
            <Link to="/" className={styles.menuItem}>
              Início
            </Link>
            <Link to="/posts/create" className={styles.menuItem}>
              Criar Post
            </Link>
            <Link to="/search" className={styles.menuItem}>
              Buscar
            </Link>
          </nav>
        </aside>

        {/* Center feed */}
        <main className={styles.center}>
          <div className={styles.feedHeader}>
            <h1 style={{ margin: 0 }}>Feed</h1>
            <form onSubmit={handleSubmit} className={styles.search_form}>
              <input
                type="text"
                placeholder="Buscar por tags ou títulos"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button type="submit" className="btn btn-dark">
                Pesquisar
              </button>
            </form>
          </div>

          {/* Composer */}
          <div className={styles.composerCard}>
            <Link to="/posts/create" className={styles.composerInput}>
              Escreva algo...
            </Link>
            <div className={styles.composerActions}>
              <Link
                to="/posts/create"
                className={styles.iconBtn}
                title="Imagem"
              >
                🖼️
              </Link>
              <Link
                to="/posts/create"
                className={styles.iconBtn}
                title="Hashtag"
              >
                #
              </Link>
            </div>
          </div>

          {/* Feed Card */}
          <div className={styles.feed_card}>
            {loading && <div className={styles.post_item}>Carregando...</div>}
            {error && (
              <div className={styles.post_item} style={{ color: "red" }}>
                {error}
              </div>
            )}

            {!loading && !error && filtered && filtered.length > 0 && (
              <ul className={styles.post_list}>
                {filtered.map((post) => {
                  const id =
                    post.id ||
                    post.postID ||
                    `${post.userID}-${post.post_tittle}`;
                  const title =
                    post.post_tittle || post.title || "(Sem título)";
                  const content = post.post_content || post.content || "";
                  const tags = tagsFrom(post);
                  const author =
                    post.author ||
                    post.name ||
                    post.author ||
                    post.author_email ||
                    post.email ||
                    "Anônimo";

                  return (
                    <li key={id} className={styles.post_item}>
                      <div className={styles.post_header}>
                        <div className={styles.avatar}>
                          {(author || "A").slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <div className={styles.author}>{author}</div>
                          <div className={styles.post_title}>{title}</div>
                        </div>
                      </div>

                      {post.post_image && (
                        <div className={styles.mediaWrap}>
                          <img
                            src={post.post_image}
                            alt={title}
                            className={styles.feed_image}
                          />
                        </div>
                      )}

                      {content && (
                        <p className={styles.post_excerpt}>
                          {String(content).slice(0, 200)}
                          {String(content).length > 200 ? "..." : ""}
                        </p>
                      )}

                      {tags && (
                        <div className={styles.tags}>
                          {String(tags)
                            .split(/[,.;#]/)
                            .map((t) => t.trim())
                            .filter(Boolean)
                            .map((t) => (
                              <span key={t} className={styles.tag_chip}>
                                #{t}
                              </span>
                            ))}
                        </div>
                      )}
                      <Link
                        to={`/posts/${post.id}`}
                        className="btn btn-outline"
                      >
                        ler
                      </Link>
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
        </main>

        {/* Right sidebar */}
        <aside className={styles.right}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Assuntos do momento</div>
            {trends.length === 0 ? (
              <div className={styles.trendEmpty}>Sem tendências ainda</div>
            ) : (
              <ul className={styles.trendList}>
                {trends.map(([tag, count]) => (
                  <li key={tag} className={styles.trendItem}>
                    <span>#{tag}</span>
                    <span className={styles.trendCount}>{count} posts</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={styles.card}>
            <div className={styles.cardTitle}>Quem seguir</div>
            <div className={styles.suggestion}>
              Em breve sugestões personalizadas
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Home;
