// src/components/SeatMap.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const SeatMap = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { bookingDetails, flightDetails, tariffInfo } = location.state || {};

    const flightId = flightDetails?.id;
    // const [mostrarPago, setMostrarPago] = useState(false); // NO LONGER NEEDED HERE
    // const [pagoRealizado, setPagoRealizado] = useState(false); // NO LONGER NEEDED HERE

    const [seats, setSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState({}); // This holds frontend selections
    const [loadingSeats, setLoadingSeats] = useState(true);
    const [seatMapError, setSeatMapError] = useState(null);
    const passengers = bookingDetails?.passengers || [];

    const [activePassengerIndex, setActivePassengerIndex] = useState(0);

    const activePassenger = passengers[activePassengerIndex];

    const fetchSeats = useCallback(async () => {
        if (!flightId) {
            console.warn("Flight ID not provided. Cannot fetch seats.");
            setLoadingSeats(false);
            return;
        }

        setLoadingSeats(true);
        setSeatMapError(null);
        try {
            // Only fetch seats to know their *initial* backend status (occupied/blocked)
            const response = await fetch(`http://localhost:8080/api/seats/flight/${flightId}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al cargar los asientos.');
            }
            const data = await response.json();
            setSeats(data); // Keep all seats, let `disabled` prop handle availability.

        } catch (err) {
            setSeatMapError(err.message);
        } finally {
            setLoadingSeats(false);
        }
    }, [flightId]);

    useEffect(() => {
        if (!bookingDetails || !flightDetails || !tariffInfo) {
            alert('Información de reserva incompleta. Redirigiendo al inicio.');
            navigate('/');
            return;
        }
        fetchSeats();
    }, [flightId, bookingDetails, flightDetails, tariffInfo, navigate, fetchSeats]);

    useEffect(() => {
        const nextPassengerWithoutSeatIndex = passengers.findIndex(p => !selectedSeats[p.documentNumber]);
        if (nextPassengerWithoutSeatIndex !== -1) {
            setActivePassengerIndex(nextPassengerWithoutSeatIndex);
        } else {
            if (passengers.length > 0) {
                setActivePassengerIndex(passengers.length - 1);
            } else {
                setActivePassengerIndex(null);
            }
        }
    }, [selectedSeats, passengers]);

    const validateSeatSelection = (seat, passenger) => {
        if (!passenger || !passenger.documentNumber) {
            alert("No hay un pasajero activo o su documento de identidad no es válido para asignar un asiento.");
            return false;
        }

        const isCurrentlySelectedByActivePassenger = selectedSeats[passenger.documentNumber] === seat.id;
        
        const isBackendOccupied = (seat.status === 'occupied' || seat.status === 'blocked');
        
        const isFrontendOccupiedByAnother = Object.keys(selectedSeats).some(
            docNum => selectedSeats[docNum] === seat.id && docNum !== passenger.documentNumber
        );

        if (isBackendOccupied && !isCurrentlySelectedByActivePassenger) {
            alert(`Este asiento no está disponible (${seat.status}).`);
            return false;
        }
        
        if (isFrontendOccupiedByAnother) {
            const holderPassenger = passengers.find(p => p.documentNumber === Object.keys(selectedSeats).find(docNum => selectedSeats[docNum] === seat.id));
            alert(`Este asiento ya ha sido seleccionado por ${holderPassenger?.name || 'otro pasajero'}.`);
            return false;
        }

        const userFareType = tariffInfo?.name?.toLowerCase();
        
        if (seat.allowedFare && seat.allowedFare.toLowerCase() !== userFareType && !isCurrentlySelectedByActivePassenger) {
            alert(`Este asiento no es válido para tu tipo de tarifa (${tariffInfo?.name}).`);
            return false;
        }

        if (
            passenger.specialAssistanceDescription?.toLowerCase().includes('silla de ruedas') &&
            !seat.accessible && !isCurrentlySelectedByActivePassenger
        ) {
            alert(`El asiento ${seat.rowLabel}${seat.columnNumber} no es accesible para ${passenger.name}.`);
            return false;
        }

        return true;
    };

    const handleSeatAssignment = async (seat) => {
        if (!activePassenger || !activePassenger.documentNumber) {
            alert("No hay un pasajero activo o su documento de identidad no es válido para asignar un asiento.");
            return;
        }

        if (!validateSeatSelection(seat, activePassenger)) return;

        const currentSeatIdForActivePassenger = selectedSeats[activePassenger.documentNumber];

        // --- Lógica de Deselección/Liberación (FRONTEND ONLY) ---
        if (currentSeatIdForActivePassenger === seat.id) {
            console.log(`Deselecting seat ${seat.id} for ${activePassenger.name} (${activePassenger.documentNumber})`);
            setSelectedSeats(prev => {
                const newState = { ...prev };
                delete newState[activePassenger.documentNumber];
                return newState;
            });
            return;
        }

        // --- Lógica para liberar un asiento anterior (FRONTEND ONLY) ---
        if (currentSeatIdForActivePassenger) {
            console.log(`Releasing previous seat ${currentSeatIdForActivePassenger} for ${activePassenger.name}`);
            setSelectedSeats(prev => {
                const newState = { ...prev };
                if (newState[activePassenger.documentNumber] === currentSeatIdForActivePassenger) {
                    delete newState[activePassenger.documentNumber];
                }
                return newState;
            });
        }
        
        // --- Lógica para desasignar asiento de *otro* pasajero si lo ocupaba (FRONTEND ONLY) ---
        const previousHolderDocumentNumber = Object.keys(selectedSeats).find(
            docNum => selectedSeats[docNum] === seat.id
        );
        if (previousHolderDocumentNumber && previousHolderDocumentNumber !== activePassenger.documentNumber) {
            const holderPassenger = passengers.find(p => p.documentNumber === previousHolderDocumentNumber);
            console.log(`Unassigning seat ${seat.id} from previous holder ${holderPassenger?.name}`);
            setSelectedSeats(prev => {
                const newState = { ...prev };
                delete newState[previousHolderDocumentNumber];
                return newState;
            });
        }

        // --- Lógica de Asignación de Nuevo Asiento (FRONTEND ONLY) ---
        console.log(`Assigning seat ${seat.id} to ${activePassenger.name} (${activePassenger.documentNumber})`);
        setSelectedSeats(prev => ({
            ...prev,
            [activePassenger.documentNumber]: seat.id
        }));
    };

    // This function will now navigate to the PaymentPage
    const handleProceedToPayment = () => {
        if (Object.keys(selectedSeats).length !== passengers.length) {
            alert('Debes seleccionar un asiento por pasajero.');
            return;
        }
        // Navigate to the new payment page, passing all necessary state
        navigate('/payment', {
            state: {
                bookingDetails,
                flightDetails,
                tariffInfo,
                selectedSeats // IMPORTANT: Pass the selected seats
            }
        });
    };

    const getSeatStyle = (seat) => {
        const passengerDocumentNumberAssignedToThisSeat = Object.keys(selectedSeats).find(
            docNum => selectedSeats[docNum] === seat.id
        );

        if (activePassenger && passengerDocumentNumberAssignedToThisSeat === activePassenger.documentNumber) {
            return 'bg-blue-500 text-white border-2 border-blue-800';
        }
        else if (passengerDocumentNumberAssignedToThisSeat) {
            return 'bg-purple-500 text-white cursor-not-allowed';
        }

        const userFareType = tariffInfo?.name?.toLowerCase();

        switch (seat.status) {
            case 'occupied':
            case 'blocked':
                return 'bg-gray-400 cursor-not-allowed';
            case 'available':
                if (seat.allowedFare && seat.allowedFare.toLowerCase() !== userFareType) {
                    return 'bg-yellow-300 cursor-not-allowed';
                }
                return 'bg-green-500 hover:bg-green-600 text-white';
            default:
                return 'bg-gray-200 cursor-not-allowed';
        }
    };

    if (loadingSeats) {
        return <div className="p-4 text-center text-lg">Cargando mapa de asientos...</div>;
    }

    if (seatMapError) {
        return <div className="p-4 text-center text-red-600">{seatMapError}</div>;
    }

    return (
        <div className="seat-map-container p-6 bg-white shadow-md rounded-md max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-center">Selección de Asientos</h2>

            <div className="bg-gray-100 p-4 rounded mb-6">
                <h3 className="font-semibold mb-3">Pasajeros:</h3>
                {passengers.map((p, index) => (
                    <div
                        key={p.documentNumber}
                        className={`flex justify-between items-center p-2 rounded mb-2 ${
                            activePassenger?.documentNumber === p.documentNumber ? 'bg-indigo-100 border border-indigo-500' : 'bg-gray-50'
                        }`}
                    >
                        <span>
                            {p.name} ({p.age} años)
                            {p.specialAssistanceDescription && (
                                <em className="text-sm text-gray-600 ml-2">
                                    ({p.specialAssistanceDescription})
                                </em>
                            )}
                        </span>
                        <div className="flex items-center">
                            {selectedSeats[p.documentNumber] ? (
                                <span className="text-green-600 font-semibold mr-4">
                                    Asiento: {seats.find(s => s.id === selectedSeats[p.documentNumber])?.rowLabel}
                                    {seats.find(s => s.id === selectedSeats[p.documentNumber])?.columnNumber}
                                </span>
                            ) : (
                                <span className="text-red-500 mr-4">Pendiente</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mb-4 text-center">
                {activePassenger ? (
                    <p className="text-xl font-medium text-indigo-700">
                        Haga clic en el asiento para: <span className="font-bold">{activePassenger.name}</span>
                    </p>
                ) : (
                    <p className="text-lg font-medium text-green-700">
                        Todos los pasajeros tienen un asiento asignado.
                    </p>
                )}
            </div>

            <div className="grid grid-cols-6 gap-2 bg-gray-50 p-4 rounded-lg">
                {seats.map(seat => {
                    const isSelectedByActivePassenger = activePassenger && selectedSeats[activePassenger.documentNumber] === seat.id;
                    const isSelectedByAnotherPassenger = Object.keys(selectedSeats).some(
                        docNum => selectedSeats[docNum] === seat.id && (!activePassenger || docNum !== activePassenger.documentNumber)
                    );
                    const isBackendOccupiedOrBlocked = (seat.status === 'occupied' || seat.status === 'blocked');
                    const userFareType = tariffInfo?.name?.toLowerCase();
                    const isFareRestricted = seat.allowedFare && seat.allowedFare.toLowerCase() !== userFareType;
                    const isActivePassengerWheelchair = activePassenger?.specialAssistanceDescription?.toLowerCase().includes('silla de ruedas');
                    const isSeatAccessible = seat.accessible;

                    return (
                        <button
                            key={seat.id}
                            className={`p-2 rounded font-bold ${getSeatStyle(seat)}`}
                            disabled={
                                !activePassenger ||
                                !activePassenger.documentNumber ||
                                (isBackendOccupiedOrBlocked && !isSelectedByActivePassenger) ||
                                (isSelectedByAnotherPassenger) ||
                                (isFareRestricted && !isSelectedByActivePassenger) ||
                                (isActivePassengerWheelchair && !isSeatAccessible && !isSelectedByActivePassenger)
                            }
                            onClick={() => handleSeatAssignment(seat)}
                        >
                            {seat.rowLabel}{seat.columnNumber}
                        </button>
                    );
                })}
            </div>

            <div className="mt-6 text-center">
                <button
                    className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleProceedToPayment} // Changed to navigate to PaymentPage
                    disabled={Object.keys(selectedSeats).length !== passengers.length}
                >
                    Proceder al Pago
                </button>
            </div>
        </div>
    );
};

export default SeatMap;