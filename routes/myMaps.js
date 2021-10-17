/*
 * This would be routes for all maps
 */

const express = require('express');
const router  = express.Router();
const db = require('../lib/mapqueries.js');


router.get("/", (req, res) => {
  const user_id = req.session.userId;
  db.getMyMaps(user_id)
    .then(myMaps => {

      const templateVars = { gallerymaps: myMaps };

      console.log(templateVars)
      res.render("gallerypages", templateVars);

    })
    .catch(err => {
      res
        .status(500)
        .json({ error: err.message });
    });
});
module.exports = router;
