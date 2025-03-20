import { useEffect, useState } from "react";

export default function History({ user }) {
    const [history, setHistory] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!user || !user.id) {
            setError("Utilisateur non connecté.");
            return;
        }

        const fetchHistory = async () => {
            try {
                const response = await fetch(`http://localhost:8080/portfolio/get?userId=${user.id}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data || "Erreur lors de la récupération de l'historique.");
                }

                setHistory(data);
            } catch (err) {
                console.error("Erreur API :", err);
                setError(err.message);
            }
        };

        fetchHistory();
    }, [user]);

    const handleDelete = async (symbol) => {
        if (!user || !user.id) {
            alert("Utilisateur non connecté !");
            return;
        }

        console.log(`Envoi requête DELETE pour supprimer ${symbol} de l'utilisateur ${user.id}`);

        try {
            const response = await fetch(`http://localhost:8080/portfolio/remove?userId=${user.id}&symbol=${symbol}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error(`Erreur suppression : ${response.statusText}`);
            }

            console.log(`Suppression réussie pour ${symbol}`);
            setHistory(history.filter(asset => asset.symbol !== symbol)); // Mise à jour en local
        } catch (error) {
            console.error("Erreur suppression actif :", error);
            alert("Erreur lors de la suppression !");
        }
    };

    return (
        <div style={styles.pageContainer}>
            <div style={styles.content}>
                <h1 style={styles.title}>Historique des Actifs</h1>

                {error && <p style={styles.error}>{error}</p>}

                {history.length === 0 && !error && <p style={styles.noData}>Aucun historique disponible.</p>}

                {history.length > 0 && (
                    <table style={styles.table}>
                        <thead>
                        <tr>
                            <th>Crypto</th>
                            <th>Quantité</th>
                            <th>Prix d'Achat (USD)</th>
                            <th>Date</th>
                            <th>Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {history.map((entry, index) => (
                            <tr key={index} style={index % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                                <td>{entry.symbol.toUpperCase()}</td>
                                <td>{entry.quantity}</td>
                                <td>{entry.priceBought.toFixed(2)}</td>
                                <td>{entry.transactionDate}</td>
                                <td>
                                    <button style={styles.deleteButton} onClick={() => handleDelete(entry.symbol)}>Supprimer</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

// 🎨 **Styles - Thème blanc avec accents bleus et police Inter**
const styles = {
    pageContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        width: "100vw",
        backgroundColor: "#f8f9fa", // ✅ Fond blanc cassé pour un effet soft
        fontFamily: "'Inter', sans-serif",
        color: "#333",
    },
    content: {
        textAlign: "center",
        background: "#ffffff", // ✅ Fond blanc pur
        padding: "40px",
        borderRadius: "10px",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        width: "80%",
        maxWidth: "900px",
    },
    title: {
        fontSize: "28px",
        fontWeight: "bold",
        marginBottom: "20px",
        color: "#007BFF",
        textTransform: "uppercase",
    },
    error: {
        fontSize: "18px",
        color: "#dc3545",
        marginBottom: "15px",
    },
    noData: {
        fontSize: "18px",
        color: "#666",
        marginTop: "20px",
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
        marginTop: "20px",
        fontSize: "16px",
        backgroundColor: "#ffffff",
        border: "1px solid #ddd",
        borderRadius: "10px",
        overflow: "hidden",
    },
    rowEven: {
        backgroundColor: "#f8f9fa",
    },
    rowOdd: {
        backgroundColor: "#ffffff",
    },
    deleteButton: {
        padding: "8px 12px",
        fontSize: "14px",
        fontWeight: "bold",
        color: "#fff",
        backgroundColor: "#dc3545",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        transition: "0.3s",
    },
};







