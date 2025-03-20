import { useEffect, useState } from "react";

export default function Alerts() {
    const [alerts, setAlerts] = useState([]);
    const [prices, setPrices] = useState({});
    const [lastUpdate, setLastUpdate] = useState("");
    const alertThreshold = 0.1; // Seuil bas pour voir les alertes
    const allowedCryptos = ["btcusdt", "ethusdt", "dogeusdt"]; // Cryptos suivies

    useEffect(() => {
        // WebSocket pour recevoir les mises à jour en temps réel des cryptomonnaies
        const ws = new WebSocket(
            `wss://stream.binance.com:9443/ws/btcusdt@ticker/ethusdt@ticker/dogeusdt@ticker`
        );

        // Gestion de l'arrivée des données
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (allowedCryptos.includes(data.s.toLowerCase())) {
                // Crée une nouvelle alerte en fonction de la variation de la crypto
                const newAlert = {
                    symbol: data.s, // Ex: BTCUSDT
                    change: parseFloat(data.P), // Variation en %
                    type: parseFloat(data.P) > 0 ? "Hausse" : "Baisse", // Type de l'alerte
                };

                // Mise à jour des alertes avec la nouvelle donnée
                setAlerts((prevAlerts) => {
                    const updatedAlerts = prevAlerts.filter(alert => alert.symbol !== newAlert.symbol);
                    return [...updatedAlerts, newAlert];
                });

                // Mise à jour des derniers prix
                setPrices((prevPrices) => ({
                    ...prevPrices,
                    [data.s]: parseFloat(data.c), // Dernier prix de la crypto
                }));

                // Met à jour l'heure de la dernière mise à jour
                setLastUpdate(new Date().toLocaleTimeString());
            }
        };

        // Gestion des erreurs de WebSocket
        ws.onerror = (error) => console.error("WebSocket Erreur :", error);

        // Ferme le WebSocket proprement lors du démontage du composant
        return () => {
            ws.close();
        };
    }, []);

    return (
        <div style={styles.pageContainer}>
            <div style={styles.content}>
                <h2 style={styles.title}>Alertes & Notifications</h2>

                {/* Affichage de la dernière mise à jour */}
                <p style={styles.lastUpdate}>Dernière mise à jour : {lastUpdate}</p>

                {alerts.length === 0 ? (
                    <p style={styles.noAlert}>Aucune alerte détectée pour BTC, ETH ou DOGE.</p>
                ) : (
                    <table style={styles.table}>
                        <thead>
                        <tr>
                            <th>Crypto</th>
                            <th>Variation</th>
                            <th>Type</th>
                        </tr>
                        </thead>
                        <tbody>
                        {alerts.map((alert, index) => (
                            <tr key={index} style={index % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                                <td>{alert.symbol}</td>
                                <td>{alert.change.toFixed(2)}%</td>
                                <td style={{ color: alert.type === "Hausse" ? "green" : "red" }}>
                                    {alert.type}
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

// Styles pour la mise en page de l'interface
const styles = {
    pageContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#f8f9fa", // Fond gris clair
    },
    content: {
        textAlign: "center",
        background: "white", // Fond blanc pour l'interface
        padding: "50px",
        borderRadius: "10px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        width: "70vw",
        maxWidth: "800px",
    },
    title: {
        fontSize: "30px",
        fontWeight: "bold",
        marginBottom: "20px",
    },
    lastUpdate: {
        fontSize: "16px",
        color: "#555",
        marginBottom: "10px",
    },
    noAlert: {
        fontSize: "18px",
        color: "#555",
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
        marginTop: "20px",
        fontSize: "18px",
    },
    rowEven: {
        backgroundColor: "#f8f9fa", // Ligne paire avec fond gris clair
    },
    rowOdd: {
        backgroundColor: "white", // Ligne impaire avec fond blanc
    },
};
