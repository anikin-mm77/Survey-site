import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export function useRequireAuth({ redirect = true } = {}) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!redirect) return;
    if (loading) return;
    if (!user) {
      navigate("/login", { state: { from: location } });
    }
  }, [redirect, loading, user, navigate, location]);

  return { user, loading, isAuthed: !!user };
}
