import { Link } from 'react-router-dom';

export default function Login() {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>Login disabled</h1>
      <p>This GitHub Pages version runs without Base44 login.</p>
      <Link to="/welcome">Go to Home</Link>
    </div>
  );
}