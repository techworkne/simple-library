import apiRouter from './routes/api.js';
import express from "express";
import path from "node:path";
import { readBooks } from './storage.js';
import { withStatus } from './helpers.js';

const __dirname = import.meta.dirname;
const app = express();
const PORT = 4000;

app.set("view engine", 'pug');
app.set('views', path.join(__dirname, 'views'));


app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('vendor/fontawesome', express.static(path.join(__dirname, 'node_modules/@fortawesoma/fontawesome-free')))

app.locals.formatDate = (iso) => iso.split('-').reverse().join('.');

app.use(express.json());
app.use('/api/books', apiRouter);

app.get('/', (req, res) => {
  const books = readBooks();
  res.render('index', { title: 'Книги', books: books.map(withStatus) });
});

app.get('/book/:id', (req, res) => {
  const books = readBooks();
  const book = books.find((b) => b.id === Number(req.params.id));
  if (!book) {
    return res.status(404).render('404', { title: 'Книга не найдена' });
  }
  res.render('book', { title: book.title, book: withStatus(book) });
});

app.listen(PORT, () => {
    console.log('сервер запущен');
});