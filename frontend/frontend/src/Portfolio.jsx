import { useState, useEffect } from "react";

export default function Portfolio({ user }) {
    const [assets, setAssets] = useState([]);
    const [selectedAsset, setSelectedAsset] = useState("bitcoin");
    const [quantity, setQuantity] = useState(1);
    const [price, setPrice] = useState(null);
    const [loading, setLoading] = useState(false);

    // ✅ Liste des cryptos disponibles (seulement des cryptos)
    const cryptoOptions = ["bitcoin", "ethereum", "bnb", "xrp", "dogecoin", "solana", "cardano", "polkadot", "litecoin", "chainlink"];

    // ✅ Récupérer le prix en temps réel via CoinGecko
    useEffect(() => {
        async function fetchPrice() {
            setLoading(true);
            try {
                const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${selectedAsset}&vs_currencies=usd`);
                const data = await response.json();
                if (data[selectedAsset] && data[selectedAsset].usd) {
                    setPrice(data[selectedAsset].usd);
                } else {
                    setPrice(null);
                }
            } catch (error) {
                console.error("❌ Erreur récupération prix", error);
                setPrice(null);
            } finally {
                setLoading(false);
            }
        }
        fetchPrice();
    }, [selectedAsset]);

    // ✅ Ajouter un actif à la BDD (appel API backend)
    const handleBuy = async () => {
        if (!user || !user.id || !price) {
            alert("⚠️ Veuillez vous connecter et sélectionner un actif valide !");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/portfolio/add?userId=${user.id}&symbol=${selectedAsset}&quantity=${quantity}`, { method: "POST" });
            if (response.ok) {
                alert(`✅ Achat : ${quantity}x ${selectedAsset.toUpperCase()} à ${price.toFixed(2)} USD`);
                fetchPortfolio(); // 🔄 Rafraîchir la liste des actifs
            } else {
                alert("❌ Erreur achat actif");
            }
        } catch (error) {
            console.error("❌ Erreur ajout actif:", error);
        }
    };

    // ✅ Récupérer le portefeuille depuis la BDD
    const fetchPortfolio = async () => {
        try {
            const response = await fetch(`http://localhost:8080/portfolio/get?userId=${user.id}`);
            if (response.ok) {
                setAssets(await response.json());
            }
        } catch (error) {
            console.error("❌ Erreur récupération portefeuille:", error);
        }
    };

    // 🔄 Charger le portefeuille à l'affichage
    useEffect(() => {
        if (user && user.id) fetchPortfolio();
    }, [user]);

    return (
        <div>
            <h1>📈 Portefeuille (Crypto)</h1>

            <label>Crypto :</label>
            <select value={selectedAsset} onChange={(e) => setSelectedAsset(e.target.value)}>
                {cryptoOptions.map((crypto) => <option key={crypto} value={crypto}>{crypto.toUpperCase()}</option>)}
            </select>

            <label>Quantité :</label>
            <input type="number" value={quantity} min="1" onChange={(e) => setQuantity(Number(e.target.value))} />

            <p>💰 Prix actuel : {loading ? "🔄 Chargement..." : price ? `${price.toFixed(2)} USD` : "❌ Indisponible"}</p>

            <button onClick={handleBuy} disabled={loading || !price}>Acheter</button>
        </div>
    );
}





