const express = require('express');
const router = express.Router();
const Book = require('../models').Book;


/* GET books listing. */
router.get('/', async (req, res, next) => {
    const books = await Book.findAll({order:[ ["title", 'ASC'] ] });
    res.render("books/index", { books, title: "Books"});
});

/* Create a new Book form. */
router.get('/new', (req, res) => {
    res.render("books/new-book", { book: {}, title:"New Book" });
});

/* POST create Book. */
router.post('/new', async (req, res) => {
    let book;
    try {
      book = await Book.create(req.body);
      res.redirect("/books/"); //redirect to the books listing page.
    } catch (error) {
      if(error.name === "SequelizeValidationError") { // checking the error
        book = await Book.build(req.body);
        res.render("books/new-book", { book, errors: error.errors, title:"New Book"})
      } else {
        throw error;
      }  
    }
});

/* Edit book form. */
router.get('/:id', async (req, res, next) => {
    const book = await Book.findByPk(req.params.id);
    if(book) {
      res.render("books/update-book", { book, title: "Update Book" });      
    } else {
      next(); //trigger the global 404 error handle
    }
});

/* Update an book. */
router.post('/:id', async (req, res, next) => {
    let book;
    try {
      book = await Book.findByPk(req.params.id);
      if(book) {
        await book.update(req.body);
        res.redirect("/books/"); //redirect to the books listing page.
      } else {
        next(); //trigger the global 404 error handle
      }
    } catch (error) {
      if(error.name === "SequelizeValidationError") {
        book = await Book.build(req.body);
        book.id = req.params.id; // make sure correct book gets updated
        res.render("books/update-book", { book, errors: error.errors, title: "Update Book" })
      } else {
        throw error;
      }
    }
});

/* Delete individual book. */
router.post('/:id/delete', async (req ,res, next) => {
    const book = await Book.findByPk(req.params.id);
    if(book) {
      await book.destroy();
      res.redirect("/books");
    } else {
      next(); //trigger the global 404 error handle
    }
});

module.exports = router;