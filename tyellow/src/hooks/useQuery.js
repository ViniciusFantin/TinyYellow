import { useLocation } from "react-router-dom";
import { useMemo } from "react";

/* Resgata os valores de busca */
export function useQuery() {
  const { search } = useLocation();

  return useMemo(() => new URLSearchParams(search), [search]);
}
