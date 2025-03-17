import { useEffect, useState } from "react";

export default function Alerts() {
    const [alerts, setAlerts] = useState([]);
    const [prices, setPrices] = useState({});
    const [lastUpdate, setLastUpdate] = useState("");
    const alertThreshold = 0.1; // 🔥 **Seuil bas pour voir les alertes**
    const allowedCryptos = ["btcusdt", "ethusdt", "dogeusdt"]; // 🔹 **Cryptos suivies**

    useEffect(() => {
        // ✅ **WebSocket Binance**
        const ws = new WebSocket(
            `wss://stream.binance.com:9443/ws/btcusdt@ticker/ethusdt@ticker/dogeusdt@ticker`
        );

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (allowedCryptos.includes(data.s.toLowerCase())) {
                const newAlert = {
                    symbol: data.s, // Ex: BTCUSDT
                    change: parseFloat(data.P), // Variation en %
                    type: parseFloat(data.P) > 0 ? "Hausse" : "Baisse",
                };

                setAlerts((prevAlerts) => {
                    // ✅ Remplace l’ancienne alerte pour la même crypto
                    const updatedAlerts = prevAlerts.filter(alert => alert.symbol !== newAlert.symbol);
                    return [...updatedAlerts, newAlert];
                });

                setPrices((prevPrices) => ({
                    ...prevPrices,
                    [data.s]: parseFloat(data.c), // Dernier prix
                }));

                // ✅ Met à jour l'heure
                setLastUpdate(new Date().toLocaleTimeString());
            }
        };

        ws.onerror = (error) => console.error("WebSocket Erreur :", error);

        // ✅ **Ferme proprement WebSocket lors du démontage**
        return () => {
            ws.close();
        };
    }, []);

    return (
        <div style={styles.pageContainer}>
            <div style={styles.content}>
                <h2 style={styles.title}>Alertes & Notifications</h2>

                {/* 🔹 Affichage de la dernière mise à jour */}
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

// ✅ **Styles mis à jour**
const styles = {
    pageContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#f8f9fa",
    },
    content: {
        textAlign: "center",
        background: "white",
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
        backgroundColor: "#f8f9fa",
    },
    rowOdd: {
        backgroundColor: "white",
    },
};


