'use strict';
const Sequelize = require('sequelize');
const moment = require('moment');

module.exports = (sequelize) => {
  class Book extends Sequelize.Model { }

  Book.init({
    title: {
      type: Sequelize.STRING,
      validate: {
        notEmpty: {
          msg: '"Title" is required'
        }
      }
    },
    author: {
        type: Sequelize.STRING,
        validate: {
          notEmpty: {
            msg: '"author" is required'
          }
        }
    },
    genre: Sequelize.TEXT,
    year : Sequelize.INTEGER
  }, { sequelize });

  return Book;
};