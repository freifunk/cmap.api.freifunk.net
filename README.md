Community Map
=============

## Setup
-----

```
git clone https://github.com/freifunk/cmap.api.freifunk.net.git
cd cmap.api.freifunk.net
node server.js
```

## Options

Community map accepts options as JSON object

| Name               | Standard                                           | Bedeutung                                                            |
|--------------------|----------------------------------------------------|----------------------------------------------------------------------|
| ffGeoJsonUrl       | "//api.freifunk.net/map/ffGeoJsonp.php?callback=?" | URL with API data, we need jsonp there                               |
| hideLocationButton | false                                              |                                                                      |
| hideLayerControl   | false                                              | hide or show layer box                                               |
| hideInfoBox        | false                                              | hide or show info box                                                |
| feedUrl            | "//api.freifunk.net/feed/feed.php"                 | a feed provided by https://github.com/freifunk/feed.api.freifunk.net |
| newsContentLimit   | 3                                                  | number of news entries                                               |
| eventsContentLimit | 2                                                  | number of event entries                                              |
| postContentLength  | 30                                                 | length event headlines                                               |
| zoomLevel          | 5                                                  | default zoom level on page load                                      |
| center             | [51.5,10.5]                                        | initial center of map                                                |
| divid              | "map"                                              | div id where map should be displayed                                 |
| showEvents         | false                                              | show events in community popup                                       |
| showNews           | false                                              | show news in community popup                                         |
| mapboxId           | "mapbox.streets"                                   | id for your mapbox tiles                                             |

## Dependencies
(external folder)

* jQuery
* underscore.js
* leaflet.js

## Contribute

The community map is a fun & visual way to know more about open-source communities across Asia. If you think there are cool features that can be integrated in the map, you can let us know by opening an issue, or sending pull requests. Bug reports are equally welcomed.
