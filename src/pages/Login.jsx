import { useEffect } from "react";

export default function Login() {
  useEffect(() => {
    window.location.href = "/";
  }, []);

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>Redirecting...</h1>
      <p>Please wait.</p>
    </div>
  );
}