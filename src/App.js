import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomeScreen from './HomeScreen';
import PurchaseConfirmationScreen from './components/PurchaseConfirmationScreen';
import Header from './components/Header';
import SetPayment from './components/PaymentPage'; // Assuming this is the component for the seat map and payment
import SeatMap from './components/seatMap';


function App() {
    return (
        <BrowserRouter>
            <div>
                <Header />
                <main className="app-main">
                    <Routes>
                        <Route path="/" element={<HomeScreen />} />
                        <Route path="/purchase-confirmation" element={<PurchaseConfirmationScreen />} />
                          <Route path="/setMap" element={<SeatMap />} />
                        <Route path="/payment" element={<SetPayment />} />
                    </Routes>
                </main>
                <footer className="app-footer">
                </footer>
            </div>
        </BrowserRouter>
    );
}

export default App;
