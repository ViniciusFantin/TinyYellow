import styles from "./CreatePost.module.css";

import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthValue } from "../../context/AuthContext";
import { auth } from "../../firebase/config";

const MAX_IMAGE_MB = 5;

const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [image, setImage] = useState(""); // base64 Data URL ou URL externa
  const [imagePreview, setImagePreview] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [formError, setFormError] = useState("");
  const API_BASE = process.env.REACT_APP_API_BASE || "https://tiny-yellow-1et1.vercel.app/api";
  const [loading, setLoading] = useState(false);

  const { user } = useAuthValue();

  const navigate = useNavigate();

  // const { insertDocument, response } = useInsertDocument("posts");

  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFormError("O arquivo precisa ser uma imagem.");
      return;
    }
    const maxBytes = MAX_IMAGE_MB * 1024 * 1024;
    if (file.size > maxBytes) {
      setFormError(`Imagem muito grande. Tamanho máximo: ${MAX_IMAGE_MB}MB.`);
      return;
    }
    setFormError("");
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setImage(String(dataUrl));
      setImagePreview(String(dataUrl));
    };
    reader.onerror = () => setFormError("Falha ao ler a imagem.");
    reader.readAsDataURL(file);
  };

  const onFileSelect = (e) => {
    const file = e.target.files && e.target.files[0];
    handleFile(file);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };
  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    handleFile(file);
  };

  const clearImage = () => {
    setImage("");
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    // Validação básica
    if (!title || !image || !tags || !body) {
      setFormError("Preencha todos os campos, incluindo a imagem.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/posts/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          image,
          content: body,
          tags,
          email: auth.currentUser?.email,
        }),
      });

      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await res.json()
        : await res.text();

      if (!res.ok) {
        throw new Error((data && data.error) || "Erro ao criar post");
      }

      // sucesso
      navigate("/");
    } catch (error) {
      setFormError(error.message || "Erro ao criar post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.create_post}>
      <div
        className={styles.composer}
        onDragOver={onDragOver}
        onDragEnter={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className={styles.avatar_col}>
          <div className={styles.avatar}>
            {(user?.displayName || user?.email || "U").charAt(0).toUpperCase()}
          </div>
          {user?.displayName}
        </div>

        <div className={styles.main_col}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <input
              type="text"
              name="title"
              required
              className={styles.title_input}
              placeholder="Título do post"
              onChange={(e) => setTitle(e.target.value)}
              value={title}
            />

            <textarea
              className={styles.textarea}
              name="body"
              required
              placeholder="O que está acontecendo?"
              onChange={(e) => setBody(e.target.value)}
              value={body}
            />
            <span className={styles.counter}>{body.length}</span>

            {imagePreview && (
              <div className={styles.image_preview_row}>
                <img
                  src={imagePreview}
                  alt="Pré-visualização"
                  className={styles.image_preview}
                />
                <button
                  type="button"
                  className={styles.remove_image_btn}
                  onClick={clearImage}
                >
                  Remover
                </button>
              </div>
            )}

            <div className={styles.toolbar}>
              <div className={styles.left_tools}>
                <input
                  ref={fileInputRef}
                  id="fileInput"
                  type="file"
                  accept="image/*"
                  onChange={onFileSelect}
                  style={{ display: "none" }}
                />
                <button
                  type="button"
                  className={styles.icon_btn}
                  title="Adicionar imagem"
                  onClick={() =>
                    fileInputRef.current && fileInputRef.current.click()
                  }
                >
                  🖼️
                </button>

                <input
                  type="text"
                  name="tags"
                  required
                  className={styles.tags_input}
                  placeholder="#tags, separadas, por, vírgula"
                  onChange={(e) => setTags(e.target.value)}
                  value={tags}
                />
              </div>
              <div className={styles.right_tools}>
                {!loading && (
                  <button type="submit" className={styles.tweet_btn}>
                    Publicar
                  </button>
                )}
                {loading && (
                  <button className={styles.tweet_btn} disabled>
                    Enviando...
                  </button>
                )}
              </div>
            </div>

            {dragActive && !imagePreview && (
              <div className={styles.drop_hint}>Solte a imagem para anexar</div>
            )}

            {formError && <p className={styles.error}>{formError}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
