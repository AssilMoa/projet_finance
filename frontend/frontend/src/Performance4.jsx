import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import "chart.js/auto";

export default function Performance4() {
    const navigate = useNavigate();
    const [btcMacdData, setBtcMacdData] = useState([]);
    const [ethMacdData, setEthMacdData] = useState([]);
    const [labels, setLabels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchMacdData(symbol, setMacdData) {
            try {
                const response = await fetch(
                    `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1d&limit=50`
                );
                if (!response.ok) {
                    throw new Error("Erreur lors de la récupération des données.");
                }
                const data = await response.json();

                // Extraire les prix de clôture et les timestamps
                const closingPrices = data.map(candle => parseFloat(candle[4]));
                const timestamps = data.map(candle =>
                    new Date(candle[0]).toLocaleDateString()
                );

                // Fonction pour calculer l'EMA
                function calculateEMA(prices, period) {
                    const alpha = 2 / (period + 1);
                    let emaArray = [prices.slice(0, period).reduce((a, b) => a + b) / period];

                    for (let i = period; i < prices.length; i++) {
                        const ema = (prices[i] - emaArray[i - period]) * alpha + emaArray[i - period];
                        emaArray.push(ema);
                    }
                    return emaArray;
                }

                // Calcul des EMA 12 et EMA 26
                const ema12 = calculateEMA(closingPrices, 12);
                const ema26 = calculateEMA(closingPrices, 26);

                // Calcul du MACD
                const macd = ema12.slice(ema12.length - ema26.length).map((val, idx) => val - ema26[idx]);

                // Mise à jour des états
                setMacdData(macd);
                if (!labels.length) {
                    setLabels(timestamps.slice(-macd.length));
                }
            } catch (error) {
                console.error("Erreur lors du chargement :", error);
                setError("Impossible de récupérer le MACD.");
            } finally {
                setLoading(false);
            }
        }

        fetchMacdData("BTCUSDT", setBtcMacdData);
        fetchMacdData("ETHUSDT", setEthMacdData);
    }, []);

    if (loading) return <h2>Chargement du MACD...</h2>;
    if (error) return <h2>{error}</h2>;

    // Données pour le graphique MACD (BTC & ETH)
    const macdChartData = {
        labels: labels,
        datasets: [
            {
                label: "MACD Bitcoin",
                data: btcMacdData,
                borderColor: "blue",
                fill: false,
                tension: 0.1,
            },
            {
                label: "MACD Ethereum",
                data: ethMacdData,
                borderColor: "orange",
                fill: false,
                tension: 0.1,
            },
            {
                label: "Ligne Zéro",
                data: new Array(labels.length).fill(0),
                borderColor: "black",
                borderDash: [5, 5], // Ligne pointillée
                fill: false,
            },
        ],
    };

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <h1 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "25px" }}>Indicateur MACD (BTC & ETH)</h1>

            {/* Graphique MACD */}
            <div style={{ marginTop: "30px" }}>
                <h2>MACD (Bitcoin & Ethereum)</h2>
                <Line data={macdChartData} />
            </div>

            {/* Explication du MACD */}
            <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                <h3>Explication du MACD :</h3>
                <ul>
                    <li><strong>MACD = EMA(12) - EMA(26)</strong> : Différence entre deux moyennes mobiles exponentielles.</li>
                    <li><strong>Interprétation</strong> :
                        <ul>
                            <li>MACD positif → Tendance haussière.</li>
                            <li>MACD négatif → Tendance baissière.</li>
                        </ul>
                    </li>
                </ul>
            </div>

            {/* Bouton Retour */}
            <div style={{ textAlign: "center", marginTop: "20px" }}>
                <button
                    onClick={() => navigate("/performance3")}
                    style={{
                        padding: "10px 20px",
                        fontSize: "16px",
                        backgroundColor: "#DC3545",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        marginRight: "10px",
                    }}
                >
                    Retour
                </button>

                <button
                    onClick={() => navigate("/performance5")}
                    style={{
                        padding: "10px 20px",
                        fontSize: "16px",
                        backgroundColor: "#28A745",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                    }}
                >
                    Suivant
                </button>
            </div>
        </div>
    );
}



