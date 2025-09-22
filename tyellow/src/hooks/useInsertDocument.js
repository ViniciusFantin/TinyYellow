import { useState, useEffect, useReducer } from "react";
/* adicionar insert, tabela, e um timestamp pra registro de data */

const initialState = {
  loading: null,
  error: null,
};

const insertReducer = (state, action) => {
  switch (action.type) {
    case "LOADING":
      return { loading: true, error: null };
    case "INSERT_DOC":
      return { loading: false, error: null };
    case "ERROR":
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

export const useInsertDocument = (docCollection) => {
  const [response, dispatch] = useReducer(insertReducer, initialState);

  const [cancelled, setCancelled] = useState(false);

  const checkCancelBeforeDispatch = (action) => {
    if (!cancelled) {
      dispatch(action);
    }
  };

  const insertDocument = async (document) => {
    checkCancelBeforeDispatch({
      type: "LOADING",
    });
    /* try {
       const newDocument = { ...document, createdAt: aqui fica o timestamp };

       const insertedDocument = await AdicionaDoc(
         collection(bancoDeDados, docCollection),
         newDocument
       );
       checkCancelBeforeDispatch({
         type: "INSERT_DOC",
         payload: insertDocument,
       });
     } catch (error) {
       checkCancelBeforeDispatch({
         type: "ERROR",
         payload: error.message,
       });
     } */
  };

  useEffect(() => {
    return () => setCancelled(true);
  }, []);

  return { insertDocument, response };
};
