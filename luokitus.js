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

// Reitti luokitukselle
app.post('/luokitus', (req, res) => {
  const { asia } = req.body;

  // Tässä on yksinkertainen luokitusalgoritmi
  let luokitus = 0;
  
  // Jos asia sisältää negatiivisia sanoja
  if (asia.includes("murha") || asia.includes("väkivalta") || asia.includes("varkaus")) {
    luokitus = -1;
  }
  // Jos asia sisältää positiivisia sanoja
  else if (asia.includes("rakkaus") || asia.includes("ilo") || asia.includes("totuus")) {
    luokitus = 1;
  }

  // Palautetaan luokitus JSON-muodossa
  res.json({ asia, luokitus });
});

// Käynnistä palvelin
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Palvelin käynnissä portissa ${PORT}`);
});
