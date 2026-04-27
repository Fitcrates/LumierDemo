"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Next.js App Error:", error);
  }, [error]);

  return (
    <div className="error-container" style={{ padding: "4rem", textAlign: "center", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      <h2 style={{ fontSize: "2rem", marginBottom: "1rem", color: "#E8E4DC" }}>Something went wrong!</h2>
      <p style={{ opacity: 0.7, marginBottom: "2rem", color: "#E8E4DC" }}>We had trouble loading the 3D graphics or application state.</p>
      <button
        onClick={() => reset()}
        style={{ padding: "1rem 2rem", background: "#BF8C3A", color: "#080709", border: "none", cursor: "pointer", fontWeight: "bold" }}
      >
        Try again
      </button>
    </div>
  );
}
