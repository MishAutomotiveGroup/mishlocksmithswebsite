import { useEffect } from "react";
import { useLocation } from "wouter";

export default function LostCarKeysPage() {
  const [, navigate] = useLocation();
  useEffect(() => {
    navigate("/car-keys", { replace: true });
  }, [navigate]);
  return null;
}
