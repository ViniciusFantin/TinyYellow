import styles from "./Dashboard.module.css";

import { Link } from "react-router-dom";

// Hooks
import { useAuthValue } from "../../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuthValue();
  const id = user.id;

  // post do usuário
  const posts = [];
  return (
    <div>
      <h2>Dashboard</h2>
      <p>Gerencie seus posts</p>
      {posts && posts.length === 0 ? (
        <div></div>
      ) : (
        <div>
          <p>tem post</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
