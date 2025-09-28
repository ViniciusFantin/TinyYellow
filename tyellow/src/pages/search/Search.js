import styles from "./Search.module.css";

// Hooks
import { useQuery } from "../../hooks/useQuery";
import { usePosts } from "../../hooks/usePosts";
import { Link } from "react-router-dom";
import PostList from "../../components/PostList";

const Search = () => {
  const query = useQuery();
  const search = query.get("q");
  const { posts, filtered, loading, error } = usePosts(search);

  return (
    <div className={styles.search_container}>
      <h2>Search</h2>

      {/* Nenhum post encontrado */}
      {posts && posts.length === 0 && (
        <div className={styles.noposts}>
          <p>Burro... não encontremo nada tcho...</p>
          <Link to="/" className="btn btn-dark">
            Voltar
          </Link>
        </div>
      )}

      {/* Lista de posts */}
      <PostList
        posts={filtered || posts || []} // garante sempre array
        loading={loading}
        error={error}
      />
    </div>
  );
};

export default Search;
