const express = require('express');
const router  = express.Router();
const db = require('../lib/pinQueries');

//----------------------------------------------------------------------------------------------------

router.post("/", (req, res) => {
  const new_title = req.body.newTitle;
  const pin_id = req.body.pinId;
  const map = {
    new_title,
    pin_id
  };

  if (!user_id) {
    return;
  } else {
    db.updatePinById(map)
      .then(data => {
        res.redirect(`/maps/${data[0].map_id}`);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  }


});

module.exports = router;
