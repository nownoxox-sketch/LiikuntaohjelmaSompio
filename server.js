const express = require("express");
const session = require("express-session");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: "salaisuus123",
  resave: false,
  saveUninitialized: false
}));

// Sallitut käyttäjät
const USERS = {
  "ope": "1234",
  "liikka": "salasana"
};

// Kirjautuminen
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (USERS[username] === password) {
    req.session.user = username;
    return res.redirect("/editor.html");
  }

  res.send("Väärä käyttäjätunnus tai salasana");
});

// Suojaa muokkaussivu
app.use("/editor.html", (req, res, next) => {
  if (!req.session.user) return res.redirect("/login.html");
  next();
});

// Muokkaus / päivitys
app.post("/update", (req, res) => {
  let { week, paikka, kakso, ykso } = req.body;

  // Lue nykyinen json
  let data = JSON.parse(fs.readFileSync("ohjelma.json", "utf8"));

  // Päivitä viikko
  data[week] = {
    paikka: paikka,
    kakso: kakso,
    yksö: ykso
  };

  // Kirjoita takaisin tiedostoon
  fs.writeFileSync("ohjelma.json", JSON.stringify(data, null, 2));

  res.send("Tallennettu! <a href='/editor.html'>Takaisin</a>");
});

app.use(express.static(path.join(__dirname)));

app.listen(3000, () => console.log("Serveri käynnissä http://localhost:3000"));
