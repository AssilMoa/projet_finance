import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import "chart.js/auto";

export default function Performance2() {
    const navigate = useNavigate();
    const [volatilityData, setVolatilityData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchMarketData() {
            try {
                const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5&page=1`);
                if (!response.ok) {
                    throw new Error("Erreur lors de la récupération des données du marché.");
                }
                const data = await response.json();

                const priceChanges = data.map(crypto => crypto.price_change_percentage_24h);
                const mean = priceChanges.reduce((sum, value) => sum + value, 0) / priceChanges.length;
                const variance = priceChanges.map(v => Math.pow(v - mean, 2)).reduce((sum, value) => sum + value, 0) / priceChanges.length;
                const stdDev = Math.sqrt(variance);

                const volatility = data.map(crypto => ({
                    name: crypto.name,
                    symbol: crypto.symbol.toUpperCase(),
                    volatility: Math.abs(crypto.price_change_percentage_24h - mean).toFixed(2)
                }));

                setVolatilityData(volatility);
            } catch (error) {
                console.error("Erreur lors du chargement du marché :", error);
                setError("Impossible de récupérer la volatilité.");
            } finally {
                setLoading(false);
            }
        }

        fetchMarketData();
    }, []);

    if (loading) return <h2>Chargement de la volatilité...</h2>;
    if (error) return <h2>{error}</h2>;

    const volatilityBarData = {
        labels: volatilityData.map(crypto => crypto.name),
        datasets: [{
            label: "Volatilité (%)",
            data: volatilityData.map(crypto => crypto.volatility),
            backgroundColor: "orange"
        }]
    };

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <h1>Volatilité des Cryptos</h1>

            <div style={{ marginTop: "30px" }}>
                <h2>Volatilité </h2>
                <Bar data={volatilityBarData} />
            </div>

            <h2 style={{ marginTop: "30px" }}>Détail des Volatilités</h2>
            <table border="1" style={{ width: "100%", textAlign: "center", borderCollapse: "collapse", marginTop: "20px" }}>
                <thead style={{ backgroundColor: "#f0f0f0" }}>
                <tr>
                    <th>Crypto</th>
                    <th>Symbole</th>
                    <th>Volatilité (%)</th>
                </tr>
                </thead>
                <tbody>
                {volatilityData.map((crypto, index) => (
                    <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "#fafafa" : "white" }}>
                        <td>{crypto.name}</td>
                        <td>{crypto.symbol}</td>
                        <td>{crypto.volatility} %</td>
                    </tr>
                ))}
                </tbody>
            </table>

            <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                <h3>Formule utilisée pour calculer la volatilité :</h3>
                <p style={{ fontSize: "16px" }}>
                    La volatilité est calculée en utilisant l'écart-type de la variation des prix sur les 24 dernières heures :
                </p>
                <p style={{ fontSize: "18px", fontFamily: "monospace", backgroundColor: "#fff3cd", padding: "10px", borderRadius: "5px" }}>
                    σ = √(Σ (rᵢ - μ)² / N)
                </p>
                <ul>
                    <li><strong>σ</strong> = Volatilité</li>
                    <li><strong>rᵢ</strong> = Variation du prix de l'actif en %</li>
                    <li><strong>μ</strong> = Moyenne des variations</li>
                    <li><strong>N</strong> = Nombre total d'actifs</li>
                </ul>
                <p style={{ fontSize: "16px" }}>
                    Cela permet de mesurer l'écart des prix par rapport à leur moyenne sur 24 heures. Plus la volatilité est élevée, plus le prix fluctue.
                </p>
            </div>

            <div style={{ textAlign: "center", marginTop: "20px", display: "flex", justifyContent: "center", gap: "20px" }}>
                <button
                    onClick={() => navigate("/performance")}
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
                    onClick={() => navigate("/performance3")}
                    style={{
                        padding: "10px 20px",
                        fontSize: "16px",
                        backgroundColor: "#007BFF",
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



