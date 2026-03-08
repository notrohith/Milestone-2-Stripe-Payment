async function test() {
    try {
        const res = await fetch("http://localhost:8080/api/rides/search");
        const json = await res.json();
        const rides = json.map(r => ({
            id: r.id,
            source: r.sourceCity,
            dest: r.destinationCity,
            startTime: r.startTime,
            price: r.pricePerSeat,
            seats: r.availableSeats,
            ac: r.hasAc,
            luggage: r.luggageAllowed
        }));
        console.log(JSON.stringify(rides, null, 2));
    } catch (e) {
        console.error(e);
    }
}
test();
