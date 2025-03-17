import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home({ user }) {
    const navigate = useNavigate();
    const [userName, setUserName] = useState("");

    useEffect(() => {
        if (!user) {
            const storedUser = JSON.parse(localStorage.getItem("user"));
            if (storedUser) {
                setUserName(`${storedUser.firstName} ${storedUser.lastName}`);
            } else {
                navigate("/");
            }
        } else {
            setUserName(`${user.firstName} ${user.lastName}`);
        }
    }, [user, navigate]);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    };

    return (
        <div style={styles.pageContainer}>
            <div style={styles.content}>
                <h1 style={styles.title}>Bienvenue, {userName}</h1>

                <div style={styles.buttonContainer}>
                    <button style={styles.button} onClick={() => navigate("/portfolio")}>
                        Voir mon portefeuille
                    </button>

                    <button style={styles.button} onClick={() => navigate("/history")}>
                        Voir l'historique des actifs
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

// 🔹 Styles en objet
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




