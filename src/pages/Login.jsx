import { useEffect } from "react";

export default function Login() {
  useEffect(() => {
    window.location.replace("?/#/welcome");
  }, []);

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>Redirecting...</h1>
      <p>Please wait.</p>
    </div>
  );
}