import { useState } from "react"; 
import { useNavigate } from "react-router-dom";
import './register.css'

const Register = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch("http://127.0.0.1:8000/auth/register/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password }),
            });

            if (response.ok) {
                const loginResponse = await fetch("http://127.0.0.1:8000/auth/login/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });

                const loginData = await loginResponse.json();

                if (loginResponse.ok) {
                    localStorage.setItem("token", loginData.access_token);

                    window.dispatchEvent(new Event("storage"));

                    navigate("/dashboard");
                } else {
                    setMessage("Błąd logowania: " + loginData.detail);
                }
            } else {
                setMessage("Błąd rejestracji");
            }
        } catch (error) {
            setMessage("Błąd połączenia z serwerem");
        }
    };

    return (
        <div className="register-container">
            <div className="register-form">
                <h2 className="text-xl font-bold mb-4">Rejestracja</h2>
                {message && <p className="text-red-500">{message}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Nazwa użytkownika"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="input-field"
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="input-field"
                    />
                    <input
                        type="password"
                        placeholder="Hasło"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="input-field"
                    />
                    <button type="submit" className="btn">Zarejestruj się</button>
                </form>
            </div>
        </div>
    );
};

export default Register;
