import React from 'react';
import "./FlightCard.css"; // Asegúrate de que la ruta sea correcta


function FlightCard({ flight, onSelectFlight, isFull }) {
    if (!flight) {
        return <div>No se ha proporcionado información del vuelo.</div>;
    }

    const { name, departureCity, arrivalCity, departureDate, arrivalDate } = flight;

    return (
        <div className={`flight-card ${isFull ? 'flight-card--full' : ''}`}>
            <div className="flight-details">
                <h5 className="flight-name">{name}</h5>
                <p className="flight-route">
                    {departureCity?.name} - {arrivalCity?.name}
                </p>
                <p className="flight-time">
                    Salida: {new Date(departureDate).toLocaleTimeString()} ({new Date(departureDate).toLocaleDateString()})
                </p>
                <p className="flight-time">
                    Llegada: {new Date(arrivalDate).toLocaleTimeString()} ({new Date(arrivalDate).toLocaleDateString()})
                </p>
            </div>
            <button
                className="btn btn-outline-primary btn-sm"
                onClick={onSelectFlight}
                disabled={isFull}
            >
                Ver Detalles
            </button>
        </div>
    );
}

export default FlightCard;