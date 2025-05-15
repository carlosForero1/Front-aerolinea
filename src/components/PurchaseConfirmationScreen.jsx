import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import "./PurchaseConfirmationPage.css";

const PurchaseConfirmationPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { flight: flightFromState, tariff } = location.state || {};
    const flightIdFromState = flightFromState?.id;
    const [flightDetails, setFlightDetails] = useState({ id: '', name: '', departureCity: { name: '' }, arrivalCity: { name: '' }, capacity: 0 });
    const [flightLoading, setFlightLoading] = useState(false);
    const [flightError, setFlightError] = useState(null);
    const [mainPassenger, setMainPassenger] = useState({ id: uuidv4(), name: '', documentType: 'CC', document: '', age: '' });
    const [additionalPassengers, setAdditionalPassengers] = useState([]);
    const [emergencyContact, setEmergencyContact] = useState({ name: '', phone: '' });
    const [selectedExtras, setSelectedExtras] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bookingResult, setBookingResult] = useState(null);
    const [specialAssistanceDescription, setSpecialAssistanceDescription] = useState({});
    const [tariffInfo, setTariffInfo] = useState(tariff || { id: 'T1', name: 'Tarifa Básica', price: 100, currency: 'USD', image: 'https://via.placeholder.com/150', description: 'Incluye equipaje de mano', includes: ['Equipaje de mano'], limits: { peso: '10kg' }, additionals: [] });
    const [capacity, setCapacity] = useState(0);
    const documentTypes = ['CC', 'Tarjeta de Identidad'];
    const [availableExtras, setAvailableExtras] = useState([]);
    const [showEmergencyContact, setShowEmergencyContact] = useState(false);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const API_BASE_URL = 'http://localhost:8080/api/flightsFyId';


    useEffect(() => {
        setShowEmergencyContact(shouldShowEmergencyContact());
    }, [mainPassenger, additionalPassengers]);

    useEffect(() => {
        if (flightIdFromState) {
            setFlightLoading(true);
            setFlightError(null);
            fetch(`${API_BASE_URL}/${flightIdFromState}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    setFlightDetails(data);
                    setCapacity(data.capacity);
                    setFlightLoading(false);
                })
                .catch(error => {
                    console.error("Error fetching flight details:", error);
                    setFlightError("Error al cargar los detalles del vuelo.");
                    setFlightLoading(false);
                });
        }
    }, [flightIdFromState]);

    useEffect(() => {
        if (tariff?.additionals && Array.isArray(tariff.additionals) && tariff.additionals.length > 0) {
            setAvailableExtras(tariff.additionals.map(additional => ({
                id: additional.id,
                name: additional.name,
                price: additional.price,
                type: additional.type,
                description: additional.description,
                available: additional.available !== undefined ? additional.available : true
            })));
        } else {
            setAvailableExtras([]);
        }
        setTariffInfo(tariff);
    }, [tariff]);

    const handleMainPassengerChange = (e) => {
        const { name, value } = e.target;
        if (name === 'age' && value < 0) return;
        if (name === 'document' && isNaN(value)) return;
        setMainPassenger({ ...mainPassenger, [name]: value });
    };

    const shouldShowEmergencyContact = () => {
        const mainPassengerAge = parseInt(mainPassenger.age);
        const hasMinorAdditionalPassenger = additionalPassengers.some(p => parseInt(p.age) < 18);
        const hasElderlyAdditionalPassenger = additionalPassengers.some(p => parseInt(p.age) > 70);
        const totalPassengers = 1 + additionalPassengers.length;

        if (isNaN(mainPassengerAge)) return false;

        return (mainPassengerAge < 18 && totalPassengers === 1) ||
            (mainPassengerAge > 70 && totalPassengers === 1) ||
            hasMinorAdditionalPassenger ||
            hasElderlyAdditionalPassenger;
    };

    const handleToggleEmergencyContact = () => {
        setShowEmergencyContact(!showEmergencyContact);
    };

    const handleAdditionalPassengerChange = (index, e) => {
        const { name, value } = e.target;
        if (name === 'age' && value < 0) return;
        if (name === 'document' && isNaN(value)) return;
        const updatedPassengers = [...additionalPassengers];
        updatedPassengers[index] = { ...updatedPassengers[index], [name]: value };
        setAdditionalPassengers(updatedPassengers);
    };

    const addAdditionalPassenger = () => {
        const totalPassengers = 1 + additionalPassengers.length;
        if (totalPassengers < capacity && additionalPassengers.length < 5) {
            setAdditionalPassengers([...additionalPassengers, { id: uuidv4(), name: '', documentType: 'CC', document: '', age: '' }]);
        } else if (totalPassengers >= capacity) {
            alert(`Lo sentimos, este vuelo ha alcanzado su capacidad máxima de ${capacity} pasajeros.`);
        } else {
            alert('No se pueden agregar más de 5 pasajeros adicionales.');
        }
    };

    const removeAdditionalPassenger = (idToRemove) => {
        const updatedPassengers = additionalPassengers.filter(passenger => passenger.id !== idToRemove);
        setAdditionalPassengers(updatedPassengers);
    };

    const handleEmergencyContactChange = (e) => {
        const { name, value } = e.target;
        setEmergencyContact({ ...emergencyContact, [name]: value });
    };

    const handleExtraSelection = (extraId) => {
        const extra = availableExtras.find(ex => ex.id === extraId);
        if (!extra) return;
        const isAlreadySelected = selectedExtras.includes(extraId);
        if (isAlreadySelected) {
            setSelectedExtras(selectedExtras.filter(id => id !== extraId));
        } else {
            setSelectedExtras([...selectedExtras, extraId]);
        }
    };

    const handleSpecialAssistanceChange = (index, value) => {
        setSpecialAssistanceDescription({ ...specialAssistanceDescription, [index]: value });
    };

    const handleKeyDown = (e) => {
        if (e.key >= '0' && e.key <= '9') {
            e.preventDefault();
        }
    };


    const isAdultPresent = () => {
        const mainPassengerAge = parseInt(mainPassenger.age);
        if (!isNaN(mainPassengerAge) && mainPassengerAge >= 18) {
            return true;
        }
        return additionalPassengers.some(p => {
            const age = parseInt(p.age);
            return !isNaN(age) && age >= 18;
        });
    };

    const validate = () => {
        const newErrors = {};
        if (!mainPassenger.name.trim()) newErrors.mainPassengerName = 'El nombre es requerido.';
        if (!mainPassenger.document.trim()) newErrors.mainPassengerDocument = 'El documento es requerido.';
        if (!mainPassenger.age.trim() || isNaN(mainPassenger.age) || parseInt(mainPassenger.age) <= 0) newErrors.mainPassengerAge = 'La edad debe ser un número positivo.';
        additionalPassengers.forEach((passenger, index) => {
            if (!passenger.name.trim()) newErrors[`additionalPassengerName_${passenger.id}`] = 'El nombre es requerido.';
            if (!passenger.document.trim()) newErrors[`additionalPassengerDocument_${passenger.id}`] = 'El documento es requerido.';
            if (!passenger.age.trim() || isNaN(passenger.age) || parseInt(passenger.age) <= 0) newErrors[`additionalPassengerAge_${passenger.id}`] = 'La edad debe ser un número positivo.';
        });

        if (showEmergencyContact && shouldShowEmergencyContact()) {
            if (!emergencyContact.name.trim()) newErrors.emergencyContactName = 'El nombre del contacto de emergencia es requerido.';
            if (!emergencyContact.phone.trim()) newErrors.emergencyContactPhone = 'El teléfono del contacto de emergencia es requerido.';
        }

        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);
        setBookingResult(null);

        const passengersData = [
            { ...mainPassenger, specialAssistance: specialAssistanceDescription['main'] || null },
            ...additionalPassengers.map(p => ({ ...p, specialAssistance: specialAssistanceDescription[p.id] || null }))
        ];

        const bookingData = {
            flightId: flightDetails.id,
            tariffId: tariffInfo.id,
            passengers: passengersData,
            emergencyContact: showEmergencyContact && shouldShowEmergencyContact() ? emergencyContact : null,
            additionalServices: selectedExtras
        };

        setTimeout(() => {
            setIsSubmitting(false);
            const isBookingSuccessful = Math.random() > 0.5;
            if (isBookingSuccessful) {
                setBookingResult({ success: true, message: '¡Reserva realizada con éxito!' });
                setShowConfirmationModal(true);
                setMainPassenger({ id: uuidv4(), name: '', documentType: 'CC', document: '', age: '' });
                setAdditionalPassengers([]);
                setEmergencyContact({ name: '', phone: '' });
                setSelectedExtras([]);
                setSpecialAssistanceDescription({});
            } else {
                setBookingResult({ success: true, message: '¡Reserva realizada con éxito!' });
                setShowConfirmationModal(true);
            }
        }, 1500);

    };

    const handleGoToHome = () => {
        navigate('/');
    };

    const calculateTotalPrice = () => {
        const numPassengers = 1 + additionalPassengers.length;
        const extrasPrice = selectedExtras.reduce((sum, extraId) => {
            const extra = availableExtras.find(ex => ex.id === extraId);
            return sum + (extra ? extra.price : 0);
        }, 0);
        return (tariffInfo?.price * numPassengers) + extrasPrice;
    };

    const totalPrice = calculateTotalPrice();

    const availableSelectableExtras = availableExtras.filter(extra => extra.available);
    const includedExtras = availableExtras.filter(extra => !extra.available);

    return (
        <div className="container mt-4">
            <h2>Confirmación de Reserva</h2>
            {flightLoading ? (
                <div className="alert alert-info">Cargando detalles del vuelo...</div>
            ) : flightError ? (
                <div className="alert alert-danger">{flightError}</div>
            ) : (
                <>
                    <p>Vuelo seleccionado: {flightDetails?.name} ({flightDetails?.departureCity?.name} - {flightDetails?.arrivalCity?.name})</p>
                    <p>Tarifa por pasajero: {tariffInfo?.name} - {tariffInfo?.price} {tariffInfo?.currency}</p>

                    <div className="mb-3">
                        <h3>Servicios Incluidos</h3>
                        {includedExtras.map(extra => (
                            <div key={extra.id}>
                                <p>{extra.name} {extra.description && <small className="text-muted">({extra.description})</small>}</p>
                            </div>
                        ))}
                    </div>
                    {tariffInfo?.image && <img src={tariffInfo.image} alt={tariffInfo?.name} className="img-fluid mb-2" />}
                    {tariffInfo?.description && <p className="text-muted mb-2">{tariffInfo.description}</p>}
                    {tariffInfo?.includes && Array.isArray(tariffInfo.includes) && tariffInfo.includes.length > 0 && (
                        <p className="text-success mb-2">Incluye: {tariffInfo.includes.join(', ')}
                            {tariffInfo?.limits && Object.keys(tariffInfo.limits).length > 0 && (
                                <p className="text-info mb-2">Límites: {Object.entries(tariffInfo.limits).map(([key, value]) => `${key}: ${value}`).join(', ')}</p>
                            )}
                        </p>
                    )}

                    <form onSubmit={handleSubmit}>
                        <h3>Datos del Pasajero Principal</h3>
                        <div className="mb-3">
                            <label htmlFor="mainPassengerName" className="form-label">Nombre Completo:</label>
                            <input
                                type="text"
                                className="form-control"
                                id="mainPassengerName"
                                name="name"
                                value={mainPassenger.name}
                                onChange={handleMainPassengerChange}
                                onKeyDown={handleKeyDown}
                                required
                            />

                            {errors.mainPassengerName && (
                                <div className="text-danger">{errors.mainPassengerName}</div>
                            )}
                        </div>

                        <div className="mb-3">
                            <label htmlFor="mainPassengerDocumentType" className="form-label">Tipo de Documento:</label>
                            <select className="form-select" id="mainPassengerDocumentType" name="documentType" value={mainPassenger.documentType} onChange={handleMainPassengerChange}>
                                {documentTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="mainPassengerDocument" className="form-label">Número de Documento:</label>
                            <input type="text" className="form-control" id="mainPassengerDocument" name="document" value={mainPassenger.document} onChange={handleMainPassengerChange} required />
                            {errors.mainPassengerDocument && <div className="text-danger">{errors.mainPassengerDocument}</div>}
                        </div>
                        <div className="mb-3">
                            <label htmlFor="mainPassengerAge" className="form-label">Edad:</label>
                            <input type="number" className="form-control" id="mainPassengerAge" name="age" value={mainPassenger.age} onChange={handleMainPassengerChange} required />
                            {errors.mainPassengerAge && <div className="text-danger">{errors.mainPassengerAge}</div>}
                        </div>
                        {(parseInt(mainPassenger.age) < 18 || parseInt(mainPassenger.age) > 70) && (
                            <div className="mb-3">
                                <label htmlFor="specialAssistanceMain">¿Necesita asistencia especial?</label>
                                <select
                                    className="form-select"
                                    id="specialAssistanceMain"
                                    value={specialAssistanceDescription['main'] || ''}
                                    onChange={(e) => setSpecialAssistanceDescription({ ...specialAssistanceDescription, 'main': e.target.value })}
                                >
                                    <option value="">Seleccione una descripción (Opcional)</option>
                                    <option value="Silla de ruedas">Necesito silla de ruedas</option>
                                    <option value="Asistencia para abordar">Necesito ayuda para abordar</option>
                                    <option value="Asistencia con equipaje">Necesito ayuda con el equipaje</option>
                                    <option value="Otra">Otra necesidad</option>
                                </select>
                                {parseInt(mainPassenger.age) < 18 && !isAdultPresent() && <div className="form-text text-danger">La asistencia especial es requerida para menores sin acompañante adulto.</div>}
                                {parseInt(mainPassenger.age) > 70 && <div className="form-text text-info">Puede requerir asistencia especial.</div>}
                            </div>
                        )}

                        <h3>Pasajeros Adicionales</h3>
                        {additionalPassengers.map((passenger, index) => (
                            <div key={passenger.id} className="mb-3 border p-3 position-relative">
                                <h4>Pasajero {index + 1}</h4>
                                <button
                                    type="button"
                                    className="btn-close position-absolute top-0 end-0 m-2"
                                    onClick={() => removeAdditionalPassenger(passenger.id)}
                                    aria-label="Eliminar pasajero"
                                ></button>
                                <div className="mb-3">
                                    <label htmlFor={`additionalPassengerName_${passenger.id}`} className="form-label">Nombre Completo:</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id={`additionalPassengerName_${passenger.id}`}
                                        name="name"
                                        value={passenger.name}
                                        onChange={(e) => handleAdditionalPassengerChange(index, e)}
                                        required />
                                    {errors[`additionalPassengerName_${passenger.id}`] && <div className="text-danger">{errors[`additionalPassengerName_${passenger.id}`]}</div>}
                                </div>
                                <div className="mb-3">
                                    <label htmlFor={`additionalPassengerDocumentType_${passenger.id}`} className="form-label">Tipo de Documento:</label>
                                    <select
                                        className="form-select"
                                        id={`additionalPassengerDocumentType_${passenger.id}`}
                                        name="documentType"
                                        value={passenger.documentType}
                                        onChange={(e) => handleAdditionalPassengerChange(index, e)}
                                    >
                                        {documentTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor={`additionalPassengerDocument_${passenger.id}`} className="form-label">Número de Documento:</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id={`additionalPassengerDocument_${passenger.id}`}
                                        name="document"
                                        value={passenger.document}
                                        onChange={(e) => handleAdditionalPassengerChange(index, e)}
                                        required
                                    />
                                    {errors[`additionalPassengerDocument_${passenger.id}`] && <div className="text-danger">{errors[`additionalPassengerDocument_${passenger.id}`]}</div>}
                                </div>
                                <div className="mb-3">
                                    <label htmlFor={`additionalPassengerAge_${passenger.id}`} className="form-label">Edad:</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        id={`additionalPassengerAge_${passenger.id}`}
                                        name="age"
                                        value={passenger.age}
                                        onChange={(e) => handleAdditionalPassengerChange(
                                            index,
                                            e
                                        )}
                                        required
                                    />
                                    {errors[`additionalPassengerAge_${passenger.id}`] && <div className="text-danger">{errors[`additionalPassengerAge_${passenger.id}`]}</div>}
                                </div>
                                {(parseInt(passenger.age) < 18 || parseInt(passenger.age) > 70) && (
                                    <div className="mb-3">
                                        <label htmlFor={`specialAssistance_${passenger.id}`}>¿Necesita asistencia especial?</label>
                                        <select
                                            className="form-select"
                                            id={`specialAssistance_${passenger.id}`}
                                            value={specialAssistanceDescription[passenger.id] || ''}
                                            onChange={(e) => setSpecialAssistanceDescription({ ...specialAssistanceDescription, [passenger.id]: e.target.value })}
                                        >
                                            <option value="">Seleccione una descripción (Opcional)</option>
                                            <option value="Silla de ruedas">Necesito silla de ruedas</option>
                                            <option value="Asistencia para abordar">Necesito ayuda para abordar</option>
                                            <option value="Asistencia con equipaje">Necesito ayuda con el equipaje</option>
                                            <option value="Otra">Otra necesidad</option>
                                        </select>
                                        {parseInt(passenger.age) < 18 && !isAdultPresent() && <div className="form-text text-danger">La asistencia especial es requerida para menores sin acompañante adulto.</div>}
                                        {parseInt(passenger.age) > 70 && <div className="form-text text-info">Puede requerir asistencia especial.</div>}
                                    </div>
                                )}
                            </div>
                        ))}
                        {1 + additionalPassengers.length < capacity && additionalPassengers.length < 5 && (
                            <button type="button" className="btn btn-outline-primary mb-3" onClick={addAdditionalPassenger}>
                                Agregar Pasajero
                            </button>
                        )}
                        {1 + additionalPassengers.length >= capacity && (
                            <div className="alert alert-warning">Se ha alcanzado la capacidad máxima de pasajeros para este vuelo.</div>
                        )}
                        {additionalPassengers.length >= 5 && 1 + additionalPassengers.length < capacity && (
                            <div className="alert alert-info">Se permite un máximo de 5 pasajeros adicionales.</div>
                        )}

                        {showEmergencyContact && shouldShowEmergencyContact() && (
                            <div className="border p-3 mb-3">
                                <h3>Contacto de Emergencia</h3>
                                <div className="mb-3">
                                    <label htmlFor="emergencyContactName" className="form-label">Nombre Completo:</label>
                                    <input type="text" className="form-control" id="emergencyContactName" name="name" value={emergencyContact.name} onChange={handleEmergencyContactChange} required />
                                    {errors.emergencyContactName && <div className="text-danger">{errors.emergencyContactName}</div>}
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="emergencyContactPhone" className="form-label">Número de Teléfono:</label>
                                    <input type="tel" className="form-control" id="emergencyContactPhone" name="phone" value={emergencyContact.phone} onChange={handleEmergencyContactChange} required />
                                    {errors.emergencyContactPhone && <div className="text-danger">{errors.emergencyContactPhone}</div>}
                                </div>
                            </div>
                        )}

                        {(parseInt(mainPassenger.age) < 18 || parseInt(mainPassenger.age) > 70 || additionalPassengers.some(p => parseInt(p.age) < 18) || additionalPassengers.some(p => parseInt(p.age) > 70)) && !showEmergencyContact && (
                            <div className="alert alert-warning">
                                Se recomienda proporcionar un contacto de emergencia debido a la edad de los pasajeros.
                                <button type="button" className="btn btn-sm btn-link" onClick={handleToggleEmergencyContact}>
                                    {showEmergencyContact ? 'Ocultar contacto de emergencia' : 'Agregar contacto de emergencia'}
                                </button>
                            </div>
                        )}

                        <h3>Servicios Adicionales (Opcional)</h3>
                        <div className="mb-3">
                            {availableExtras.length > 0 ? (
                                availableExtras.map(extra => (
                                    <div key={extra.id} className="form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id={`extra-${extra.id}`}
                                            value={extra.id}
                                            checked={selectedExtras.includes(extra.id)}
                                            onChange={() => handleExtraSelection(extra.id)}
                                            disabled={!extra.available}
                                        />
                                        <label className="form-check-label" htmlFor={`extra-${extra.id}`}>
                                            {extra.name} - {extra.price} {tariffInfo?.currency} {extra.available ? '' : '(No disponible)'}
                                            {extra.description && <small className="text-muted"> ({extra.description})</small>}
                                        </label>
                                    </div>
                                ))
                            ) : (
                                <p>No hay servicios adicionales disponibles para esta tarifa.</p>
                            )}
                        </div>

                        <h4>Total a Pagar: {totalPrice} {tariffInfo?.currency}</h4>

                        {bookingResult && (
                            <div className={`alert ${bookingResult.success ? 'alert-success' : 'alert-danger'}`}>
                                {bookingResult.message}
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Realizando Reserva...' : 'Confirmar y Reservar'}
                        </button>
                        <button type="button" className="btn btn-secondary ms-2" onClick={handleGoToHome}>
                            Volver a la Búsqueda
                        </button>
                    </form>

                    {showConfirmationModal && bookingResult?.success && (
                        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
                            <div className="modal-dialog modal-dialog-centered">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">Reserva Exitosa</h5>
                                        <button type="button" className="btn-close" onClick={() => setShowConfirmationModal(false)} aria-label="Close"></button>
                                    </div>
                                    <div className="modal-body">
                                        <p>{bookingResult.message} ¡Gracias por tu reserva!</p>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-primary" onClick={handleGoToHome}>
                                            Ir a la Página Principal
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {showConfirmationModal && !bookingResult?.success && (
                        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
                            <div className="modal-dialog modal-dialog-centered">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">Error en la Reserva</h5>
                                        <button type="button" className="btn-close" onClick={() => setShowConfirmationModal(false)} aria-label="Close"></button>
                                    </div>
                                    <div className="modal-body">
                                        <p>{bookingResult.message}</p>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowConfirmationModal(false)}>
                                            Cerrar
                                        </button>
                                        <button type="button" className="btn btn-primary" onClick={handleGoToHome}>
                                            Volver a la Búsqueda
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default PurchaseConfirmationPage;