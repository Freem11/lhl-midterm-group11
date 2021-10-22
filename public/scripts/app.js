
$(() => {

  //----------------------------------------------------------------------------------------------------

  $(".far").on("click", function(e) {
    e.preventDefault();
    e.stopPropagation();

    const URL = $(this).parents(".map-box").attr("href") ||  window.location.pathname;
    const mapArr = URL.split("/");
    const mapId = mapArr[2];

    $.ajax({
      url: "/maps/delete",
      method: "POST",
      data: {mapId},
    }).then(function(data) {

      $.ajax({
        url: "/",
        method: "GET",
      }).then(function(data) {

        window.location.replace(`http://localhost:8080${window.location.pathname}`);
      });

    });

  });

//----------------------------------------------------------------------------------------------------

  window.markers = {};

  $(".fas").on("click", function(e) {
    e.preventDefault();
    e.stopPropagation();
    const theColorIs = $(this).css("color");

    const URL = $(this).parents(".map-box").attr("href") ||  window.location.pathname;
    const mapArr = URL.split("/");
    const mapId = mapArr[2];

    if (theColorIs === "rgb(211, 211, 211)") {
      $(this).css("color", 'rgb(175, 32, 32)');
      $.ajax({
        url: "/api/favorites",
        method: "POST",
        data: {mapId},
      }).then(function(data) {
      });
    } else {
      $(this).css("color", 'lightgrey');

      $.ajax({
        url: "/api/favorites/Delete",
        method: "POST",
        data: {mapId},
      }).then(function(data) {

        $.ajax({
          url: "/",
          method: "GET",
        }).then(function(data) {

          window.location.replace(`http://localhost:8080${window.location.pathname}`);
        });

      });


    }
  });

  //----------------------------------------------------------------------------------------------------

  let map;
  const drawPins = (arr, map) => {
    const pin = $("#pin-list").append();
    let marker = null;
    for (const pinData of arr) {
      if (window.markers[pinData.id]) {
        let leafletId = window.markers[pinData.id];
        window.map._layers[leafletId].remove();
      }

      const mark = L.marker([pinData.latitude, pinData.longitude], {draggable:'true'}).addTo(map)
        .bindPopup(`${pinData.title}<img class="pin-image"src="../../images/pin_image.webp"/><br/><div><p class="popup-text">Click the Marker to add this location to your map</p></div>`)
        .openPopup()
        .on('dragend', function(event) {
          marker = event.target;
          let position = marker.getLatLng();
          marker.setLatLng(new L.LatLng(position.lat, position.lng),{draggable:'true'});
          map.panTo(new L.LatLng(position.lat, position.lng));
          // updateOnDragMarker(position.lat, position.lng);
        })
        .on('click', function(event) {
          let marker = event.target;
          const markerId = marker._leaflet_id;
          let position = marker.getLatLng();
          marker.setLatLng(new L.LatLng(position.lat, position.lng),{draggable:'true'});
          savePin(position.lat, position.lng, pinName, markerId);
        });
      window.markers[pinData.id] = mark._leaflet_id;
    }
  };

  //----------------------------------------------------------------------------------------------------

  const loadPins = () => {
    let pathname = window.location.pathname;
    const myArr = pathname.split("/");


    if (!myArr[2]) {
      return;
    } else if (isNaN(parseInt(myArr[2]))) {
      return;
    }

    $.ajax(`/api/maps/${myArr[2]}`, { method: "GET" }).then(function(results) {
      renderTable(results);
    });
  };

  loadPins();

  //----------------------------------------------------------------------------------------------------

  const renderTable = (pins) => {
    return pins.forEach(pin => $(".pintab").prepend(createTableTableBody(pin)));
  };

  //----------------------------------------------------------------------------------------------------

  const createTableTableBody = (pin) => {

    const $row = $(`<tr class="pin-name" data-id="${pin.id}" data-title="${pin.title}">
    <td class="map-name" data-id=" ${pin.id} " data-latlng="">${pin.title}
    <i class="far fa-edit"></i>
    <i class="far fa-trash-alt"></i>
    <div id="${pin.id}" class="hidden-inputs">
      <input class="new-pin" type="text"/>
      <button class="btn btn-primary addBtn" data-div="${pin.id}">Save</button>
    </div>
    </td></tr>`);

    return $row;
  };

  //----------------------------------------------------------------------------------------------------

  $(document).on("click", ".fa-edit", function() {
    const $inputDiv = $(this).siblings("div");
    if ($inputDiv.is(":hidden")) {
      $inputDiv.slideDown("slow");
      $inputDiv.css("display", "flex");
    }
  });

  //----------------------------------------------------------------------------------------------------

  $(document).on("click", ".addBtn", function() {
    const newTitle = $(this).siblings("input").val();
    const $inputDiv = $(this).parent("div");
    $inputDiv.hide();
    const $td = $(this).parent("div").parent("td");
    const pinId = $td.attr("data-id");
    $.ajax({
      url: "/map/pin/update",
      method: "POST",
      data: {pinId, newTitle}
    })
      .then(data => {
        $('.pintab').html("");
        loadPins();
      })
      .catch(error => console.log(error));

  });

  //----------------------------------------------------------------------------------------------------

  const deletePin = () => {
    $(document).on("click", ".fa-trash-alt", function() {
      const $textDiv = $(this).parent("td");
      const pinId = $textDiv.attr("data-id").trim();
      const latLng = $textDiv.attr("data-latlng");
      console.log("FROM DELETE:", latLng);
      $.ajax({
        url: "/map/pin/delete",
        method: "POST",
        data: {pinId}
      })
        .then(data => {
          $('.pintab').html("");
          loadPins();
          let leafletId = window.markers[pinId];
          console.log(leafletId, pinId, window.markers);
          window.map._layers[leafletId].remove();
        })
        .catch(error => console.log(error));
    });
  };

  deletePin();

//----------------------------------------------------------------------------------------------------

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    }
  };

