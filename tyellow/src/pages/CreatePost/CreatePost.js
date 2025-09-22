import styles from "./CreatePost.module.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthValue } from "../../context/AuthContext";
import {auth} from "../../firebase/config";

const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [image, setImage] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [userID, setUserID] = useState("");
  const [error, setFormError] = useState("");
  const [loading, setLoading] = useState(null);
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:4000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!title || !image || !body || !tags) {
      setFormError("Preencha todos os campos");


      try {
        const res = await fetch(`${API_BASE}/api/posts/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, image, body, tags }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Erro ao cadastrar");
      } catch (e) {
        setFormError(e.message);
      }
    }
  };
  return (
    <div>
      <h2>Criar post</h2>
      <p>Escreva algo interessante e compartilhe suas ideias!</p>
      <form onSubmit={handleSubmit}>
        <label>
          <span>Título:</span>
          <input
            type="text"
            name="title"
            required
            placeholder="mate a pau no titulo então"
            onChange={(e) => setTitle(e.target.value)}
            value={title}
          />
        </label>
        <label>
          <span>URL da imagem:</span>
          <input
            type="text"
            name="image"
            required
            placeholder="insira uma imagem massa"
            onChange={(e) => setImage(e.target.value)}
            value={image}
          />
        </label>
        <label>
          <span>Conteúdo:</span>
          <textarea
            name="body"
            required
            placeholder="Disserte suas ideias"
            onChange={(e) => setBody(e.target.value)}
            value={body}
          ></textarea>
        </label>
        <label>
          <span>Tags:</span>
          <input
            type="text"
            name="tags"
            required
            placeholder="Insira as tags separadas por virgula"
            onChange={(e) => setTags(e.target.value)}
            value={tags}
          />
        </label>
          {!loading && <button className="btn">Cadastrar</button>}
          {loading && (
              <button className="btn" disabled>
                  Aguarde...
              </button>
          )}
          {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
};

export default CreatePost;
