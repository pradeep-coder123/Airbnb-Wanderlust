
// This ensures the code runs only after the HTML page is fully loaded.

// target: "map" → links the map to an HTML element with id map.

// Layers:

// ol.layer.Tile is a tile layer.

// ol.source.OSM() uses OpenStreetMap tiles as the base map.

// View:

// ol.View defines center and zoom level.

// ol.proj.fromLonLat([lon, lat]) converts coordinates from longitude/latitude to the map projection (Web Mercator, EPSG:3857), which OpenLayers uses internally.


document.addEventListener("DOMContentLoaded", () => {
  if (!listing || !listing.geometry || !listing.geometry.coordinates) return;

  const [lon, lat] = listing.geometry.coordinates;


 
  const map = new ol.Map({
    target: "map",
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM(),
      }),
    ],
    view: new ol.View({
      center: ol.proj.fromLonLat([lon, lat]),
      zoom: 12,
    }),
  });

  const marker = new ol.Feature({
    geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat])),
  });

marker.setStyle(
  new ol.style.Style({
    image: new ol.style.Icon({
      src: "https://openlayers.org/en/v4.6.5/examples/data/icon.png",
      scale: 0.5,       // bigger size
      anchor: [0.5, 1]  // bottom center points to coordinates
    }),
  })
);

  const vectorSource = new ol.source.Vector({ features: [marker] });
  const markerLayer = new ol.layer.Vector({ source: vectorSource });
  map.addLayer(markerLayer);
});




