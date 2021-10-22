const db = require("./db");

//----------------------------------------------------------------------------------------------------

const getAllFavorites = () => {
  return db.query(`SELECT * FROM favorites`)

    .then((response) => {
      return response.rows;
    })
    .catch((error) => {
      console.log("unable to query db error:", error);
    });
};

//----------------------------------------------------------------------------------------------------

const getFavoritesByUser = (id) => {
  return db.query(`SELECT * FROM favorites
                    WHERE favorites.user_id = $1;`, [id])

    .then((response) => {
      return response.rows;
    })
    .catch((error) => {
      console.log("unable to query db error:", error);
    });
};

//----------------------------------------------------------------------------------------------------

const addFavorite = (block) => {
  return db.query(`INSERT INTO favorites (user_id, map_id)
                    VALUES ($1, $2) RETURNING *;`, [block.user_id, block.map_id])

                    .then((result) => {
                      return result.rows;
                    })
                    .catch((error) => {
                      console.log("unable to query db error:", error);
                    });
};

//----------------------------------------------------------------------------------------------------

const removeFavorite = (block) => {
  return db.query(`DELETE FROM favorites
                    WHERE user_id = $1 AND map_id = $2;`, [block.user_id, block.map_id])
                    .then((result) => {
                      return result.rows;
                    })
                    .catch((error) => {
                      console.log("unable to query db error:", error);
                    });
};

//----------------------------------------------------------------------------------------------------

const isMapFavorited = (map_id, user_id) => {
  return db.query(`SELECT * FROM favorites
                    WHERE favorites.map_id = $1 AND favorites.user_id = $2;`, [map_id, user_id])

    .then((response) => {
      return response.rows;
    })
    .catch((error) => {
      console.log("unable to query db error:", error);
    });
};



module.exports = {getAllFavorites, getFavoritesByUser, addFavorite, removeFavorite, isMapFavorited};
