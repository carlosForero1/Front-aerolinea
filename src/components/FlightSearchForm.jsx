import React, { useState, useEffect } from 'react';
import { getOriginCities, getDestinationCitiesByOriginCityId } from '../service/SharedServices';
import { searchFlights } from '../service/FlightService';
import FlightCard from '../components/FlightCard';
import FlightDetailsModal from '../components/FlightDetailsModal';
import { useNavigate } from 'react-router-dom';

function FlightSearchForm() {
    const navigate = useNavigate();
    const [originCityId, setOriginCityId] = useState('');
    const [destinationCityId, setDestinationCityId] = useState('');
    const [departureDate, setDepartureDate] = useState('');
    const [flights, setFlights] = useState([]);
    const [selectedFlight, setSelectedFlight] = useState(null);
    const [originCities, setOriginCities] = useState([]);
    const [destinationCities, setDestinationCities] = useState([]);
    const [loadingFlights, setLoadingFlights] = useState(false);
    const [errorFlights, setErrorFlights] = useState(null);
    const [loadingCities, setLoadingCities] = useState(false);
    const [errorCities, setErrorCities]= useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchOriginCities = async () => {
            setLoadingCities(true);
            setErrorCities(null);
            try {
                const data = await getOriginCities();
                setOriginCities(data || []);
            } catch (err) {
                console.error('Error fetching origin cities:', err);
                setErrorCities('Hubo un error al cargar las ciudades de origen.');
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
                setErrorCities(null);
                try {
                    const data = await getDestinationCitiesByOriginCityId(originCityId);
                    setDestinationCities(data || []);
                } catch (err) {
                    console.error('Error fetching destination cities:', err);
                    setErrorCities('Hubo un error al cargar las ciudades de destino.');
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
        setErrorFlights(null);
        try {
            console.log(departureDate)
            const data = await searchFlights(originCityId, destinationCityId, departureDate);
            console.log(destinationCityId,"-",originCityId)
        console.log(data);
            setFlights(data || []);
        } catch (err) {
            console.error('Error fetching flights:', err);
            setErrorFlights('Hubo un error al buscar los vuelos.');
            setFlights([]);
        } finally {
            setLoadingFlights(false);
        }
    };

    const handleOriginChange = (event) => {
        setOriginCityId(event.target.value);
        setDestinationCityId(''); 
    };

    const handleDestinationChange = (event) => {
        setDestinationCityId(event.target.value);
    };

    const handleDateChange = (event) => {
        setDepartureDate(event.target.value);
    };

    const handleSelectFlight = (flightInfo) => {
        if (flightInfo && !flightInfo.isFull) {
            setSelectedFlight(flightInfo); 
            setIsModalOpen(true);
        } else if (flightInfo && flightInfo.isFull) {
            alert(`El vuelo ${flightInfo.name} está lleno. Por favor, selecciona otro vuelo.`);
        } else {
            console.warn('Información de vuelo inválida:', flightInfo);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedFlight(null);
    };

    const handleSelectTariff = (flight, tariff) => {
        navigate('/purchase-confirmation', { state: { flight: { id: flight.id }, tariff: tariff } });
        setIsModalOpen(false);
    };

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Buscar Vuelos</h1>
            {loadingCities && <div className="alert alert-info">Cargando ciudades...</div>}
            {errorCities && <div className="alert alert-danger">{errorCities}</div>}

            <div className="row mb-3">
                <div className="col-md-4">
                    <label htmlFor="originCity" className="form-label">Origen:</label>
                    <select id="originCity" className="form-select" value={originCityId} onChange={handleOriginChange}>
                        <option value="">Seleccionar origen</option>
                        {originCities.map((city) => (
                            <option key={city.id} value={city.id}>
                                {city.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="col-md-4">
                    <label htmlFor="destinationCity" className="form-label">Destino:</label>
                    <select
                        id="destinationCity"
                        className="form-select"
                        value={destinationCityId}
                        onChange={handleDestinationChange}
                        disabled={!originCityId}
                    >
                        <option value="">Seleccionar destino</option>
                        {destinationCities.map((city) => (
                            <option key={city.id} value={city.id}>
                                {city.name}
                            </option>
                        ))}
                    </select>
                    {!originCityId && <div className="form-text text-muted">Selecciona un origen primero.</div>}
                </div>

                <div className="col-md-4">
                    <label htmlFor="departureDate" className="form-label">Fecha de Salida:</label>
                    <input type="date" id="departureDate" className="form-control" value={departureDate} onChange={handleDateChange} />
                </div>
            </div>

            <button className="btn btn-primary" onClick={handleSearch} disabled={!originCityId || !destinationCityId }>
                Buscar Vuelos
            </button>
            {!originCityId || !destinationCityId || !departureDate ? (
                <div className="form-text text-muted">Selecciona origen, destino y fecha para buscar.</div>
            ) : null}

            <h2 className="mt-4">Vuelos Disponibles</h2>
            {loadingFlights && <div className="alert alert-info">Cargando vuelos...</div>}
            {errorFlights && <div className="alert alert-danger">{errorFlights}</div>}
            {flights.length === 0 && !loadingFlights && !errorFlights && (
                <div className="alert alert-warning">No se encontraron vuelos con los criterios seleccionados.</div>
            )}
            <div className="row row-cols-1 row-cols-md-2 g-4">
                {flights.map((flightInfo) => {
                    // Accedemos a las propiedades directamente de flightInfo
                    if (flightInfo && flightInfo.id) {
                        return (
                            <div className="col" key={flightInfo.id}>
                                <FlightCard
                                    flight={flightInfo}
                                    onSelectFlight={() => handleSelectFlight(flightInfo)}
                                    isFull={flightInfo.capacity <= 0} // Asumiendo que capacity <= 0 significa lleno
                                />
                                {flightInfo.capacity <= 0 && <span className="badge bg-danger mt-1">Lleno</span>}
                            </div>
                        );
                    } else {
                        console.warn('Elemento de vuelo inválido:', flightInfo);
                        return null;
                    }
                })}
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
    );
}

export default FlightSearchForm;