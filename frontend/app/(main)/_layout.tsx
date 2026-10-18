import { Redirect, Slot } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";

/**
 * Blindaje: la capa de negocio no monta hijos sin sesión válida (secondra-spec.yaml).
 */
export default function MainLayout() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }
  return <Slot />;
}
