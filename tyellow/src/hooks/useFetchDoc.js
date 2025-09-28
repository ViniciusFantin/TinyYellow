import { useState, useEffect } from "react";

export const useFetchDoc = (docCollection, id) => {
  const [document, setDocument] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(null);

  const [cancelled, setCancelled] = useState(false);
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:37844";

  useEffect(() => {
    async function loadDocument() {
      if (cancelled || id) return;
      setLoading(true);

      try {
        const res = await fetch(`${API_BASE}/api/${docCollection}/${id}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Erro ao buscar bobeira");
        }

        setDocument(data);
      } catch (error) {
        console.log("Erro useFetchDoc", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docCollection, id, cancelled]);

  useEffect(() => {
    return () => setCancelled(true);
  }, []);

  return { document, loading, error };
};
