import express from "express";
import path from "node:path";


const __dirname = import.meta.dirname;
const app = express();
const PORT = 4000;

app.set("view engine", 'pug');
app.set('views', path.join(__dirname, 'views'));


app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('vendor/fontawesome', express.static(path.join(__dirname, 'node_modules/@fortawesoma/fontawesome-free')))


const books = [
  { id: 1, title: 'Мастер и Маргарита', author: 'Михаил Булгаков', year: 1967, borrower: null },
  { id: 2, title: 'Преступление и наказание', author: 'Фёдор Достоевский', year: 1866,
    borrower: { name: 'Анна Петрова', issuedAt: '2026-09-15', dueDate: '2026-09-30' } },
  { id: 3, title: 'Война и мир', author: 'Лев Толстой', year: 1869, borrower: null },
  { id: 4, title: '1984', author: 'Джордж Оруэлл', year: 1949,
    borrower: { name: 'Иван Смирнов', issuedAt: '2026-10-10', dueDate: '2026-10-25' } },
  { id: 5, title: 'Евгений Онегин', author: 'Александр Пушкин', year: 1833, borrower: null },
  { id: 6, title: 'Собачье сердце', author: 'Михаил Булгаков', year: 1925,
    borrower: { name: 'Мария Орлова', issuedAt: '2026-09-01', dueDate: '2026-09-20' } },
];


function getStatus(book) {
    if (!book.borrowed) return 'available';
    const today = new Date().toISOString.slice(0, 10);
    return book.borrowed.dueDate < today ? 'overdue' : 'issued';
}

const withStatus = (book) => ({ ...book, status: getStatus(book) });

app.locals.formatDate = (iso) => iso.split('-').reverse().join('.');

app.get('/', (req, res) => {
    res.render('index', { title: 'Книги', books: books.map(withStatus) });
});

app.get('/book/:id', (req, res) => {
  const book = books.find((b) => b.id === Number(req.params.id));
  if (!book) {
    return res.status(404).render('404', {title: 'Книга не найдена'});
  }
  res.render('book', { title: book.title, book: withStatus(book) });
});

app.use((req, res) => {
  res.render('404', { title: 'Страница не найдена' });
});

app.listen(PORT, () => {
    console.log('сервер запущен');
});