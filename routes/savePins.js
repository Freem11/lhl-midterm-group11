const express = require('express');
const router  = express.Router();
const db = require('../lib/pinQueries');

//----------------------------------------------------------------------------------------------------

router.post("/", (req, res) => {
  const contributor_id = req.session.userId;
  const latitude = req.body.lat;
  const longitude = req.body.long;
  const title = req.body.name;
  const map_id = req.body.mapId;
  const description = "description";
  const thumbnail_image = "map_image";
  const layer_id = 1;

  const user_id = req.session.userId;

  const map = {
    contributor_id,
    map_id,
    title,
    description,
    thumbnail_image,
    longitude,
    latitude,
    layer_id
  };


  if (!user_id) {
    return;
  } else {
    db.generatePin(map)
      .then(data => {
        res.json(data[0].id);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  }


});


module.exports = router;
