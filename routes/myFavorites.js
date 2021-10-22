/*
 * This would be routes for the users favorite maps
 */

const express = require('express');
const router  = express.Router();
const db = require('../lib/mapqueries.js');
const dc = require('../lib/favoritesQueries.js');

//----------------------------------------------------------------------------------------------------

router.get("/", (req, res) => {
  const user_id = req.session.userId;
  const username = req.session.username;
  db.getMyFavoriteMaps(user_id)
    .then(myFavoriteMaps => {

      dc.getFavoritesByUser(user_id)
        .then(favorites => {
          const final = myFavoriteMaps.map((map) => {
            let resutlingMap = {...map};
            const foundFavorite = favorites.find((favorite) => {
              if (map.id === favorite.map_id) {
                return true;
              } else {
                return false;
              }
            });
            resutlingMap.favorited = foundFavorite || null;

            return resutlingMap;
          });
          const templateVars = { gallerymaps: final, user: username};
          res.render("gallerypages", templateVars);
        });
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: err.message });
    });
});

//----------------------------------------------------------------------------------------------------

router.post("/", (req, res) => {

  const user_id = req.session.userId;
  const map_id = req.body.mapId;

  if (!user_id) {
    return;
  } else {

    const block = {
      user_id,
      map_id
    };

    dc.addFavorite(block)
      .then(addedFav => {
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  }
});

//----------------------------------------------------------------------------------------------------

router.post("/Delete", (req, res) => {

  const user_id = req.session.userId;
  const map_id = req.body.mapId;

  if (!user_id) {
    return;
  } else {

    const block = {
      user_id,
      map_id
    };

    dc.removeFavorite(block)
      .then(addedFav => {


      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  }
});

module.exports = router;



