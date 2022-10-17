var express = require("express");
var app = express();

//TODO: create a redis client
var Redis = require("redis");
const client = Redis.createClient();

// serve static files from public directory
app.use(express.static("public"));

//Initialize values for: header, left, right, article and footer using the redis client
client.MSET("header", 0, "left", 0, "article", 0, "right", 0, "footer", 0);
//TEST
client.MGET(
  ["header", "left", "article", "right", "footer"],
  function (err, value) {
    if (err) console.error(err);
    console.log(value);
  }
);

// Get values for holy grail layout
function data() {
  // TODO: uses Promise to get the values for header, left, right, article and footer from Redis
  return new Promise((resolve, reject) => {
    client.MGET(
      ["header", "left", "article", "right", "footer"],
      function (err, value) {
        const data = {
          header: Number(value[0]),
          left: Number(value[1]),
          article: Number(value[2]),
          right: Number(value[3]),
          footer: Number(value[4]),
        };
        err ? reject(null) : resolve(data);
      }
    );
  });
}

// plus
app.get("/update/:key/:value", function (req, res) {
  //component name key
  const key = req.params.key;
  //component value
  let value = Number(req.params.value);

  //TODO: use the redis client to update the value associated with the given key
  client.GET(key, function (err, reply) {
    //new value
    value = Number(reply) + value;
    client.SET(key, value);

    //return data to client - update UI and database values
    data().then((data) => {
      console.log(data);
      res.send(data);
    });
  });
});

// get key data
app.get("/data", function (req, res) {
  data().then((data) => {
    console.log(data);
    res.send(data);
  });
});

app.listen(3000, () => {
  console.log("Running on 3000");
});

process.on("exit", function () {
  client.quit();
});