//----------------------------------------------------------------------------------------------------

  const showPosition = (position) => {
    map = L.map("mapid").setView(
      [position.coords.latitude, position.coords.longitude],
      13
    );

    window.map = map;

    L.tileLayer(
      "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
      {
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: "mapbox/streets-v11",
        tileSize: 512,
        zoomOffset: -1,
        accessToken:
          "pk.eyJ1IjoiZnJlZW0xMSIsImEiOiJja3V0M2kxdHk1bDVoMnduemZiems0ZjZyIn0.W0f8zYdfwwPgtXTgoWT3ig",
      }
    ).addTo(map);

    let pathname = window.location.pathname;

    const myArr = pathname.split("/");


    $.ajax(`/api/maps/${myArr[2]}`, { method: "GET" }).then(function(results) {
      drawPins(results, map);
    });
  };
  getLocation();


//----------------------------------------------------------------------------------------------------


  let coords = [];
  let pinName;
  let fullMarkerName;


  const $addresses = [];
  const showLocations = () => {

    $("#search-button").on("click", function() {
      const $address = $("#search-bar").val();
      if ($address === "" || $address === null) {
        if ($("#empty-search").first().is(":hidden")) {
          $("#empty-search").slideDown("slow");
        }
        return;
      } else {
        $("#empty-search").hide();
      }

      sendGeocodingRequest($address)
        .then(function(data) {
          console.log("DATA:", data.features);
          let coordinates = data.features[0].geometry.coordinates;
          coords.push([coordinates[1], coordinates[0]]);
          let pinNameArray = data.features[0].properties.label.split(" ");
          pinName = `${pinNameArray[0]} ${pinNameArray[1]} `;
          fullMarkerName = data.features[0].properties.label;
          addNewMarker(data);
          $("#search-bar").val("");

        })
        .catch((err) => console.log(err));
    });
  };
  showLocations();
  // These secret variables are needed to authenticate the request. Get them from http://docs.traveltimeplatform.com/overview/getting-keys/ and replace
  let APPLICATION_ID = "da409bff";
  let API_KEY = "169ddfc918d7919f5aaf1778daa6a314";


//----------------------------------------------------------------------------------------------------


  ///sending request
  const addNewMarker = (response) => {
    let coordinates = response.features[0].geometry.coordinates; // The coordintaes are in a [<lng>, <lat>] format/
    let latLng = L.latLng([coordinates[1], coordinates[0]]);

    console.log("RESPONSE: ", response);
    let marker = L.marker(latLng, { draggable: "true" }).addTo(map);
    console.log("MARKER", marker);
    const markerId = marker._leaflet_id;
    map.fitBounds(coords);
    marker
      .bindPopup(
        `${fullMarkerName}<img class="pin-image"src="../../images/pin_image.webp"/><br/><div><p class="popup-text">Click the Marker to add this location to your map</p></div>`
      )
      .openPopup()
      .on("dragend", function(event) {
        let marker = event.target;
        let position = marker.getLatLng();
        marker.setLatLng(new L.LatLng(position.lat, position.lng), {
          draggable: "true",
        });
        map.panTo(new L.LatLng(position.lat, position.lng));
      })
      .on('click', function(event) {
        let marker = event.target;
        let position = marker.getLatLng();
        marker.setLatLng(new L.LatLng(position.lat, position.lng), {
          draggable: "true",
        });
        savePin(position.lat, position.lng, pinName, markerId);
        marker.off("click");
      });

  };

  //----------------------------------------------------------------------------------------------------

  // SAVE PIN

  const savePin = (lat, long, name, leafletId) => {
    let pathname = window.location.pathname;
    const mapArr = pathname.split("/");
    const mapId = mapArr[2];

    $.ajax({
      url: "/map/pins",
      method: "POST",
      data: {lat, long, name, mapId}
    })
      .then(data => {
        if (window.markers[data]) {
          let leafletId = window.markers[data];
          window.map._layers[leafletId].remove();
        }
        window.markers[data] = leafletId;
        $('.pintab').html("");
        loadPins();
      })
      .catch(error => console.log(error));
  };

//----------------------------------------------------------------------------------------------------

  function sendGeocodingRequest(location) {
    return fetch(
      `https://api.traveltimeapp.com/v4/geocoding/search?query=` + location,
      {
        method: "GET",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-Application-Id": APPLICATION_ID,
          "X-Api-Key": API_KEY,
          "Accept-Language": "en-US",
        },
      }
    ).then((response) => response.json());
  }
});
