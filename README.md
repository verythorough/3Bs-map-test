# 3Bs-map-test

Temporary repo to demonstrate alterations to our original "3 B's" map, before merging to OpenSMC.  The [original project](https://github.com/opensmc/ssmc-agriculture-zoning) was built on Carto (thanks to a free account offered to Code for America brigades).  Carto's interface made it easy for members with less coding experince, but we hit some difficuty when trying to move beyond the "rails" of a basic map setup.  We decided to try a Leaflet-based solution, intgrating elements from Leaflet, Mapbox, and the original data layers still hosted in Carto.

I created a custom baselayer style in Mapbox Studio to better illustrate the type of land not covered by our data layer (primarily open space and indutrial areas). I could import this to Carto's UI, but the base map labels would display behind the data layer.  Preventing this required splitting the style into two layers and including both, which can't be done in Carto's UI, but _can_ be done by integrating both services in a Leaflet map.

Leaflet also allowed for easy integration of custom controls, including Mapbox's built-in geocoding control, which produced much more relevant local results than Carto's geocoded search control.  (For example, "94025" produced Menlo Park, not Koningshoek 94025, 3144 Maassluis, Netherlands!)
