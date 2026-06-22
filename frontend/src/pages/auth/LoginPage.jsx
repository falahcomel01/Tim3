import LoginForm from '../../components/auth/LoginForm';
// frontend/src/pages/LoginPage.jsx
import api from "../../services/api";

const handleLogin = async () => {
  const res = await api.post('/auth/login', { email, password });
  localStorage.setItem('token', res.data.token); // simpan token
  window.location.href = '/dashboard';
};
export default function LoginPage() {
  return <LoginForm />;
}

