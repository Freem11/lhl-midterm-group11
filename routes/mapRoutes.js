const express = require('express');
const router  = express.Router();
const db = require('../lib/mapqueries.js');
const dc = require("../lib/pinQueries.js");
const dd = require('../lib/favoritesQueries.js');

//----------------------------------------------------------------------------------------------------

router.post("/", (req, res) => {
  const name = req.body.map_name;
  const description = req.body.map_description;
  const latitude = 0;
  const longitude = 0;
  const image = "map_image";
  const user_id = req.session.userId;

  const map = {
    name,
    description,
    user_id,
    image,
    latitude,
    longitude,
  };

  const username = req.session.username;
  db.generateMap(map)
    .then(data => {
      res.redirect(`/maps/${data[0].id}`);
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: err.message });
    });
});

//-------------------------------------------------------------------------------------------

router.post("/delete", (req, res) => {
  const map_id = req.body.mapId;
  const user_id = req.session.userId;

  const map = {
    map_id
  };

  if (!user_id) {
    return;
  } else {

  db.deleteMapById(map)
    .then(data => {

      res.status(200).send();

    })
    .catch(err => {
      res
        .status(500)
        .json({ error: err.message });
    });
  }
});


//-------------------------------------------------------------------------------------------

router.get("/:id", (req, res) => {
  const username = req.session.username;
  const user_id = req.session.userId
  const map_id = req.params.id;
  db.getSingleMap(map_id)
    .then(currentMap => {

      dc.getPinsByMap(map_id)
        .then(pincollection => {

          dd.isMapFavorited(map_id, user_id)
            .then(mapFav => {
              let mapVar = mapFav.length;

              res.render("map", { mapName: currentMap[0]['name'], user: username, pins: pincollection, mapVar });
            })
            .catch(err => {
              res
                .status(500)
                .json({ error: err.message });
            });
        })
        .catch(err => {
          res
            .status(500)
            .json({ error: err.message });
        });
    });
});

module.exports = router;
