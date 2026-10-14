const body = document.getElementById("books-body")
const template = document.getElementById("book-row")
const tags = document.querySelectorAll(".tag")
const addBtn = document.getElementById('add-book-btn');
const addDialog = document.getElementById('add-dialog');
const addForm = document.getElementById('add-form');
const addError = document.getElementById('add-error');
const deleteDialog = document.getElementById('delete-dialog');
const deleteText = document.getElementById('delete-text');
const deleteConfirm = document.getElementById('delete-confirm');

let currentStatus = 'all';
let deleteId = null;

const formatDate = (iso) => iso.split('-').reverse().join('.')

function createRow(book) {
    const row = template.content.cloneNode(true);
    const tr = row.querySelector('tr');
    tr.dataset.id = book.id;
    row.querySelector('.books__title').textContent = book.title;
    row.querySelector('.books__author').textContent = book.author;
    row.querySelector('.books__year').textContent = book.year;
    row.querySelector('.books__actions a').href = `/books/${book.id}`;

    const badge = row.querySelector('.badge');
    if (book.status === 'available') {
        badge.classList.add('badge--ok');
        badge.textContent = 'В наличии';   
    } else if (book.status === "overdue") {
        badge.classList.add('badge--danger');
        badge.textContent = 'Просрочена';
    } else {
        badge.classList.add('badge--neutral');
        badge.textContent = `Выдана до ${formatDate(book.borrower.dueDate)}`;
    }

    return row;
}

function showMessage(text) {
    body.innerHTML = '';
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 5;
    td.textContent = text;
    tr.appendChild(td);
    body.appendChild(tr);
}


function render(books) {
    if (books.length === 0) {
        showMessage('Книг не найдено');
        return;
    }

    body.innerHTML = '';
    books.forEach((book) => body.appendChild(createRow(book)));
}


async function loadBooks(status) {
    try {
        const response = await fetch(`/api/books?status=${status}`);
        if (!response.ok) throw new Error(`Ошибка ${response.status}`);
        const books = await response.json();
        render(books);
    } catch (error) {
        showMessage('Не удалось загрузить спсиок книг. Попробуйте еще раз.');
        console.error(error);
    }
}

tags.forEach((tag) => {
    tag.addEventListener('click', () => {
        tags.forEach((c) => c.classList.remove('tag--active'));
        tag.classList.add('tag--active');
        currentStatus = tag.dataset.status;
        loadBooks(tag.dataset.status);
    });
}); 

document.querySelectorAll('[data-close]').forEach((btn) => {
    btn.addEventListener('click', () => btn.closest('dialog').close());
});

addBtn.addEventListener('click', () => {
    addForm.reset();
    addError.textContent = '';
    addDialog.showModal();
});

addForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    addError.textContent = '';
    const data = Object.fromEntries(new FormData(addForm));

    try {
        const response = await fetch('/api/books', {
            method: 'POST',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            addError.textContent = error.message;
            return;
        }
        addDialog.close();
        loadBooks(currentStatus);
    } catch (error) {
        addError.textContent = 'Неудалсь отправить данные. Попробуйте еще раз.';
        console.error(error);
    }
});

body.addEventListener('click', (event) => {
    const btn = event.target.closest('.icon-btn--danger');
    if (!btn) return;
    const tr = btn.closest('tr');
    deleteId = tr.dataset.id;
    const title = tr.querySelector('.books__title').textContent;
    deleteText.textContent = `Книга ${title} будет удалена без возможности восстановления.`;
    deleteDialog.showModal();
});

deleteConfirm.addEventListener('click', async () => {
    try {
        const response = await fetch(`/api/books/${deleted}`, { method: 'DELETE' });
        if (!response.ok) throw new Error(`Ошибка ${response.status}`);
        deleteDialog.close();
        loadBooks(currentStatus);
    } catch (error) {
        deleteText.textContent = 'Не удалось удалить книгу. Попробуйте ещё раз.';
        console.error(error);
    }
});