'use strict';
const { SELITE_MAX_LENGTH } = require('../appConfig.js');
module.exports = (sequelize, DataTypes) => {
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
          type: DataTypes.STRING(SELITE_MAX_LENGTH), // Rajoitettu 256 merkkiin
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
        freezeTableName: true, // Tämä estää monikollistamisen
      });

  return Asiat;
};