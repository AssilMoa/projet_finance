import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import "chart.js/auto";

export default function Performance3() {
    const navigate = useNavigate();
    const [sharpeData, setSharpeData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchMarketData() {
            try {
                // Récupération des données du marché (les 5 principales cryptos)
                const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5&page=1`);
                if (!response.ok) {
                    throw new Error("Erreur lors de la récupération des données du marché.");
                }
                const data = await response.json();

                const riskFreeRate = 2; // Taux sans risque fictif en %
                const priceChanges = data.map(crypto => crypto.price_change_percentage_24h);
                const meanReturn = priceChanges.reduce((sum, value) => sum + value, 0) / priceChanges.length;
                const variance = priceChanges.map(v => Math.pow(v - meanReturn, 2)).reduce((sum, value) => sum + value, 0) / priceChanges.length;
                const stdDev = Math.sqrt(variance);

                // Calcul du Sharpe Ratio pour chaque crypto
                const sharpeRatios = data.map(crypto => ({
                    name: crypto.name,
                    symbol: crypto.symbol.toUpperCase(),
                    sharpeRatio: ((crypto.price_change_percentage_24h - riskFreeRate) / stdDev).toFixed(2)
                }));

                // Mise à jour des données du Sharpe Ratio
                setSharpeData(sharpeRatios);
            } catch (error) {
                console.error("Erreur lors du chargement du marché :", error);
                setError("Impossible de récupérer le Sharpe Ratio.");
            } finally {
                setLoading(false);
            }
        }

        fetchMarketData();
    }, []);

    if (loading) return <h2>Chargement du Sharpe Ratio...</h2>;
    if (error) return <h2>{error}</h2>;

    // Données pour afficher le graphique du Sharpe Ratio
    const sharpeBarData = {
        labels: sharpeData.map(crypto => crypto.name),
        datasets: [{
            label: "Sharpe Ratio",
            data: sharpeData.map(crypto => crypto.sharpeRatio),
            backgroundColor: "blue"
        }]
    };

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <h1>Sharpe Ratio des Cryptos</h1>

            {/* Affichage du graphique avec le Sharpe Ratio */}
            <div style={{ marginTop: "30px" }}>
                <h2>Sharpe Ratio</h2>
                <Bar data={sharpeBarData} />
            </div>

            {/* Détails du Sharpe Ratio */}
            <h2 style={{ marginTop: "30px" }}>Détail du Sharpe Ratio</h2>
            <table border="1" style={{ width: "100%", textAlign: "center", borderCollapse: "collapse", marginTop: "20px" }}>
                <thead style={{ backgroundColor: "#f0f0f0" }}>
                <tr>
                    <th>Crypto</th>
                    <th>Symbole</th>
                    <th>Sharpe Ratio</th>
                </tr>
                </thead>
                <tbody>
                {sharpeData.map((crypto, index) => (
                    <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "#fafafa" : "white" }}>
                        <td>{crypto.name}</td>
                        <td>{crypto.symbol}</td>
                        <td>{crypto.sharpeRatio}</td>
                    </tr>
                ))}
                </tbody>
            </table>

            {/* Explication de la formule du Sharpe Ratio */}
            <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                <h3>Formule utilisée pour calculer le Sharpe Ratio :</h3>
                <p style={{ fontSize: "16px" }}>
                    Le Sharpe Ratio mesure la performance ajustée au risque d’un actif :
                </p>
                <p style={{ fontSize: "18px", fontFamily: "monospace", backgroundColor: "#fff3cd", padding: "10px", borderRadius: "5px" }}>
                    S = (R - Rf) / σ
                </p>
                <ul>
                    <li><strong>S</strong> = Sharpe Ratio</li>
                    <li><strong>R</strong> = Rendement de l'actif</li>
                    <li><strong>Rf</strong> = Rendement sans risque (ici, 2%)</li>
                    <li><strong>σ</strong> = Volatilité de l'actif</li>
                </ul>
                <p style={{ fontSize: "16px" }}>
                    Un Sharpe Ratio élevé signifie que l'actif offre un bon rendement par rapport au risque pris.
                    Un ratio négatif indique un rendement inférieur au taux sans risque.
                </p>
            </div>

            {/* Boutons de navigation */}
            <div style={{ textAlign: "center", marginTop: "20px", display: "flex", justifyContent: "center", gap: "20px" }}>
                <button
                    onClick={() => navigate("/performance2")}
                    style={{
                        padding: "10px 20px",
                        fontSize: "16px",
                        backgroundColor: "#DC3545",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer"
                    }}
                >
                    Retour
                </button>

                <button
                    onClick={() => navigate("/performance4")}
                    style={{
                        padding: "10px 20px",
                        fontSize: "16px",
                        backgroundColor: "#28A745",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer"
                    }}
                >
                    Suivant
                </button>
            </div>
        </div>
    );
}
