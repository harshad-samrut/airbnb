let token = mapToken;
mapboxgl.accessToken = token;
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v12", // Added style
  center: villa.geometry.coordinates,
  zoom: 9,
});

new mapboxgl.Marker()
  .setLngLat(villa.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup().setHTML(
      `<h4>${villa.title}</h4><p>Exact location will be provided after booking</p>`,
    ),
  ) // add popup
  .addTo(map);
