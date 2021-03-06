var FFCommunityMapWidget = function(settings, map_options, link) {

  var defaultOptions = {
    ffGeoJsonUrl: "//api.freifunk.net/map/ffGeoJsonp.php?callback=?",
    hideLocationButton: false,
    hideLayerControl: false,
    hideInfoBox: false,
    feedUrl: "//api.freifunk.net/feed/feed.php",
    newsContentLimit: 3,
    eventsContentLimit: 2,
    postContentLength: 30,
    zoomLevel: 5,
    center: [51.5,10.5],
    divid: "map",
    showEvents: false,
    showNews : false,
    mapboxId: "mapbox.streets"
  };
  var settings = jQuery.extend({}, defaultOptions, settings);
  var renderPopup = function (props, configs) {
    //console.log(props);
    //clean up values before rendering
    if (props.url && !props.url.match(/^http([s]?):\/\/.*/)) {
      props.url = "http://" + props.url;
    }
    if (props.email && !props.email.match(/^mailto:.*/)) {
      props.email = "mailto:" + props.email;
    }
    if (props.twitter && !props.twitter.match(/^http([s]?):\/\/.*/)) {
      props.twitter = "https://twitter.com/" + props.twitter;
    }
    if (props.irc && !props.irc.match(/^irc([s]?):.*/)) {
      props.irc = "irc:" + props.irc;
    }
    if (props.jabber && !props.jabber.match(/^jabber:.*/)) {
      props.jabber = "xmpp:" + props.jabber;
    }
    if (props.identica && !props.identica.match(/^identica:.*/)) {
      props.identica = "identica:" + props.identica;
    }

    function getAgeFromProperties(props) {
      var ageindays = -1;
      if (props.mtime) {
        ageindays = Math.round((Math.round(+new Date()/1000) - props.mtime) / (3600*24));
      }
      return ageindays;
    };

    function getStateFromProperties(props) {
      var state = 'unknown';
      if (props.mtime) {
        var ageindays = getAgeFromProperties(props);
        if (ageindays < 0 || isNaN(ageindays)) {
          state = 'unknown';
        } else if (ageindays < 2) {
          state = 'up-to-date';
        } else if (ageindays < 7) {
          state = 'valid';
        } else {
          state = 'outdated';
        }
      }
      return state;
    };
    props.age = getAgeFromProperties(props);
    props.state = getStateFromProperties(props);

    props.contacts =  [];
    if (props.url) {
      props.contacts.push({
        type: 'home',
         url : props.url
      });
    }

    if (props.email) {
      props.contacts.push({
        type: 'envelope',
        url : props.email
      });
    }

    if (props.facebook) {
      props.contacts.push({
        type: 'facebook',
        url : props.facebook
      });
    }

    if (props.twitter) {
      props.contacts.push({
        type: 'twitter',
        url : props.twitter
      });
    }

    if (props.irc) {
      props.contacts.push({
        type: 'commenting-o',
        url : props.irc
      });
    }

    if (props.jabber) {
      props.contacts.push({
        type: 'xmpp',
        url : props.jabber
      });
    }

    if (props.identica) {
      props.contacts.push({
        type: 'identica',
        url : props.identicy
      });
    }

    if (props.googleplus) {
      props.contacts.push({
        type: 'google-plus',
        url : props.googleplus
      });
    }

    if (props.matrix) {
      props.contacts.push({
        type: 'matrix-org',
        url : props.matrix
      });
    }

    //render html and return
    return widget.communityTemplate(props);
  };

//  if (!settings.scrollWheelZoom) {
//    widget.map.scrollWheelZoom.disable();
//  }

  if (!settings.touchZoom && (('ontouchstart' in window) || navigator.MaxTouchPoints > 0)) {
    widget.map.dragging.disable();
    widget.map.tap.disable();
  }

  var options = L.extend({
    divId: settings.divid,
    ffGeoJsonUrl: settings.ffGeoJsonUrl || "/map/ffGeoJson.json",
    getPopupHTML: renderPopup,
    zoom: settings.zoomLevel,
    touchZoom: settings.touchZoom,
    maxZoom: 8,
    center: settings.center
  }, options);

  var widget = {};
  widget.map = L.map(options.divId, map_options);
  widget.map.setView(
    options.center,
    options.zoom
  );

  var mapboxLayer = L.tileLayer('https://api.mapbox.com/styles/v1/freienetzwerke/ckatogpoebrsz1io160d3e80i/tiles/{z}/{x}/{y}?access_token=' + settings.mapboxId, {
	  attribution: '© <a href="https://apps.mapbox.com/feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
	  tileSize: 512,
	  zoomOffset: -1,
  });

  var osmlayer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  });
  //console.log(options);
  //set default layer
  widget.map.addLayer(mapboxLayer);

  var clusters = L.markerClusterGroup({
    spiderfyOnMaxZoom: false,
    showCoverageOnHover: false,
    maxClusterRadius: 40
  }).addTo(widget.map);

  if (!settings.hideLocationButton) {
    var locationButton = new L.Control.Button({
      iconUrl: "//api.freifunk.net/map/images/location-icon.png",
      hideText: true,
      doToggle: false,
      onClick: function(e) {
          var btn = jQuery(this);
          /* disable the location button visually if location permission is not granted */
          widget.map.on('locationerror', function(e) {
            if (e.code == 1 /*PERMISSION_DENIED*/) {
              btn.addClass('disabled');
              console.log(btn);
            }
          });
          /* try to read the user location and center map there */
          widget.map.locate({
            setView: true,
            maxZoom: 8,
            timeout: 30000
          });
        }
    });
    widget.map.addControl(locationButton);
  }

  if (!settings.hideLayerControl) {
    var controls = L.control.layers({
      "Gray": mapboxLayer,
      "OSM": osmlayer
    }).addTo(widget.map);
  }

