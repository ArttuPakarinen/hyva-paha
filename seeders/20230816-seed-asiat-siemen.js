'use strict';

const fs = require('fs');
const path = require('path');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Lue JSON-tiedosto
    const asiatData = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, '../aineisto.json'), 'utf8')
    );

    // Lisää createdAt ja updatedAt jokaiseen objektiin
    const asiatWithTimestamps = asiatData.map(asia => ({
      ...asia,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    // Lisää tiedot tietokantaan
    return queryInterface.bulkInsert('Asiat', asiatWithTimestamps);
  },

  down: async (queryInterface, Sequelize) => {
    // Poista kaikki tietueet 'Asiat' taulusta
    return queryInterface.bulkDelete('Asiat', null, {});
  }
};
