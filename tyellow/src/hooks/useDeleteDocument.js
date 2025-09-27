import { useState, useEffect, useReducer } from "react";

const initialState = {
  loading: null,
  error: null,
};

const deleteReducer = (state, action) => {
  switch (action.type) {
    case "LOADING":
      return { loading: true, error: null };
    case "DELETED_DOC":
      return { loading: false, error: null };
    case "ERROR":
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};
export const useDeleteDocument = (collection) => {
  const [response, dispatch] = useReducer(deleteReducer, initialState);
  const [cancelled, setCancelled] = useState(false);

  const checkCancelBeforeDispatch = (action) => {
    if (!cancelled) dispatch(action);
  };

  const deleteDocument = async (id) => {
    checkCancelBeforeDispatch({ type: "LOADING" });

    try {
      const res = await fetch(`http://localhost:4000/api/${collection}/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Erro ao deletar documento");
      }
      checkCancelBeforeDispatch({ type: "DELETED_DOC" });
    } catch (error) {
      checkCancelBeforeDispatch({
        type: "ERROR",
        payload: error.message,
      });
    }
  };

  useEffect(() => {
    return () => setCancelled(true);
  }, []);

  return { deleteDocument, response };
};
