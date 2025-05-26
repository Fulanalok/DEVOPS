const request = require("supertest");
const express = require("express");
const app = express();

app.use(express.json());
app.post("/test", (req, res) => {
  const { email } = req.body;
  if (email === "admin@test.com") return res.sendStatus(200);
  return res.sendStatus(400);
});

test("Email válido retorna 200", async () => {
  await request(app)
    .post("/test")
    .send({ email: "admin@test.com" })
    .expect(200);
});
