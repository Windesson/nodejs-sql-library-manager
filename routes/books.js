const express = require('express');
const router = express.Router();
const Book = require('../models').Book;

/* Handler function to wrap each route. */
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      if(error.message == 404) 
        res.status(404).render('notFound');
      res.status(500).send(error);
    }
  }
}

/* GET books listing. */
router.get('/', asyncHandler(async (req, res, next) => {
    const books = await Book.findAll({order:[ ["title", 'ASC'] ] });
    res.render("books/index", { books, title: "Books"});
}));

/* Create a new Book form. */
router.get('/new', (req, res) => {
    res.render("books/new", { book: {}, title:"New Book" });
});

/* POST create Book. */
router.post('/new', asyncHandler(async (req, res) => {
    let book;
    try {
      book = await Book.create(req.body);
      res.redirect("/books/" + book.id);
    } catch (error) {
      if(error.name === "SequelizeValidationError") { // checking the error
        book = await Book.build(req.body);
        res.render("books/new", { book, errors: error.errors, title:"New Book"})
      } else {
        throw error;
      }  
    }
}));

/* Edit book form. */
router.get('/:id', asyncHandler(async(req, res) => {
    const book = await Book.findByPk(req.params.id);
    if(book) {
      res.render("books/edit", { book, title: "Update Book" });      
    } else {
      throw new Error("404");
    }
}));

/* Update an book. */
router.post('/:id', asyncHandler(async (req, res, next) => {
    let book;
    try {
      book = await Book.findByPk(req.params.id);
      if(book) {
        await book.update(req.body);
        res.redirect("/books/" + book.id); 
      } else {
        throw new Error("404");
      }
    } catch (error) {
      if(error.name === "SequelizeValidationError") {
        book = await Book.build(req.body);
        book.id = req.params.id; // make sure correct book gets updated
        res.render("books/edit", { book, errors: error.errors, title: "Update Book" })
      } else {
        throw error;
      }
    }
}));

/* Delete individual book. */
router.post('/:id/delete', asyncHandler(async (req ,res) => {
    const book = await Book.findByPk(req.params.id);
    if(book) {
      await book.destroy();
      res.redirect("/books");
    } else {
      throw new Error("404");
    }
}));

module.exports = router;