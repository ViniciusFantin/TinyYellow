import styles from "./Dashboard.module.css";

import { Link } from "react-router-dom";

// Hooks
import { useAuthValue } from "../../context/AuthContext";
import { useFetchDocuments } from "../../hooks/useFetchDocument";
import { useDeleteDocument } from "../../hooks/useDeleteDocument";

const Dashboard = () => {
  const { user } = useAuthValue();
  const uid = user.id;

  const {
    documents: posts,
    loading,
    error,
  } = useFetchDocuments(`posts/user/${uid}`);
  const { deleteDocument } = useDeleteDocument("posts");

  if (loading) {
    return <p>Carregando...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }
  return (
    <div className={styles.dashboard}>
      <h2>Seus Posts</h2>
      {/* <p>Gerencie seus posts</p> */}
      {posts && posts.length === 0 ? (
        <div className={styles.noposts}>
          <p>Nenhum post encontrado</p>
          <div>
            <Link to="/posts/create" className="btn btn-outline">
              Crie seu primeiro Post
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.post_header}>
            <span>Título</span>
            <span>Ações</span>
          </div>
          {posts &&
            posts.map((post) => (
              <div key={post.id} className={styles.post_row}>
                <p>{post.post_title}</p>
                <div>
                  <Link to={`/posts/${post.id}`} className="btn btn-outline">
                    Ver
                  </Link>
                  <Link to={`/posts/${post.id}`} className="btn btn-outline">
                    Editar
                  </Link>
                  <button
                    onClick={() => deleteDocument(post.id)}
                    className="btn btn-outlined btn-danger"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
        </>
      )}
    </div>
  );
};

export default Dashboard;
