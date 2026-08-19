import { useEffect } from "react";
import { useLocation } from "wouter";

export default function LostCarKeysPage() {
  const [, navigate] = useLocation();
  useEffect(() => {
    navigate("/spare-car-key", { replace: true });
  }, [navigate]);
  return null;
}
