const { sendPrompt } = require('./openai');
const { SELITE_MAX_LENGTH } = require('./appConfig.js');
const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');

// Luo Express-sovellus
const app = express();

const bodyParser = require('body-parser');
const path = require('path');

app.use(bodyParser.json());

// Palvelee index.html-tiedoston
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'application/index.html'));
});

app.get('/styles.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'application/styles.css'));
});

app.get('/asiat', (req, res) => {
    res.sendFile(path.join(__dirname, 'application/asiat.html'));
});

app.use(express.json());

// Yhdistä SQLite-tietokantaan
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'asiat.sqlite' // Tietokantatiedoston nimi
});

const Asiat = require('./models/asiat')(sequelize, DataTypes); // Passing sequelize and DataTypes

// Synkronoi tietokanta
sequelize.sync()
  .then(() => console.log('Tietokanta synkronoitu'))
  .catch(err => console.error('Virhe tietokannan synkronoinnissa:', err));

// Reitit

// Luo uusi "Asia"
// Luo uusi "Asia"
app.post('/api/asiat', async (req, res) => {
    try {
      let { asia, selite, luokitus } = req.body;
  
      let vastaus = {
        asia,
        selite,
        seliteOnnistui: undefined,
        luokitus: undefined,
        luokitusOnnistui: undefined,
        onnistuminen: false,
        virhe: 'Ei virhettä'
      };
  
      // Tarkista, onko asia määritetty
      if (!asia) {
        vastaus.selite = '...';
        vastaus.seliteOnnistui = true;
        vastaus.luokitus = 0;
        vastaus.onnistuminen = true;
        res.status(201).json({ vastaus });
        return;
      }
  
      // Jos selite puuttuu, luodaan se OpenAI:n avulla
      if (!selite) {
        const prompt = `Selitä maximissaan ${SELITE_MAX_LENGTH} merkillä mikä seuraava asia on: "${asia}"`;
        // const prompt = `Anna maximissaan ${SELITE_MAX_LENGTH} merkin pituinen selite seuraavasta aiheesta: "${asia}"`;
        try {
          const response = await sendPrompt(prompt);
          console.log("selite vastaus", response);
          vastaus.selite = selite = response;
          vastaus.seliteOnnistui = true;
        } catch (error) {
          console.error('Virhe viestin lähetyksessä:', error);
          vastaus.virhe = 'Virhe selitteen generoinnissa';
          res.status(500).json(vastaus);
          return;
        }
      }
  
      // Jos luokitus puuttuu, haetaan se OpenAI:n avulla
      if (!luokitus) {
        const prompt = `Luokittele seuraava selite "${selite}" hyvän ja pahan välillä arvolla -1 - 1. Anna vastauksena pelkkä arvo -1 ja 1 välillä.`;
        try {
          const response = await sendPrompt(prompt);
          console.log("luokitus vastaus", response);
          vastaus.luokitus = luokitus = Number(response);
          vastaus.luokitusOnnistui = true;
        } catch (error) {
          console.error('Virhe viestin lähetyksessä:', error);
          vastaus.virhe = 'Virhe luokituksen generoinnissa';
          res.status(500).json(vastaus);
          return;
        }
      }
  
      // Luo uusi tietue tietokantaan
      try {
        const uusiAsia = await Asiat.create({ asia, selite, luokitus });
        vastaus.onnistuminen = true;
        res.status(201).json(vastaus);
      } catch (error) {
        console.error('Virhe tietokannan päivityksessä:', error);
        vastaus.virhe = 'Virhe tietokannan päivityksessä';
        res.status(500).json(vastaus);
      }
  
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });  

// Hae kaikki "Asiat"
app.get('/api/asiat', async (req, res) => {
  try {
    const asiat = await Asiat.findAll();
    res.json(asiat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Hae yksittäinen "Asia" ID:llä
app.get('/api/asiat/:id', async (req, res) => {
  try {
    const asia = await Asiat.findByPk(req.params.id);
    if (asia) {
      res.json(asia);
    } else {
      res.status(404).json({ error: 'Asiaa ei löytynyt' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Päivitä "Asia" ID:llä
app.put('/api/asiat/:id', async (req, res) => {
  try {
    const { asia, selite, luokitus } = req.body;
    const [updated] = await Asiat.update({ asia, selite, luokitus }, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedAsia = await Asiat.findByPk(req.params.id);
      res.json(updatedAsia);
    } else {
      res.status(404).json({ error: 'Asiaa ei löytynyt' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Poista "Asia" ID:llä
app.delete('/api/asiat/:id', async (req, res) => {
  try {
    const deleted = await Asiat.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      res.status(204).json();
    } else {
      res.status(404).json({ error: 'Asiaa ei löytynyt' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Käynnistä palvelin
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Palvelin käynnissä portissa ${PORT}`);
});
