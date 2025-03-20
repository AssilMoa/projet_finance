import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home({ user }) {
    const navigate = useNavigate();
    const [userName, setUserName] = useState("");

    // Cette fonction est appelée dès que le composant est monté
    // Elle vérifie si un utilisateur est connecté ou récupère l'utilisateur depuis le localStorage
    useEffect(() => {
        if (!user) {
            const storedUser = JSON.parse(localStorage.getItem("user"));
            if (storedUser) {
                setUserName(`${storedUser.firstName} ${storedUser.lastName}`);
            } else {
                navigate("/"); // Redirige vers la page de connexion si aucun utilisateur n'est connecté
            }
        } else {
            setUserName(`${user.firstName} ${user.lastName}`);
        }
    }, [user, navigate]);

    // Fonction de déconnexion
    const handleLogout = () => {
        localStorage.clear(); // Efface les données utilisateur du localStorage
        navigate("/"); // Redirige vers la page de connexion après la déconnexion
    };

    return (
        <div style={styles.pageContainer}>
            <div style={styles.content}>
                <h1 style={styles.title}>Bienvenue, {userName}</h1>

                <div style={styles.buttonContainer}>
                    {/* Redirections vers différentes pages de la plateforme */}
                    <button style={styles.button} onClick={() => navigate("/portfolio")}>
                        Acheter un actif
                    </button>

                    <button style={styles.button} onClick={() => navigate("/history")}>
                        Voir l'historique des actifs / Supprimer un actif
                    </button>

                    <button style={styles.button} onClick={() => navigate("/performance")}>
                        Performances du portefeuille
                    </button>

                    <button style={styles.button} onClick={() => navigate("/simulation")}>
                        Simulation d'investissement
                    </button>

                    <button style={styles.button} onClick={() => navigate("/alerts")}>
                        Alertes et notifications
                    </button>

                    <button style={{ ...styles.button, backgroundColor: "#dc3545" }} onClick={handleLogout}>
                        Déconnexion
                    </button>
                </div>
            </div>
        </div>
    );
}

// Styles en objet pour la page d'accueil
const styles = {
    pageContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#f8f9fa",
    },
    content: {
        textAlign: "center",
        background: "white",
        padding: "30px",
        borderRadius: "10px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        width: "400px",
    },
    title: {
        fontSize: "28px",
        fontWeight: "bold",
        marginBottom: "20px",
        fontFamily: "'Arial', sans-serif",
    },
    buttonContainer: {
        display: "flex",
        flexDirection: "column",
        gap: "15px",
    },
    button: {
        padding: "12px 20px",
        fontSize: "16px",
        fontWeight: "bold",
        color: "white",
        backgroundColor: "#007bff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        width: "100%",
        textAlign: "center",
    },
};


