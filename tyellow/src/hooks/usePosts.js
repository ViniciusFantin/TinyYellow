import { useEffect, useMemo, useState } from "react";

export function usePosts(query = "") {
  const [posts, setPosts] = useState([]); // array, não objeto
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:37844";

  const listPosts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/posts/list`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erro ao listar posts");
      setPosts(data || []); // garante array
    } catch (err) {
      setError(err.message);
      setPosts([]); // fallback seguro
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

  return { posts, filtered, loading, error };
}
