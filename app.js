const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');

// Luo Express-sovellus
const app = express();
app.use(express.json());

// Yhdistä SQLite-tietokantaan
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'asiat.sqlite' // Tietokantatiedoston nimi
});

// Määrittele "Asiat"-taulu
const Asiat = sequelize.define('Asiat', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  asia: {
    type: DataTypes.TEXT, // Määrättömän suuri tekstikenttä
    allowNull: false
  },
  selite: {
    type: DataTypes.STRING(250), // Rajoitettu 250 merkkiin
    allowNull: false
  },
  luokitus: {
    type: DataTypes.INTEGER, // Luokitus -1 - 1
    validate: {
      min: -1,
      max: 1
    },
    allowNull: false
  }
}, {
  timestamps: false
});

// Synkronoi tietokanta
sequelize.sync()
  .then(() => console.log('Tietokanta synkronoitu'))
  .catch(err => console.error('Virhe tietokannan synkronoinnissa:', err));

// Reitit

// Luo uusi "Asia"
app.post('/asiat', async (req, res) => {
  try {
    const { asia, selite, luokitus } = req.body;
    const uusiAsia = await Asiat.create({ asia, selite, luokitus });
    res.status(201).json(uusiAsia);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Hae kaikki "Asiat"
app.get('/asiat', async (req, res) => {
  try {
    const asiat = await Asiat.findAll();
    res.json(asiat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Hae yksittäinen "Asia" ID:llä
app.get('/asiat/:id', async (req, res) => {
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
app.put('/asiat/:id', async (req, res) => {
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
app.delete('/asiat/:id', async (req, res) => {
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
