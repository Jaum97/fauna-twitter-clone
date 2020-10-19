const app = require("express")();

const FaunaDB = require("faunadb");

const dotenv = require("dotenv/config");

const {
  Paginate,
  Get,
  Ref,
  Match,
  Index,
  Create,
  Collection,
  Join,
  Call,
  Function: FaunaFn,
} = FaunaDB.query;

const client = new FaunaDB.Client({ secret: process.env.FAUNA_SECRET });

app.get("/tweet/:id", async (req, res) => {
  const getTweetById = Get(Ref(Collection("tweets"), req.params.id));

  const doc = await client.query(getTweetById).catch((e) => res.send(e));

  res.send(doc);
});

app.get("/tweet", async (req, res) => {
  const getTweetsByUser = Paginate(
    Match(Index("tweets_by_user"), Call(FaunaFn("getUser"), "joao_medeiros"))
  );

  const doc = await client.query(getTweetsByUser).catch((e) => res.send(e));

  res.send(doc);
});

app.get("/feed", async (req, res) => {
  const getFeed = Paginate(
    Join(
      Match(
        Index("followers_by_followee"),
        Call(FaunaFn("getUser"), "joao_medeiros")
      ),
      Index("tweets_by_user")
    )
  );

  const docs = await client.query(getFeed).catch((e) => res.send(e));

  res.send(docs);
});

app.post("/tweet", async (req, res) => {
  const data = {
    user: Call(FaunaFn("getUser"), "test_dev"),
    text: "Hola mundo!",
  };

  const createTweet = Create(Collection("tweets"), { data });

  const doc = await client.query(createTweet).catch((e) => res.send(e));

  res.send(doc);
});

app.post("/relationship", async (req, res) => {
  const data = {
    follower: Call(FaunaFn("getUser"), "test_dev"),
    followee: Call(FaunaFn("getUser"), "joao_medeiros"),
  };

  const createRelation = Create(Collection("relationships"), { data });

  const doc = await client.query(createRelation).catch((e) => res.send(e));

  res.send(doc);
});

app.listen(5000, () => console.log("API on http://localhost:5000"));
