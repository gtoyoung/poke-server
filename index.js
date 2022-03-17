import express from "express";
import Pokedex from "pokedex-promise-v2";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 80;
const app = express();
const P = new Pokedex();

async function getPoketInfo(poketmon) {
  try {
    return P.getPokemonByName(poketmon)
      .then((response) => {
        // 포켓몬 기본 정보
        return {
          id: response.id,
          name: response.name,
          height: response.height,
          weight: response.weight,
          types: response.types,
          img: {
            back: response.sprites.back_default,
            front: response.sprites.front_default,
            artwork: response.sprites.other["official-artwork"].front_default,
            dream: response.sprites.other["dream_world"].front_default,
            home: response.sprites.other["home"].front_default,
          },
        };
      })
      .then((data) => {
        // 포켓몬 색깔 가져오기
        return P.getPokemonSpeciesByName(poketmon).then((spec) => {
          return {
            ...data,
            color: spec.color.name,
          };
        });
      });
  } catch (err) {
    console.log(err);
  }
}

async function getPokemonsList(offset, limit) {
  const interval = {
    limit: limit,
    offset: offset,
  };
  var promiseList = [];
  try {
    return P.getPokemonsList(interval).then((response) => {
      response.results.forEach((poketmon) => {
        promiseList.push(getPoketInfo(poketmon.name));
      });

      return Promise.all(promiseList).then((results) => {
        return results;
      });
    });
  } catch (err) {
    console.log(err);
  }
}

const corsOptions = {
  origin: process.env.TARGET_URL,
};

app.use(cors(corsOptions));
app.use(express.json({ extended: true }));

app.post("/info", function (req, res) {
  getPoketInfo(req.body.name).then((response) => {
    res.send(response);
  });
});

app.post("/list", function (req, res) {
  getPokemonsList(req.body.offset, req.body.limit).then((response) => {
    res.send(response);
  });
});

app.listen(PORT, function () {
  console.log(`Server is running on ${PORT}`);
});
