import { Link } from "react-router-dom";

const PostList = ({ posts, loading, error }) => {
  if (loading) return <p>Carregando...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  if (!loading && !error && posts && posts.length > 0) {
    return (
      <ul style={{ listStyle: "none", padding: 0, marginTop: 16 }}>
        {posts.map((post) => {
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
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
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
                <div>
                  <Link to={`/posts/${post.id}`} className="btn btn-outline">
                    ler
                  </Link>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div>
      <p>Não foram encontrados posts</p>
      <Link to="/posts/create" className="btn">
        Criar primeiro post
      </Link>
    </div>
  );
};

export default PostList;
