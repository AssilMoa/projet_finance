import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleRegister = async () => {
        const response = await fetch(`http://localhost:8080/auth/register?firstName=${firstName}&lastName=${lastName}&email=${email}&password=${password}`, {
            method: "POST",
        });

        if (response.ok) {
            alert("✅ Inscription réussie !");
            navigate("/login");
        } else {
            alert("❌ Email déjà utilisé");
        }
    };

    return (
        <div>
            <h1>Inscription</h1>
            <input type="text" placeholder="Prénom" onChange={(e) => setFirstName(e.target.value)} />
            <input type="text" placeholder="Nom" onChange={(e) => setLastName(e.target.value)} />
            <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Mot de passe" onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleRegister}>S'inscrire</button>
        </div>
    );
}
