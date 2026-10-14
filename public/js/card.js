const card = document.getElementById('card');
const id = card.dataset.id;
const message = document.getElementById('card-message');

async function request(url, method, data) {
    const response = await fetch(url, {
        method,
        headers: { 'Content-type': 'application/json' },
        body: data ? JSON.stringify(data) : undefined,
    });
    const result = response.status === 204 ? null : await response.json();
    if (!response.ok) throw new Error(result.message);
    return result;
}

function showMessage(text, ok = false) {
    message.textContent = text;
    message.classList.toggle('card__message--ok', ok);
}

document.querySelectorAll('[data-close]').forEach((btn) => {
    btn.addEventListener('click', () => btn.closest('dialog').close());
});

// сохранить
document.getElementById('save-btn').addEventListener('click', async () => {
    showMessage('');
    try {
        const book = await request(`/api/books/${id}`, 'PUT', {
            title: document.getElementById('title').value,
            author: document.getElementById('author').value,
            year: document.getElementById('year').value,
        });
        document.getElementById('card-title').textContent = book.title;
        showMessage('Изменения сохранены', true);
    } catch (error) {
        showMessage(error.message);
    }
});

// выдать
const checkoutBtn = document.getElementById('checkout-btn');
if (checkoutBtn) {                                // кнопка есть, только если книга в библиотеке
    const dialog = document.getElementById('checkout-dialog');
    const form = document.getElementById('checkout-form');
    const error = document.getElementById('checkout-error');
    const dateInput = document.getElementById('checkout-date');

    checkoutBtn.addEventListener('click', () => {
        form.reset();
        error.textContent = '';
        dateInput.min = new Date().toISOString().slice(0, 10);   // раньше сегодняшнего дня выбрать нельзя
        dialog.showModal();
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        try {
            await request(`/api/books/${id}/checkout`, 'POST', Object.fromEntries(new FormData(form)));
            location.reload();                    // страница перерисуется с новым статусом
        } catch (err) {
            error.textContent = err.message;
        }
    });
}

// вернуть
const returnBtn = document.getElementById('return-btn');
if (returnBtn) {
    returnBtn.addEventListener('click', async () => {
        try {
            await request(`/api/books/${id}/return`, 'POST');
            location.reload();
        } catch (error) {
            showMessage(error.message);
        }
    });
}

// удалить
const deleteDialog = document.getElementById('delete-dialog');
document.getElementById('delete-btn').addEventListener('click', () => {
    document.getElementById('delete-error').textContent = '';
    deleteDialog.showModal();
});

document.getElementById('delete-confirm').addEventListener('click', async () => {
    try {
        await request(`/api/books/${id}`, 'DELETE');
        location.href = '/';                      // книги больше нет, возвращаемся к списку
    } catch (error) {
        document.getElementById('delete-error').textContent = error.message;
    }
});