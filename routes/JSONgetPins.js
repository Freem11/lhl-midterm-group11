const express = require("express");
const router = express.Router();
const db = require("../lib/pinQueries.js");

//----------------------------------------------------------------------------------------------------

router.get("/:id", (req, res) => {
  const map_id = req.params.id;

  db.getPinsByMap(map_id)
    .then(pincollection => {
      res.json(pincollection);
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: err.message });
    });
});

module.exports = router;
