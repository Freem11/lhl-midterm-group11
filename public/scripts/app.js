
$(() => {


  $(".fas").on("click", function(e) {
    e.preventDefault();
    e.stopPropagation();


    const theColorIs = $(this).css("color");

    const URL = $(this).parents(".map-box").attr("href") ||  window.location.pathname;
    const mapArr = URL.split("/");
    const mapId = mapArr[2];

    console.log(URL, mapArr);

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


      });


    }
  });

  const updatePinName = () => {
    $(".fa-edit").on("click", function() {
      const $inputDiv = $(this).siblings("div");
      if ($inputDiv.is(":hidden")) {
        $inputDiv.slideDown("slow");
        $inputDiv.css("display", "flex");
      }
      $(".addBtn").on("click", function() {
        const newTitle = $(".new-pin").val();
        $(".new-pin").val("");
        $inputDiv.hide();
        const $td = $(this).parent("div").parent("td");
        const pinId = $td.attr("data-id");
        $.ajax({
          url: "/map/pin/update",
          method: "POST",
          data: {pinId, newTitle}
        })
          .then(data => {
            location.reload(true);
          })
          .catch(error => console.log(error));

      });
    });
  };

  updatePinName();

  let map;
  const drawPins = (arr, map) => {
    const pin = $("#pin-list").append();
    let marker = null;
    for (const pinData of arr) {
      L.marker([pinData.latitude, pinData.longitude], {draggable:'true'}).addTo(map)
        .bindPopup(`${pinData.title}`)
        .openPopup()
        .on('dragend', function(event) {
          marker = event.target;
          let position = marker.getLatLng();
          marker.setLatLng(new L.LatLng(position.lat, position.lng),{draggable:'true'});
          map.panTo(new L.LatLng(position.lat, position.lng));
        })
        .on('click', function(event) {

          let marker = event.target;
          let position = marker.getLatLng();
          marker.setLatLng(new L.LatLng(position.lat, position.lng),{draggable:'true'});
          savePin(position.lat, position.lng, pinName);

        });
    }
  };

  const drawTable = (pinData) => {
    let $pin = createTableElement(pinData);


    $(".pintab").append($pin);
  };
  const createTableElement = function(object) {
    return $(`<tr>
                    <td class="map-name">${object}</td>
                  </tr>`);
  };


  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    }
  };

  const showPosition = (position) => {
    map = L.map("mapid").setView(
      [position.coords.latitude, position.coords.longitude],
      13
    );

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

  let coords = [];
  let pinName;
  const drawMarker = (latLng) => {
    // We need to extract the coordinates from the response.
    // let coordinates = response.features[0].geometry.coordinates; // The coordintaes are in a [<lng>, <lat>] format/
    // let coordinates = response;
    // let latLng = L.latLng([coordinates[1], coordinates[0]]); // The url template for OpenStreetMap tiles.
    // var osmUrl =
    //   "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZnJlZW0xMSIsImEiOiJja3V0M2kxdHk1bDVoMnduemZiems0ZjZyIn0.W0f8zYdfwwPgtXTgoWT3ig"; // Creates the tile layer.
    let osmTileLayer = L.tileLayer(
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
    ); // Adds the tile layer to the map.
    map = L.map("mapid").addLayer(osmTileLayer);
    map.setView(latLng, 13); // Creates a marker for our departure location and adds it to the map.
  };

  // let locationName = "saddledome calgary";
  const $addresses = [];
  const showLocations = () => {
    // drawMarker([51.1646246, -113.9384915]);
    $("#search-button").on("click", function() {
      const $address = $("#search-bar").val();
      $addresses.push($address);
      // console.log($addresses);
      $addresses.forEach((address) => {
        sendGeocodingRequest(address)
          .then(function(data) {
            let coordinates = data.features[0].geometry.coordinates;
            coords.push([coordinates[1], coordinates[0]]);
            let pinNameArray = data.features[0].properties.label.split(" ");
            pinName = `${pinNameArray[0]} ${pinNameArray[1]} `;
            //and if it is success drawing map and marker
            addNewMarker(data);
            $("#search-bar").val("");
          })
          .catch((err) => console.log(err));
      });
    });
  };
  showLocations();
  // These secret variables are needed to authenticate the request. Get them from http://docs.traveltimeplatform.com/overview/getting-keys/ and replace
  let APPLICATION_ID = "da409bff";
  let API_KEY = "169ddfc918d7919f5aaf1778daa6a314";

  ///sending request
  const addNewMarker = (response) => {
    let coordinates = response.features[0].geometry.coordinates; // The coordintaes are in a [<lng>, <lat>] format/
    let latLng = L.latLng([coordinates[1], coordinates[0]]);
    // map.setView(latLng, 13);
    let marker = L.marker(latLng, { draggable: "true" }).addTo(map);
    console.log("COORDS ", coords);
    map.fitBounds(coords);
    marker
      .bindPopup(
        `${pinName}<br/><br/><div><p class="popup-text">Click the Marker to add this location to your map</p></div>`
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
        savePin(position.lat, position.lng, pinName);
      });
  };


  const savePin = (lat, long, name,) => {
    let pathname = window.location.pathname;
    const mapArr = pathname.split("/");
    const mapId = mapArr[2];

    drawTable(name);
    $.ajax({
      url: "/map/pins",
      method: "POST",
      data: {lat, long, name, mapId}
    })
      .then(data => {
        console.log(data);
      })
      .catch(error => console.log(error));

  };


  const deletePin = () => {
    $(".fa-trash-alt").on("click", function() {
      const $textDiv = $(this).parent("td");
      const pinId = $textDiv.attr('data-id');
      $.ajax({
        url: "/map/pin/delete",
        method: "POST",
        data: {pinId}
      })
        .then(data => {
          location.reload(true);
        })
        .catch(error => console.log(error));
    });
  };

  deletePin();

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
    ).then((response) => response.json()); // parses JSON response into native Javascript objects
  }
});
