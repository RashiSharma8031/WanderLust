
  
	mapboxgl.accessToken = map_Token;
    const map = new mapboxgl.Map({
        container: 'map', // container ID
        style:"mapbox://styles/mapbox/streets-v12",
        center: listing.geometry.coordinates , //start latitude,longitute
        zoom: 9 // starting zoom
    });
    console.log(listing.geometry.coordinates);
    let marker = new mapboxgl.Marker({color:"red"})
    .setLngLat(listing.geometry.coordinates)
    .setPopup ( new mapboxgl.Popup({offset: 25 })
    .setHTML(`<h1>${listing.title}</h1> <p>exact location provided after booking</p>`))
    .addTo(map);
