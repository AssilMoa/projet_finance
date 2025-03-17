import { useEffect, useState } from "react";
import { Pie, Line, Bar } from "react-chartjs-2";
import "chart.js/auto";
import { useNavigate } from "react-router-dom";

export default function Performance({ user }) {
    const navigate = useNavigate();
    const [portfolio, setPortfolio] = useState([]);
    const [marketData, setMarketData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalBought, setTotalBought] = useState(0);
    const [totalNow, setTotalNow] = useState(0);
    const [performanceGlobal, setPerformanceGlobal] = useState(0);
    const [historicalData, setHistoricalData] = useState([]);

    useEffect(() => {
        if (!user || !user.id) {
            setError("⚠️ Veuillez vous connecter pour voir les performances.");
            setLoading(false);
            return;
        }

        async function fetchPortfolio() {
            try {
                const response = await fetch(`http://localhost:8080/portfolio/get?userId=${user.id}`);
                if (!response.ok) {
                    throw new Error("❌ Erreur lors de la récupération des performances.");
                }
                const data = await response.json();
                setPortfolio(data);

                // 🔥 Calcul des valeurs globales du portefeuille
                let bought = 0;
                let now = 0;
                let historical = [];

                data.forEach(asset => {
                    bought += asset.quantity * asset.priceBought;
                    now += asset.quantity * asset.priceNow;
                    historical.push({ date: new Date().toISOString().split("T")[0], value: now });
                });

                setTotalBought(bought);
                setTotalNow(now);
                setPerformanceGlobal(((now - bought) / bought) * 100);
                setHistoricalData(historical);
            } catch (error) {
                console.error("❌ Erreur chargement portefeuille :", error);
                setError("⚠️ Impossible de récupérer les performances.");
            } finally {
                setLoading(false);
            }
        }

        async function fetchMarketData() {
            try {
                const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5&page=1`);
                if (!response.ok) {
                    throw new Error("❌ Erreur lors de la récupération des données du marché.");
                }
                const data = await response.json();
                setMarketData(data);
            } catch (error) {
                console.error("❌ Erreur chargement du marché :", error);
            }
        }

        fetchPortfolio();
        fetchMarketData();
    }, [user]);

    if (loading) return <h2>Chargement des performances... 🔄</h2>;
    if (error) return <h2>{error}</h2>;
    if (!portfolio.length) return <h2>⚠️ Aucun actif trouvé dans le portefeuille.</h2>;

    // 🔥 Données pour le Pie Chart (Répartition des actifs)
    const pieData = {
        labels: portfolio.map(asset => asset.symbol),
        datasets: [{
            data: portfolio.map(asset => asset.quantity * asset.priceNow),
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50", "#9966FF"]
        }]
    };

    // 🔥 Données pour la courbe de performance historique
    const lineData = {
        labels: historicalData.map(entry => entry.date),
        datasets: [{
            label: "Évolution du portefeuille ($)",
            data: historicalData.map(entry => entry.value),
            fill: false,
            borderColor: "blue",
            tension: 0.1
        }]
    };

    // 🔥 Données pour le Bar Chart (Performance par actif)
    const barData = {
        labels: portfolio.map(asset => asset.symbol),
        datasets: [{
            label: "Performance (%)",
            data: portfolio.map(asset => asset.performance),
            backgroundColor: portfolio.map(asset => asset.performance >= 0 ? "green" : "red"),
        }]
    };

    // 🔥 Données pour le Bar Chart (Mouvements récents du marché - 24h)
    const marketBarData = {
        labels: marketData.map(crypto => crypto.name),
        datasets: [{
            label: "Variation 24h (%)",
            data: marketData.map(crypto => crypto.price_change_percentage_24h),
            backgroundColor: marketData.map(crypto => crypto.price_change_percentage_24h >= 0 ? "green" : "red"),
        }]
    };

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <h1>📈 Performances du Portefeuille</h1>

            {/* 🔥 Performance globale du portefeuille */}
            <div style={{ display: "flex", justifyContent: "space-around", background: "#f8f9fa", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
                <h2>📊 Achat : {totalBought.toFixed(2)} $</h2>
                <h2>📈 Valeur actuelle : {totalNow.toFixed(2)} $</h2>
                <h2 style={{ color: performanceGlobal >= 0 ? "green" : "red" }}>
                    🔥 Performance : {performanceGlobal.toFixed(2)} %
                </h2>
            </div>

            {/* 🔥 Graphiques organisés en ligne */}
            <div style={{ display: "flex", justifyContent: "space-between", gap: "20px" }}>
                <div style={{ width: "45%" }}>
                    <h2>📊 Répartition des actifs</h2>
                    <Pie data={pieData} />
                </div>
                <div style={{ width: "50%" }}>
                    <h2>📊 Performance des actifs</h2>
                    <Bar data={barData} />
                </div>
            </div>

            {/* 🔥 Tableau des performances par actif */}
            <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
                <table border="1" style={{ width: "90%", textAlign: "center", borderCollapse: "collapse" }}>
                    <thead style={{ backgroundColor: "#f0f0f0" }}>
                    <tr>
                        <th>Actif</th>
                        <th>Quantité</th>
                        <th>Prix d'Achat (USD)</th>
                        <th>Prix Actuel (USD)</th>
                        <th>Performance (%)</th>
                    </tr>
                    </thead>
                    <tbody>
                    {portfolio.map((asset, index) => (
                        <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "#fafafa" : "white" }}>
                            <td>{asset.symbol}</td>
                            <td>{asset.quantity}</td>
                            <td>{asset.priceBought.toFixed(2)} $</td>
                            <td>{asset.priceNow.toFixed(2)} $</td>
                            <td style={{ color: asset.performance >= 0 ? "green" : "red" }}>
                                {asset.performance.toFixed(2)} %
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* 🔥 Graphique Mouvements récents du marché */}
            <div style={{ marginTop: "30px" }}>
                <h2>🌍 Mouvements récents du marché (24h)</h2>
                <Bar data={marketBarData} />
            </div>

            {/* 🔥 Tableau des Mouvements récents du marché */}
            <h2 style={{ marginTop: "30px" }}>🌍 Détail des Mouvements du Marché</h2>
            <table border="1" style={{ width: "100%", textAlign: "center", borderCollapse: "collapse" }}>
                <thead style={{ backgroundColor: "#f0f0f0" }}>
                <tr>
                    <th>Crypto</th>
                    <th>Prix (USD)</th>
                    <th>Variation 24h (%)</th>
                    <th>Volume</th>
                </tr>
                </thead>
                <tbody>
                {marketData.map((crypto, index) => (
                    <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "#fafafa" : "white" }}>
                        <td>{crypto.name} ({crypto.symbol.toUpperCase()})</td>
                        <td>{crypto.current_price.toFixed(2)} $</td>
                        <td>{crypto.price_change_percentage_24h.toFixed(2)} %</td>
                        <td>{crypto.total_volume.toLocaleString()} $</td>
                    </tr>
                ))}
                </tbody>
            </table>



            <div style={{ textAlign: "center", marginTop: "20px" }}>
                <button
                    onClick={() => navigate("/performance2")}
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
                    ➡️ Suivant (Voir Volatilité)
                </button>
            </div>

        </div>
    );
}





