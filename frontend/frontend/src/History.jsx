import { useEffect, useState } from "react";

export default function History({ user }) {
    const [history, setHistory] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!user || !user.id) {
            setError("⚠️ Utilisateur non connecté.");
            return;
        }

        const fetchHistory = async () => {
            try {
                const response = await fetch(`http://localhost:8080/portfolio/get?userId=${user.id}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data || "❌ Erreur lors de la récupération de l'historique.");
                }

                setHistory(data);
            } catch (err) {
                console.error("❌ Erreur API :", err);
                setError(err.message);
            }
        };

        fetchHistory();
    }, [user]);

    const handleDelete = async (symbol) => {
        if (!user || !user.id) {
            alert("⚠️ Utilisateur non connecté !");
            return;
        }

        console.log(`📡 Envoi requête DELETE pour supprimer ${symbol} de l'utilisateur ${user.id}`);

        try {
            const response = await fetch(`http://localhost:8080/portfolio/remove?userId=${user.id}&symbol=${symbol}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error(`❌ Erreur suppression : ${response.statusText}`);
            }

            console.log(`✅ Suppression réussie pour ${symbol}`);
            setHistory(history.filter(asset => asset.symbol !== symbol)); // Mise à jour en local
        } catch (error) {
            console.error("❌ Erreur suppression actif :", error);
            alert("❌ Erreur lors de la suppression !");
        }
    };

    return (
        <div>
            <h1>📜 Historique des actifs</h1>

            {error && <p style={{ color: "red" }}>❌ {error}</p>}

            {history.length === 0 && !error && <p>📂 Aucun historique disponible.</p>}

            <ul>
                {history.map((entry, index) => (
                    <li key={index}>
                        <strong>{entry.symbol}</strong> - {entry.quantity} unités - Acheté à {entry.priceBought.toFixed(2)} USD
                        <br />
                        <small>📅 {entry.transactionDate}</small>
                        <br />
                        <button onClick={() => handleDelete(entry.symbol)}>🗑 Supprimer</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}