//  jQuery.getJSON('', function(configs) {
  jQuery.getJSON(options.ffGeoJsonUrl, function(geojson) {
    var geoJsonLayer = L.geoJson(geojson, {
      onEachFeature: function(feature, layer) {
        layer.bindPopup(options.getPopupHTML(feature.properties, settings), { minWidth: 210, maxHeight: 400 });
      },
      filter: function(feature, layer) {
        if (feature.geometry.coordinates[0] && feature.geometry.coordinates[1]) {
          return true;
        } else {
          return false;
        }
      },
      pointToLayer: function(feature, latlng) {
        var marker = L.circleMarker(latlng, {
          //title: feature.properties.name,
          //riseOnHover: true
          stroke: true,
          weight: 10,
          opacity: 0.3,
          color: '#009ee0',
          fill: true,
          fillColor: '#009ee0',
          fillOpacity: 0.7
        });
        return marker;
      }
    }).addTo(clusters);

    //add stats info box
    if (!settings.hideInfoBox) {
      var legend = L.control({position: 'bottomleft'});
      legend.onAdd = function(data) {
        var div = L.DomUtil.create('div', 'info');
        var nodes = 0;
        _.each(geojson.features, function(item, key, list) {
          if (item.properties.nodes) { nodes += parseInt(item.properties.nodes); }
        });
        div.innerHTML = '<strong>' + geojson.features.length + ' Orte</strong>';
        div.innerHTML += '<hr>';
        div.innerHTML += '<strong>' + nodes + ' Zugänge</strong>';
        return div;
      };
      legend.addTo(widget.map);
    }
  });

  //initialize underscore templating
  _.templateSettings.variable = "props";
  widget.communityTemplate = _.template(
    jQuery( "script.template#community-popup" ).html()
  );

    widget.map.on('popupopen', function(e){
      if (settings.showEvents) {
			jQuery('.events').communityTimeline({
						source : e.popup._contentNode.getElementsByClassName('community-popup')[0].getAttribute('data-id'),
						title : 'Veranstaltungen',
						limit: settings.eventsContentLimit,
						descLength: settings.postContentLength,
						order : 'oldest-first'
				});
    }
    if (settings.showNews) {
      var url = settings.feedUrl
          + '?format=json&limit=' + settings.newsContentLimit + '&source='
          + e.popup._contentNode.getElementsByClassName('community-popup')[0].getAttribute('data-id');
      console.log(url);
      jQuery.ajax({
        url: url,
        error: function(err) {
          console.log(err);
        },
        dataType: "jsonp",
        success: function(data) {
          //$data = jQuery(jQuery.parseXML(data));
          items = data.channel.item;
          var rssfeed = jQuery(e.popup._container).find('.community-popup').append('<div class="rssfeed rss-container">').find('.rssfeed');
          rssfeed.append('<div class="rss-header"><div class="rss-title">Neuigkeiten</div></div>');
          var rssfeedList = rssfeed.append('<div class="rss-body"><div id="mCSB_1" class="rss-news mCustomScrollbar _mCS_1 mCS-autoHide"><div id="mCSB_1_container" class="mCustomScrollBox mCS-light-3 mCSB_vertical">').find('.rss-news');
          if (items && items.length > 0) {
            console.log('There are some items');
            items.forEach(function(item) {
              var blogLink = rssfeedList.append('<div class="rss-newsitem"><a class="bloglink" target="_blank">' + item.title + '</a>'
                + '</div>').find('a').last();
              blogLink.attr('href', item.link);
            });
          }
        },
        timeout: 20000
      });
    }
    var px = widget.map.project(e.popup._latlng); // find the pixel location on the map where the popup anchor is
    px.y -= e.popup._container.clientHeight*0.8; // find the height of the popup container, divide by 2, subtract from the Y axis of marker location
    widget.map.panTo(widget.map.unproject(px),{animate: true}); // pan to new center
});
//  });
  return widget;
}

var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
var eventer = window[eventMethod];
var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";

// Listen to message from child window
eventer(messageEvent,function(e) {
  if (e.data == ("embed-timeline-loaded")) {
    var key = e.message ? "message" : "data";
    var data = e[key];
    jQuery('.events').removeClass('hidden');
  }
},false);
