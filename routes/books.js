const express = require('express');
const router = express.Router();
const db = require('../models');
const Book = db.Book;
const { Op } = db.Sequelize;

const MAXITEMSPERPAGE = 5;

function getPages(count,offset){
  const totalpages =  (count * 1.0)/MAXITEMSPERPAGE;
  let pages = [];
  for (var i = 0; i < totalpages; i++){
      let start = i * MAXITEMSPERPAGE;
      let isActive = offset/MAXITEMSPERPAGE == i;
      pages.push( { start, label: i, isActive });
  }
  return pages;
}

/* GET matching books listing. */
router.get(['/','/search'], async (req, res, next) => {
  const q = req.query.q? req.query.q : '' ;
  const offset = req.query.start? req.query.start : 0;

  let totalCount;
  let books;
  await Book.findAndCountAll({
    limit: MAXITEMSPERPAGE,
    offset: offset,
    order:[ ["title", 'ASC'] ],
    where:{
      [Op.or]: [
           {title:  {[Op.substring]: q}},
           {author: {[Op.substring]: q}},
           {genre:  {[Op.substring]: q}},
           {year: q}
          ]
    }}).then(function(result) {
      totalCount = result.count;
      books = result.rows;
    });
  
  const pages = getPages(totalCount, offset);

  res.render("books/index", { books, title: "Books", q, pages});

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