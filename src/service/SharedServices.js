const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'; 

export const getOriginCities = () => {
  return fetch(`${API_BASE_URL}/api/cities/origin-cities`).then((response) => response.json());
};

export const getDestinationCitiesByOriginCityId = (originCityId) => {
  return fetch(`${API_BASE_URL}/api/cities/destination-cities/${originCityId}`).then((response) =>
    response.json()
  );
};

export const getDocumentTypes = () => { 
  return fetch(`${API_BASE_URL}/api/document-type`).then((response) => response.json());
};

export const getTariffsByFlightId = async (flightId) => {
  return fetch(`${API_BASE_URL}/api/tariffs/flight/${flightId}`).then((response) => response.json());
};