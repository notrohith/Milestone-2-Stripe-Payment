async function test() {
    try {
        const res = await fetch("http://localhost:8080/api/rides/search");
        const txt = await res.text();
        console.log(txt);
    } catch (e) {
        console.error(e);
    }
}
test();
