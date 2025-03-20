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
            setError("Veuillez vous connecter pour voir les performances.");
            setLoading(false);
            return;
        }

        // Fonction pour récupérer les données du portefeuille de l'utilisateur
        async function fetchPortfolio() {
            try {
                const response = await fetch(`http://localhost:8080/portfolio/get?userId=${user.id}`);
                if (!response.ok) {
                    throw new Error("Erreur lors de la récupération des performances.");
                }
                const data = await response.json();
                setPortfolio(data);

                let bought = 0;
                let now = 0;
                let historical = [];

                // Calcul des montants investis et actuels
                data.forEach(asset => {
                    bought += asset.quantity * asset.priceBought;
                    now += asset.quantity * asset.priceNow;
                    historical.push({ date: new Date().toISOString().split("T")[0], value: now });
                });

                // Mise à jour des statistiques
                setTotalBought(bought);
                setTotalNow(now);
                setPerformanceGlobal(((now - bought) / bought) * 100);
                setHistoricalData(historical);
            } catch (error) {
                console.error("Erreur chargement portefeuille :", error);
                setError("Impossible de récupérer les performances.");
            } finally {
                setLoading(false);
            }
        }

        // Fonction pour récupérer les données du marché
        async function fetchMarketData() {
            try {
                const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5&page=1`);
                if (!response.ok) {
                    throw new Error("Erreur lors de la récupération des données du marché.");
                }
                const data = await response.json();
                setMarketData(data);
            } catch (error) {
                console.error("Erreur chargement du marché :", error);
            }
        }

        // Appels des fonctions pour récupérer les données
        fetchPortfolio();
        fetchMarketData();
    }, [user]);

    if (loading) return <h2 style={styles.centeredText}>Chargement des performances...</h2>;
    if (error) return <h2 style={styles.centeredText}>{error}</h2>;
    if (!portfolio.length) return <h2 style={styles.centeredText}>Aucun actif trouvé dans le portefeuille.</h2>;

    // Données pour les graphiques
    const pieData = {
        labels: portfolio.map(asset => asset.symbol.toUpperCase()),
        datasets: [{
            data: portfolio.map(asset => asset.quantity * asset.priceNow),
            backgroundColor: ["#007BFF", "#36A2EB", "#FFCE56", "#4CAF50", "#9966FF"]
        }]
    };

    const lineData = {
        labels: historicalData.map(entry => entry.date),
        datasets: [{
            label: "Évolution du portefeuille ($)",
            data: historicalData.map(entry => entry.value),
            fill: false,
            borderColor: "#007BFF",
            tension: 0.1
        }]
    };

    const barData = {
        labels: portfolio.map(asset => asset.symbol.toUpperCase()),
        datasets: [{
            label: "Performance (%)",
            data: portfolio.map(asset => asset.performance),
            backgroundColor: portfolio.map(asset => asset.performance >= 0 ? "#28A745" : "#DC3545"),
        }]
    };

    const marketBarData = {
        labels: marketData.map(crypto => crypto.name),
        datasets: [{
            label: "Variation 24h (%)",
            data: marketData.map(crypto => crypto.price_change_percentage_24h),
            backgroundColor: marketData.map(crypto => crypto.price_change_percentage_24h >= 0 ? "#28A745" : "#DC3545"),
        }]
    };

    return (
        <div style={styles.pageContainer}>
            <div style={styles.content}>
                <h1 style={styles.title}>Performances du Portefeuille</h1>

                {/* Affichage des performances globales */}
                <div style={styles.globalStats}>
                    <h2>Achat : {totalBought.toFixed(2)} $</h2>
                    <h2>Valeur actuelle : {totalNow.toFixed(2)} $</h2>
                    <h2 style={{ color: performanceGlobal >= 0 ? "#28A745" : "#DC3545" }}>
                        Performance : {performanceGlobal.toFixed(2)} %
                    </h2>
                </div>

                {/* Affichage des graphiques */}
                <div style={styles.chartsContainer}>
                    <div style={styles.chartBlock}>
                        <h2>Répartition des actifs</h2>
                        <Pie data={pieData} />
                    </div>
                    <div style={styles.chartBlock}>
                        <h2>Performance des actifs</h2>
                        <Bar data={barData} />
                    </div>
                </div>

                {/* Tableau des performances par actif */}
                <table style={styles.table}>
                    <thead>
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
                        <tr key={index} style={index % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                            <td>{asset.symbol.toUpperCase()}</td>
                            <td>{asset.quantity}</td>
                            <td>{asset.priceBought.toFixed(2)} $</td>
                            <td>{asset.priceNow.toFixed(2)} $</td>
                            <td style={{ color: asset.performance >= 0 ? "#28A745" : "#DC3545" }}>
                                {asset.performance.toFixed(2)} %
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                {/* Affichage des mouvements récents du marché */}
                <div style={styles.marketBlock}>
                    <h2>Mouvements récents du marché (24h)</h2>
                    <Bar data={marketBarData} />
                </div>

                {/* Bouton pour voir la volatilité */}
                <button style={styles.nextButton} onClick={() => navigate("/performance2")}>
                    Suivant (Voir Volatilité)
                </button>
            </div>
        </div>
    );
}

// Styles en objet pour l'interface
const styles = {
    pageContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
        fontFamily: "'Inter', sans-serif",
        padding: "20px",
    },
    content: {
        textAlign: "center",
        background: "#ffffff",
        padding: "40px",
        borderRadius: "10px",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        width: "100%",
        maxWidth: "1400px",
    },
    globalStats: {
        display: "flex",
        justifyContent: "space-between",
        padding: "15px",
        background: "#E9ECEF",
        borderRadius: "8px",
        marginBottom: "20px",
    },
    chartsContainer: {
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: "30px",
    },
    chartBlock: {
        width: "45%",
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
        marginTop: "20px",
    },
    nextButton: {
        marginTop: "20px",
        padding: "12px 25px",
        backgroundColor: "#007BFF",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    },
};









