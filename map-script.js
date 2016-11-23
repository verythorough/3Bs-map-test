// General constants for the map
var sublayerNames = ['bees', 'birds', 'beans'];
var initialSublayerIndex = 0;
var countyLatLng = {
  northLat: 37.71,
  southLat: 37.07,
  westLng: -122.65,
  eastLng: -122.09,
};
var countyBounds = L.latLngBounds(
  [countyLatLng.southLat, countyLatLng.westLng],
  [countyLatLng.northLat, countyLatLng.eastLng]
);
L.mapbox.accessToken = 'pk.eyJ1IjoidmVyeXRob3JvdWdoIiwiYSI6ImNpbGlkamE5dDMwOTN2cm0wOHo0eDMyaXIifQ.xZRwd2Uqsrz04wRL8F1NFw';


// Create radio buttons for selecting data layers
var CustomSublayerSelector = L.Control.extend({
  options: {
    position: 'topright',
  },

  onAdd: function makeLayerSelector() {
    var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control custom-control');
    container.id = 'custom-sublayer-selector';

    var heading = document.createElement('h3');
    heading.textContent = 'View map for:';
    container.appendChild(heading);

    for (var i = 0, j = sublayerNames.length; i < j; i++) {
      var currentSublayer = sublayerNames[i];
      var label = document.createElement('label');
      var button = document.createElement('input');
      var labelText = document.createElement('span');

      label.setAttribute('for', currentSublayer + '-btn');
      label.className = 'switch';

      button.id = currentSublayer + '-btn';
      button.name = 'layer-to-enable';
      button.value = i;
      button.setAttribute('type', 'radio');
      if (i === initialSublayerIndex) { button.checked = true; }
      label.appendChild(button);

      labelText.className = 'label-text';
      labelText.textContent = currentSublayer;
      label.appendChild(labelText);

      container.appendChild(label);
    }

    return container;
  },
});


// Create button to detect and zoom to user's location
var CustomLocationDetectionButton = L.Control.extend({
  options: {
    position: 'topleft',
  },

  onAdd: function makeLocationDetectionButton(map) {
    var button = L.DomUtil.create('button', 'leaflet-bar leaflet-control custom-control');
    var label = L.DomUtil.create('span', 'assistive-text', button);

    button.id = 'custom-location-detection-button';
    button.title = 'Find my location';
    label.textContent = 'Find my location';

    button.onclick = function locateUser() {
      map.locate();
    };

    return button;
  },
});


// Create button to open map in new tab
var CustomNewTabViewButton = L.Control.extend({
  options: {
    position: 'topleft',
  },

  onAdd: function makeNewTabViewButton() {
    var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
    var link = L.DomUtil.create('a', '', container);
    var label = L.DomUtil.create('span', 'assistive-text', container);

    link.id = 'custom-tab-view-button';
    link.setAttribute('href', location.href);
    link.setAttribute('target', '_blank');
    link.title = 'Open map in new tab';
    label.textContent = 'Open map in new tab';

    return container;
  },
});


// Utility function for showing a map layer.
function showSublayer(layer, e) {
  layer.infowindow.set('visibility', false);
  layer.getSubLayer(0).hide();
  layer.getSubLayer(1).hide();
  layer.getSubLayer(2).hide();
  layer.getSubLayer(e).show();
}

// Initialize layers
function addLayers(map) {
  // Initialize layer variables
  var mapboxBaseAddress = 'https://api.mapbox.com/styles/v1/verythorough/';
  var mapboxBaseLayer = L.tileLayer(mapboxBaseAddress + 'civ2llev400012impeakxywiw/tiles/256/{z}/{x}/{y}?access_token=' + L.mapbox.accessToken, {
    attribution: 'Made by <a href="http://opensmc.org" target="_blank">OpenSMC</a> | ' +
    '&copy;<a href="http://mapbox.com/about/maps" target="_blank">Mapbox</a>, ' +
    '&copy;<a href="https://openstreetmap.org/about/" target="_blank">OpenStreetMap</a>',
  });
  var mapboxLabelLayer = L.tileLayer(mapboxBaseAddress + 'civ7g9zac002c2ipbk6lji2wx/tiles/256/{z}/{x}/{y}?access_token=' + L.mapbox.accessToken);
  var cartoDataLayerUrl = 'https://opensmc.carto.com/api/v2/viz/71e3c5bc-9014-11e6-9b53-0e233c30368f/viz.json';


  // Add layers to map
  map.addLayer(mapboxBaseLayer);
  map.addLayer(mapboxLabelLayer);
  mapboxLabelLayer.bringToFront();
  cartodb.createLayer(map, cartoDataLayerUrl)
    .addTo(map)
    .on('done', function initSublayerSelection(layer) {
      showSublayer(layer, initialSublayerIndex);
      $('#custom-sublayer-selector').on('change', 'input', function sublayerSelectorEventListener(e) {
        var sublayerSelector = e.currentTarget;
        var sublayerToOpen = $(sublayerSelector).val();
        showSublayer(layer, sublayerToOpen);
      });
    }).on('error', function dataLayerError(err) {
      console.log('error:' + err);
    });
}

// Initialize controls
function addControls(map) {
  map.addControl(new CustomSublayerSelector());
  map.addControl(L.mapbox.geocoderControl('mapbox.places', { position: 'topleft', autocomplete: true }));
  // Show the location detection button only if the user agent supports geolocation
  if (navigator.geolocation && location.protocol == 'https:') { 
    map.addControl(new CustomLocationDetectionButton()); 
  }
  // Show the new tab button only if the map is embedded in another page.
  if (window.location !== window.parent.location) { 
    map.addControl(new CustomNewTabViewButton()); 
  }

  // Zoom to user location, if location is in county bounding box
  map.on('locationfound', function gotoLocationIfInBounds(e) {
    if (countyBounds.contains(e.latlng)) {
      map.setView(e.latlng, 16, { animate: true });
      L.circle(e.latlng, e.accuracy / 2).addTo(map);
    } else {
      alert('Your location was not found in San Mateo County.');
      map.setView([37.535, -122.35499], 12, { animate: true });
    }
  });

  map.on('locationerror', function onLocationError(e) {
    alert('There was a problem finding your location: ' + e.message);
  });
}


$(document).ready(function initMap() {
  var map = L.map('map', {
    center: [37.535, -122.35499],
    zoom: 12,
    minZoom: 11,
    maxZoom: 20,
    maxBounds: countyBounds.pad(0.2),
  });
  addLayers(map);
  addControls(map);
});
