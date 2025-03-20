import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

export default function Simulation() {
    const [selectedCrypto, setSelectedCrypto] = useState("BTCUSDT");
    const [investment, setInvestment] = useState(1000);
    const [profit, setProfit] = useState(0);
    const [historicalPrices, setHistoricalPrices] = useState([]);
    const [predictedSMA, setPredictedSMA] = useState(null);
    const [predictedRegression, setPredictedRegression] = useState(null);
    const [dates, setDates] = useState([]);

    // Charge les données historiques de la crypto choisie
    useEffect(() => {
        async function fetchHistoricalData() {
            try {
                const response = await fetch(
                    `https://api.binance.com/api/v3/klines?symbol=${selectedCrypto}&interval=1d&limit=30`
                );
                if (!response.ok) throw new Error("Erreur récupération historique.");
                const data = await response.json();

                const closingPrices = data.map(candle => parseFloat(candle[4]));
                const dateLabels = data.map(candle => new Date(candle[0]).toLocaleDateString());

                setHistoricalPrices(closingPrices);
                setDates(dateLabels);

                // Calcul de la moyenne mobile simple (SMA)
                const sma = closingPrices.slice(-7).reduce((a, b) => a + b, 0) / 7;
                setPredictedSMA(sma.toFixed(2));

                // Calcul de la régression linéaire
                const n = closingPrices.length;
                const sumX = [...Array(n).keys()].reduce((a, b) => a + b, 0);
                const sumY = closingPrices.reduce((a, b) => a + b, 0);
                const sumXY = closingPrices.reduce((sum, y, i) => sum + i * y, 0);
                const sumX2 = [...Array(n).keys()].reduce((a, b) => a + (b * b), 0);

                const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
                const intercept = (sumY - slope * sumX) / n;
                const regressionPrediction = slope * (n + 1) + intercept;

                setPredictedRegression(regressionPrediction.toFixed(2));

            } catch (error) {
                console.error("Erreur chargement historique :", error);
            }
        }

        fetchHistoricalData();
    }, [selectedCrypto]);

    // Simule les gains basés sur l'investissement initial et les prix historiques
    function simulateInvestment() {
        if (historicalPrices.length > 0) {
            const firstPrice = historicalPrices[0];
            const lastPrice = historicalPrices[historicalPrices.length - 1];
            const gain = ((lastPrice - firstPrice) / firstPrice) * investment;
            setProfit(gain.toFixed(2));
        }
    }

    // Données pour afficher le graphique
    const chartData = {
        labels: dates,
        datasets: [
            {
                label: "Prix de clôture",
                data: historicalPrices,
                borderColor: "blue",
                fill: false,
                tension: 0.1,
            },
            {
                label: "Moyenne Mobile (SMA 7j)",
                data: historicalPrices.map((_, i, arr) =>
                    i < 6 ? null : arr.slice(i - 6, i + 1).reduce((a, b) => a + b, 0) / 7
                ),
                borderColor: "green",
                fill: false,
                tension: 0.1,
            },
            {
                label: "Régression Linéaire",
                data: historicalPrices.map((_, i) => (i * (predictedRegression - historicalPrices[0])) / historicalPrices.length + historicalPrices[0]),
                borderColor: "red",
                borderDash: [5, 5],
                fill: false,
            },
        ],
    };

    return (
        <div style={styles.pageContainer}>
            <div style={styles.content}>
                <h1 style={styles.title}>Simulation d'Investissement</h1>

                {/* Sélecteur de crypto */}
                <label style={styles.label}>Choisissez une crypto :</label>
                <select
                    value={selectedCrypto}
                    onChange={(e) => setSelectedCrypto(e.target.value)}
                    style={styles.select}
                >
                    <option value="BTCUSDT">Bitcoin (BTC)</option>
                    <option value="ETHUSDT">Ethereum (ETH)</option>
                    <option value="BNBUSDT">Binance Coin (BNB)</option>
                    <option value="SOLUSDT">Solana (SOL)</option>
                </select>

                {/* Saisie du montant à investir */}
                <label style={styles.label}>Montant investi ($) :</label>
                <input
                    type="number"
                    value={investment}
                    onChange={(e) => setInvestment(Number(e.target.value))}
                    style={styles.input}
                />

                {/* Bouton pour lancer la simulation */}
                <button style={styles.button} onClick={simulateInvestment}>
                    Simuler
                </button>

                {/* Résultats de la simulation */}
                {profit !== 0 && <h2>Gains/Pertes simulés : {profit} $</h2>}
                <h2>Prévision moyenne mobile simple 7j : {predictedSMA} $</h2>
                <h2>Prévision Régression Linéaire : {predictedRegression} $</h2>

                {/* Affichage du graphique */}
                <div style={styles.chartContainer}>
                    <Line data={chartData} />
                </div>

                {/* Explication des formules utilisées */}
                <div style={styles.formulaBox}>
                    <h3>Formules utilisées :</h3>
                    <p><strong>Moyenne Mobile Simple :</strong></p>
                    <p style={styles.formula}>
                        SMA = (P₁ + P₂ + ... + Pₙ) / n
                    </p>
                    <p>où P₁, P₂, ..., Pₙ sont les prix de clôture sur les derniers n jours.</p>

                    <p><strong>Régression Linéaire :</strong></p>
                    <p style={styles.formula}>
                        Y = aX + b
                    </p>
                    <p>où <strong>a</strong> est la pente et <strong>b</strong> l'ordonnée à l'origine, calculés sur les données passées.</p>
                </div>
            </div>
        </div>
    );
}

// Styles en objet pour l'interface
const styles = {
    pageContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#f8f9fa",
        overflowY: "auto",  // Permet un bon scroll
        minHeight: "100vh",
    },
    content: {
        textAlign: "center",
        background: "white",
        padding: "40px",
        borderRadius: "10px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        width: "900px", // Largeur augmentée
    },
    title: {
        fontSize: "32px",
        fontWeight: "bold",
        marginBottom: "25px",
    },
    label: {
        fontSize: "18px",
        fontWeight: "bold",
        marginTop: "10px",
        display: "block",
    },
    select: {
        width: "100%",
        padding: "12px",
        fontSize: "18px",
        marginBottom: "20px",
    },
    input: {
        width: "100%",
        padding: "12px",
        fontSize: "18px",
        marginBottom: "20px",
    },
    button: {
        padding: "14px",
        fontSize: "18px",
        fontWeight: "bold",
        color: "white",
        backgroundColor: "#007bff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        width: "100%",
    },
    chartContainer: {
        marginTop: "20px",
        width: "100%",
        height: "400px", // Taille augmentée pour le graph
    },
    formulaBox: {
        marginTop: "30px",
        padding: "15px",
        backgroundColor: "#f8f9fa",
        borderRadius: "8px",
    },
    formula: {
        fontFamily: "monospace",
        backgroundColor: "#fff3cd",
        padding: "5px",
        borderRadius: "5px",
    },
};



