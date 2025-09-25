import { useFetchDoc } from "../../hooks/useFetchDoc";
import styles from "./Post.module.css";

import { useParams } from "react-router-dom";

const Post = () => {
  const { id } = useParams();
  const { document: post, loading } = useFetchDoc("posts", id);
  return (
    <div className={styles.post_container}>
      {loading && <p>Carregando post...</p>}
      {post && (
        <>
          <h1>{post.title}</h1>
          <img src={post.image} alt={post.title} />
          <p>{post.body}</p>
          <h3>Tags</h3>
          <div className={styles.tags}>
            {post.tags.map((tags) => (
              <p key={tags}>
                <span>#</span> {tags}
              </p>
            ))}
          </div>
        </>
      )}
      <h2>Post</h2>
    </div>
  );
};

export default Post;
