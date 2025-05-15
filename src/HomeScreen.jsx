import React, { useState, useEffect } from 'react';
import FlightCard from './components/FlightCard';
import FlightDetailsModal from './components/FlightDetailsModal';
import { searchFlights } from './service/FlightService';
import { getOriginCities, getDestinationCitiesByOriginCityId } from './service/SharedServices';
import { useNavigate } from 'react-router-dom';


function HomeScreen() {
    const navigate = useNavigate();
    const [originCityId, setOriginCityId] = useState('');
    const [destinationCityId, setDestinationCityId] = useState('');
    const [departureDate, setDepartureDate] = useState('');
    const [flights, setFlights] = useState([]);
    console.log('detils: ', flights);
    const [selectedFlight, setSelectedFlight] = useState(null);
    const [originCities, setOriginCities] = useState([]);
    const [destinationCities, setDestinationCities] = useState([]);
    const [loadingFlights, setLoadingFlights] = useState(false);
    const [errorFlights, setErrorFlights] = useState(null);
    const [loadingCities, setLoadingCities] = useState(false);
    const [errorCities, setErrorCities] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchOriginCities = async () => {
            setLoadingCities(true);
            try {
                const data = await getOriginCities();
                setOriginCities(data || []);
            } catch {

                setErrorCities('Error al cargar ciudades de origen.');
                setOriginCities([]);
            } finally {
                setLoadingCities(false);
            }
        };
        fetchOriginCities();
    }, []);

    useEffect(() => {
        const fetchDestinationCities = async () => {
            if (originCityId) {
                setLoadingCities(true);
                try {
                    const data = await getDestinationCitiesByOriginCityId(originCityId);
                    setDestinationCities(data || []);
                } catch {
                    setErrorCities('Error al cargar ciudades de destino.');
                    setDestinationCities([]);
                } finally {
                    setLoadingCities(false);
                }
            } else {
                setDestinationCities([]);
            }
        };
        fetchDestinationCities();
    }, [originCityId]);

    const handleSearch = async () => {
        setLoadingFlights(true);
        try {
            const data = await searchFlights(originCityId, destinationCityId, departureDate);
            setFlights(data || []);
        } catch {
            setErrorFlights('Hubo un error al buscar los vuelos.');
            setFlights([]);
        } finally {
            setLoadingFlights(false);
        }
    };

    const handleSelectFlight = (flightInfo) => {
        setSelectedFlight(flightInfo.flight);
        console.log(flightInfo);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedFlight(null);
    };

    const handleSelectTariff = (flight, tariff) => {
        navigate('/purchase-confirmation', {
            state: { flight: flight, tariff },
        });
        setIsModalOpen(false);
    };


    return (
        <div className="bg-light min-vh-100 pb-5">


            {/* Búsqueda */}
            <div className="container">
                <div className="card p-4 shadow-lg border-0 bg-white rounded-4">
                    <h2 className="mb-4 text-primary text-center">Busca tu próximo vuelo</h2>

                    {loadingCities && <div className="alert alert-info">Cargando ciudades...</div>}
                    {errorCities && <div className="alert alert-danger">{errorCities}</div>}

                    <div className="row">
                        <div className="col-md-4 mb-3">
                            <label htmlFor="originCity" className="form-label">Origen</label>
                            <select
                                id="originCity"
                                className="form-select"
                                value={originCityId}
                                onChange={(e) => setOriginCityId(e.target.value)}
                            >
                                <option value="">Selecciona origen</option>
                                {originCities.map((city) => (
                                    <option key={city.id} value={city.id}>{city.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-4 mb-3">
                            <label htmlFor="destinationCity" className="form-label">Destino</label>
                            <select
                                id="destinationCity"
                                className="form-select"
                                value={destinationCityId}
                                onChange={(e) => setDestinationCityId(e.target.value)}
                                disabled={!originCityId}
                            >
                                <option value="">Selecciona destino</option>
                                {destinationCities.map((city) => (
                                    <option key={city.id} value={city.id}>{city.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-4 mb-3">
                            <label htmlFor="departureDate" className="form-label">Fecha de salida</label>
                            <input
                                type="date"
                                id="departureDate"
                                className="form-control"
                                value={departureDate}
                                onChange={(e) => setDepartureDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="text-end">
                        <button
                            className="btn btn-primary px-4"
                            onClick={handleSearch}
                            disabled={!originCityId || !destinationCityId}
                        >
                            Buscar Vuelos ✈️
                        </button>
                    </div>
                </div>

                {/* Resultados */}
                <h3 className="mt-5 mb-3 text-dark">Vuelos </h3>
                {loadingFlights && <div className="alert alert-info">Cargando vuelos...</div>}
                {errorFlights && <div className="alert alert-danger">{errorFlights}</div>}
                {flights.length === 0 && !loadingFlights && !errorFlights && (
                    <div className="alert alert-warning">No se encontraron vuelos.</div>
                )}

                <div className="row row-cols-1 row-cols-md-2 g-4 mt-3">
                    {flights.map((flightInfo) => (
                        <FlightCard
                            key={flightInfo.id}
                            flight={flightInfo}
                            onSelectFlight={() => handleSelectFlight({ flight: flightInfo })}
                        />
                    ))}
                </div>

                {selectedFlight && (
                    <FlightDetailsModal
                        isOpen={isModalOpen}
                        onClose={handleCloseModal}
                        flight={selectedFlight}
                        onSelectTariff={handleSelectTariff}
                    />
                )}
            </div>
        </div>
    );
}

export default HomeScreen;