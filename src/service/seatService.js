export async function getSeatMap(flightId) {
  const res = await fetch(`/api/seats/${flightId}`);
  console.log(res)
  return await res.json();
}

export async function selectSeat(data) {
  return await fetch("/api/seats/select", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
}
