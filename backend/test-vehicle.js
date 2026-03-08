async function test() {
    try {
        const res = await fetch("http://localhost:8080/api/rides/search");
        const json = await res.json();
        if (json.length > 0) {
            console.log("Vehicle object:", JSON.stringify(json[0].driver.vehicle, null, 2));
        } else {
            console.log("No rides found");
        }
    } catch (e) {
        console.error(e);
    }
}
test();
