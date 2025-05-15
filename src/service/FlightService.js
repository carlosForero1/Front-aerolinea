const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'; 


export const allFlights = () => {
  return fetch(
    `${API_BASE_URL}/api?`).then((response) => response.json());
};

export const searchFlights = (originCityId, destinationCityId, date) => {
  return fetch(
    `${API_BASE_URL}/api/flights?` +
      new URLSearchParams({
        originCityId,
        destinationCityId,
        date
      })
  ).then((response) => response.json());
};

