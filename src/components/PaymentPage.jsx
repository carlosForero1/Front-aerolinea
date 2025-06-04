// src/components/PaymentPage.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { bookingDetails, flightDetails, tariffInfo, selectedSeats } = location.state || {};

    if (!bookingDetails || !flightDetails || !tariffInfo || !selectedSeats) {
        return <div className="p-6 text-red-600">Faltan datos para procesar el pago.</div>;
    }

    const handlePayment = async () => {
    const total = bookingDetails.passengers.length * tariffInfo.price;

    try {
        const response = await fetch('http://localhost:8080/api/paypal/pay', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ total }),
        });

        const approvalUrl = await response.text();

    console.log('URL de aprobación de PayPal:', approvalUrl);
        window.location.href = approvalUrl; // Redirige a PayPal para pagar
    } catch (error) {
        console.error('Error al procesar el pago:', error);
        alert('Ocurrió un error al procesar el pago.');
    }
};


    return (
        <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
            <h2 className="text-2xl font-bold mb-4 text-center">Resumen de Pago</h2>

            <div className="mb-4">
                <h3 className="font-semibold">Pasajeros y Asientos:</h3>
                <ul className="list-disc pl-6">
                    {bookingDetails.passengers.map((p) => {
                        const seatId = selectedSeats[p.documentNumber];
                        return (
                            <li key={p.documentNumber}>
                                {p.name} ({p.documentNumber}) - Asiento: {seatId}
                            </li>
                        );
                    })}
                </ul>
            </div>

            <div className="mb-4">
                <h3 className="font-semibold">Tarifa: {tariffInfo.name}</h3>
                <p className="text-sm text-gray-600">Precio base por pasajero: ${tariffInfo.price}</p>
            </div>

            <div className="mt-6 text-center">
                <button
                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded"
                    onClick={handlePayment}
                >
                    Pagar Ahora
                </button>
            </div>
        </div>
    );
};

export default PaymentPage;
