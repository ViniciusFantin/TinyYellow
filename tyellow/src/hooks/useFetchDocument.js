import { useState, useEffect } from "react";

export const useFetchDocuments = (tableName, search = null, id = null) => {
  const [documents, setDocuments] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(null);

  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (cancelled) return;

      setLoading(true);

      try {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        if (id) params.append("id", id);

        const res = await fetch(
          `http://localhost:4000/api/${tableName}?${params.toString()}` /* trocar o localhost pelo nosso SQL */
        );

        if (!res.ok) throw new Error("Erro ao buscar documentos");

        const data = await res.json();
        if (!cancelled) {
          setDocuments(data);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      }

      if (!cancelled) setLoading(false);
    };

    loadData();
  }, [tableName, search, id, cancelled]);

  useEffect(() => {
    return () => setCancelled(true);
  }, []);

  return { documents, loading, error };
};
