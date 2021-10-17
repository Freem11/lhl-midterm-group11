/*
 * This would be routes for all maps
 */

const express = require('express');
const router  = express.Router();
const db = require('../lib/mapqueries.js');


router.get("/", (req, res) => {
  const map_id = req.params.id;
  db.getMap(map_id)
    .then(currentMap => {
      res.json({currentMap});
      // res.render("all-maps", { allmaps });
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: err.message });
    });
});
module.exports = router;
