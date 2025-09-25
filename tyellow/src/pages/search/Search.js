import styles from "./Search.module.css";

// Hooks
import { useQuery } from "../../hooks/useQuery";
import { useFetchDocuments } from "../../hooks/useFetchDocument";
import { Link } from "react-router-dom";
import PostDetail from "../../components/PostDetail";
import { usePosts } from "../../hooks/usePosts";
import PostList from "../../components/PostList";

const Search = () => {
  const query = useQuery();
  const search = query.get("q");
  const { posts, filtered, loading, error } = usePosts(search);
  return (
    <div className={styles.search_container}>
      <h2>Search</h2>
      {posts && posts.length === 0 && (
        <div className={styles.noposts}>
          <p>Burro... não encontremo nada tcho...</p>
          <Link to="/" className="btn btn-dark">
            Votlar
          </Link>
        </div>
      )}
      {posts &&
        posts.map((posts) => (
          <PostList posts={filtered} loading={loading} error={error} />
        ))}
    </div>
  );
};

export default Search;
