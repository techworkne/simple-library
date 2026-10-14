import express from 'express';
import { readBooks, writeBooks, nextId } from '../storage.js'
import { withStatus, today } from '../helpers.js';

const router = express.Router();

const findBook = (books, id) => books.find((b) => b.id === Number(id));

function checkFields(body) {
    const title = String(body.title ?? '').trim();
    const author = String(body.author ?? '').trim();
    const year = Number(body.year);
    if (!title || !author) return { error: 'Укажите название и автора' };
    if (!Number.isInteger(year) || year < 1 || year > new Date().getFullYear()) {
        return { error: "Неккоректный год" };
    }
    return { data: { title, author, year } };
}

router.get('/', (req, res) => {
    const { status = 'all' } = req.query;
    if (!['all', 'available', 'overdue', 'issued'].includes(status)) {
        return res.status(400).json({ message: 'Неизвестный фильтр status ' });
    }
    let books = readBooks().map(withStatus);
    if (status !== 'all') books = books.filter((b) => b.status === status);
    res.json(books);
});

router.get('/:id', (req, res) => {
    const book = findBook(readBooks(), req.params.id);
    if (!book) return res.status(404).json({ message: 'Книга не найдена' });
    res.json(withStatus(book));
});


// добавить книгу
router.post('/', (req, res) => {
    const { data, error } = checkFields(req.body);
    if (error) return res.status(400).json({ message: error });
    const books = readBooks();
    const book = { id: nextId(books), ...data, borrower: null };
    books.push(book);
    writeBooks(books);
    res.status(201).json(withStatus(book));
});


// изменить инфо
router.put('/:id', (req, res) => {
    const { data, error } = checkFields(req.body);
    if (error) return res.status(400).json({ message: error });

    const books = readBooks();
    const book = findBook(books, req.params.id);
    if (!book) return res.status(404).json({message: 'Книга не найдена'});
    Object.assign(book, data);
    writeBooks(books);
    res.json(withStatus(book))
});

router.delete('/:id', (req, res) => {
    const books = readBooks();
    const index = books.findIndex((b) => b.id === Number(req.params.id));
    if (index === -1) return res.status(404).json({ message: 'Книга не найдена' });
    books.splice(index, 1);
    writeBooks(books);
    res.status(204).end();
});

// выдача
router.post('/:id/checkout', (req, res) => {
    const name = String(req.body.name ?? '').trim();
    const dueDate = String(req.body.dueDate ?? '');
    if (!name) return res.status(400).json({ message: 'Укажите имя читателя' });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate) || dueDate < today()) return res.status(400).json({ message: 'Неверная дата возврата' });
    
    const books = readBooks();
    const book = findBook(books, req.params.id);
    if (!book) return res.status(404).json({ message: "Книга не найден" });
    if (book.borrower) return res.status(409).json({ message: "Книга уже выдана" });

    book.borrower = {name, issuedAt: today(), dueDate};
    writeBooks(books);
    res.json(withStatus(book));
});

// возврат
router.post('/:id/return', (req, res) => {
  const books = readBooks();
  const book = findBook(books, req.params.id);
  if (!book) return res.status(404).json({ message: 'Книга не найдена' });
  if (!book.borrower) return res.status(409).json({ message: 'Книга и так в библиотеке' });

  book.borrower = null;
  writeBooks(books);
  res.json(withStatus(book));
});

export default router;