import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Home from "./Home";
import Register from "./Register";
import Portfolio from "./Portfolio";
import History from "./History";
import Performance from "./Performance"; // ✅ Import de la nouvelle page
import PortfolioPerformance from "./PortfolioPerformance.jsx";
import Performance2 from "./Performance2";
import Performance3 from "./Performance3";
import Performance4 from "./Performance4";
import Alerts from "./Alerts";
import Simulation from "./Simulation";

import { useState } from "react";

export default function App() {
    const [user, setUser] = useState(() => {
        return JSON.parse(localStorage.getItem("user")) || null;
    });

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login setUser={setUser} />} />
                <Route path="/home" element={<Home user={user} />} />
                <Route path="/register" element={<Register />} />
                <Route path="/portfolio" element={<Portfolio user={user} />} />
                <Route path="/history" element={<History user={user} />} />
                <Route path="/performance" element={<Performance user={user} />} /> {/* ✅ Ajout de la route Performance */}
                <Route path="/portfolio-performance" element={<PortfolioPerformance user={user} />} />
                <Route path="/performance2" element={<Performance2 />} />
                <Route path="/performance3" element={<Performance3 />} />
                <Route path="/performance4" element={<Performance4 />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/simulation" element={<Simulation />} />
            </Routes>
        </Router>
    );
}




