import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login({ setUser }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    // Fonction pour gérer la connexion
    const handleLogin = async () => {
        if (!email || !password) {
            alert("Remplis tous les champs !");
            return;
        }

        try {
            console.log("Tentative de connexion avec :", email, password);

            // Envoi des identifiants à l'API pour authentification
            const response = await fetch(
                `http://localhost:8080/auth/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
                { method: "POST", headers: { "Content-Type": "application/json" } }
            );

            // Vérifie si la réponse est correcte
            if (!response.ok) {
                console.error("Identifiants incorrects.");
                alert("Identifiants incorrects");
                return;
            }

            // Récupère les informations de l'utilisateur
            const data = await response.json();
            console.log("Réponse de l'API login :", data);

            const userId = data.userId;
            console.log("Utilisateur connecté, ID :", userId);

            // Récupère les données détaillées de l'utilisateur
            const userResponse = await fetch(`http://localhost:8080/api/user/${userId}`);
            if (!userResponse.ok) {
                console.error("Erreur lors de la récupération de l'utilisateur :", await userResponse.text());
                alert("Impossible de récupérer les informations utilisateur.");
                return;
            }

            const userData = await userResponse.json();
            console.log("Données utilisateur :", userData);

            // Stocke les informations utilisateur et redirige
            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));

            console.log("Redirection vers /home");
            navigate("/home");
        } catch (error) {
            console.error("Une erreur est survenue :", error);
            alert("Une erreur est survenue. Vérifie que le backend fonctionne.");
        }
    };

    return (
        <div>
            <h1>Connexion</h1>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleLogin}>Se connecter</button>
            <p>Pas encore de compte ?</p>
            <button onClick={() => navigate("/register")}>Créer un compte</button>
        </div>
    );
}

