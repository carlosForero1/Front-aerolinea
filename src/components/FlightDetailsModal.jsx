import React, { useState, useEffect } from 'react';
import "./FlightDetailsModal.css"; // Asegúrate de que la ruta sea correcta

const API_BASE_URL = 'http://localhost:8080/api';

function FlightDetailsModal({ isOpen, onClose, flight, onSelectTariff }) {
    const [tariffs, setTariffs] = useState([]);
    const [loadingTariffs, setLoadingTariffs] = useState(false);
    const [errorTariffs, setErrorTariffs] = useState(null);
    const [selectedTariffId, setSelectedTariffId] = useState(null);

    useEffect(() => {
        const fetchFlightTariffs = async () => {
            if (isOpen && flight?.id) {
                setLoadingTariffs(true);
                setErrorTariffs(null);
                try {
                    const response = await fetch(`${API_BASE_URL}/tariffs/${flight.id}`);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    setTariffs(data);
                } catch (error) {
                    console.error('Error fetching flight tariffs:', error);
                    setErrorTariffs('Hubo un error al cargar las tarifas para este vuelo.');
                    setTariffs([]);
                } finally {
                    setLoadingTariffs(false);
                }
            } else {
                setTariffs([]);
            }
        };

        fetchFlightTariffs();
    }, [isOpen, flight?.id]);

    const handleTariffSelection = (tariff) => {
        setSelectedTariffId(tariff.id);
        onSelectTariff(flight, tariff); 
    };

    if (!isOpen || !flight) {
        return null;
    }

    const { name, departureCity, arrivalCity, departureDate, arrivalDate, price } = flight;

    return (
         <div
      className={`offcanvas offcanvas-end ${isOpen ? "show" : ""}`}
      tabIndex="-1"
      style={{
        visibility: isOpen ? "visible" : "hidden",
        backgroundColor: "white",
        width: "600px",
        height: "600px",
        transition: "transform 0.3s ease-in-out",
        zIndex: "1055",
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        maxWidth: "95%",
        maxHeight: "95%",
        margin: "20px",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
         border: "1px solid #ccc", // Añade un borde gris claro
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div className="offcanvas-header">
                    <h5 className="modal-title">Detalles del Vuelo</h5>
                    <button type="button" className="btn-close" onClick={onClose}></button>
                </div>
                <div className="modal-body">
                    <p><strong>Vuelo:</strong> {name}</p>
                    <p><strong>Origen:</strong> {departureCity?.name}</p>
                    <p><strong>Destino:</strong> {arrivalCity?.name}</p>
                    <p><strong>Salida:</strong> {new Date(departureDate).toLocaleString()}</p>
                    <p><strong>Llegada:</strong> {new Date(arrivalDate).toLocaleString()}</p>

                    {loadingTariffs && <p>Cargando tarifas...</p>}
                    {errorTariffs && <p style={{ color: 'red' }}>{errorTariffs}</p>}

                    {tariffs && tariffs.length > 0 ? (
                        <div className="mt-3">
                            <h6>Seleccionar Tarifa:</h6>
                            <ul className="list-group">
                                {tariffs.map((tariff) => (
                                    <li key={tariff.id} className="list-group-item">
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="flight-tariff"
                                                id={`tariff-${tariff.id}`}
                                                value={tariff.id}
                                                checked={selectedTariffId === tariff.id}
                                                onChange={() => handleTariffSelection(tariff)}
                                            />
                                            <label className="form-check-label" htmlFor={`tariff-${tariff.id}`}>
                                                {tariff.name} - ${tariff.price}
                                            </label>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        !loadingTariffs && <p className="mt-3">No hay tarifas disponibles para este vuelo.</p>
                    )}
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                        Cerrar
                    </button>
                    {tariffs && tariffs.length > 0 && selectedTariffId && (
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => {
                                const selectedTariff = tariffs.find(t => t.id === selectedTariffId);
                                if (selectedTariff) {
                                    onSelectTariff(flight, selectedTariff);
                                } else {
                                    alert('Por favor, selecciona una tarifa.');
                                }
                            }}
                        >
                            Seleccionar
                        </button>
                    )}
                </div>
            </div>

    );
}

export default FlightDetailsModal;