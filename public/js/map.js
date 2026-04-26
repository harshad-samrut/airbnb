let token = mapToken;
mapboxgl.accessToken = token;
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v12", // Added style
  center: [72.877426, 19.07609],
  zoom: 9,
});
