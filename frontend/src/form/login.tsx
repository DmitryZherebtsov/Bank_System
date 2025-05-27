import { useState } from "react"; 
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom"; 
import "./Login.css";

const loginSchema = yup.object().shape({
  email: yup.string().email("Nieprawidłowy format emaila").required("Email jest wymagany"),
  password: yup.string().required("Hasło jest wymagane"),
});

interface LoginForm {
  email: string;
  password: string;
}

const Login = () => {
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json(); // тут мій токен 
      if (response.ok) {
        setMessage(`Witamy!`);

        localStorage.setItem("token", result.access_token);
        
        window.dispatchEvent(new Event("storage"));

        navigate("/dashboard"); 
      } else {
        setMessage(result.detail || "Błąd logowania");
      }
    } catch (error) {
      setMessage("Błąd połączenia z serwerem");
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Logowanie</h2>
        {message && <p className="error-message">{message}</p>}
        <form onSubmit={handleSubmit(onSubmit)}>
          <input {...register("email")} placeholder="Email" className="input-field" />
          <p className="error-text">{errors.email?.message}</p>

          <input {...register("password")} type="password" placeholder="Hasło" className="input-field" />
          <p className="error-text">{errors.password?.message}</p>

          <button type="submit" className="btn">Zaloguj się</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
