import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomeScreen from './HomeScreen'; 
import PurchaseConfirmationScreen from './components/PurchaseConfirmationScreen';
import Header from './components/Header'; 

function App() {
    return (
        <BrowserRouter>
            <div>
                <Header />
                <main className="app-main">
                    <Routes>
                        <Route path="/" element={<HomeScreen />} />
                        <Route path="/purchase-confirmation" element={<PurchaseConfirmationScreen />} />
                    </Routes>
                </main>
                <footer className="app-footer">
                </footer>
            </div>
        </BrowserRouter>
    );
}

export default App;
