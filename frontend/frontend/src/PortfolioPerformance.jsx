import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto"; // 🚀 Nécessaire pour Chart.js

export default function PortfolioPerformance({ user }) {
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPerformanceData() {
            if (!user || !user.id) return;

            try {
                // 📊 Récupération de l'historique des transactions
                const response = await fetch(`http://localhost:8080/portfolio/history?userId=${user.id}`);
                if (!response.ok) throw new Error("⚠️ Erreur chargement historique.");
                const history = await response.json();

                // 🔥 Extraction des dates et calcul des valeurs du portefeuille
                let dates = [];
                let values = [];
                let totalValue = 0;

                for (const transaction of history) {
                    dates.push(transaction.date);
                    totalValue += transaction.quantity * transaction.priceBought; // On cumule
                    values.push(totalValue);
                }

                setChartData({
                    labels: dates, // 📅 Dates des transactions
                    datasets: [{
                        label: "📈 Évolution du portefeuille",
                        data: values, // 💰 Valeur du portefeuille au fil du temps
                        borderColor: "blue",
                        backgroundColor: "rgba(0, 0, 255, 0.1)",
                        fill: true
                    }]
                });

            } catch (error) {
                console.error("❌ Erreur chargement des performances :", error);
            } finally {
                setLoading(false);
            }
        }

        fetchPerformanceData();
    }, [user]);

    if (loading) return <h2>Chargement de la courbe... 🔄</h2>;
    if (!chartData) return <h2>⚠️ Aucune donnée disponible.</h2>;

    return (
        <div>
            <h1>📊 Performance du Portefeuille</h1>
            <Line data={chartData} />
        </div>
    );
}