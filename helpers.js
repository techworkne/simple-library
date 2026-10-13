export const today = () => new Date().toISOString().slice(0, 10);

export function getStatus(book) {
  if (!book.borrower) return 'available';
  return book.borrower.dueDate < today() ? 'overdue' : 'issued';
}

export const withStatus = (book) => ({ ...book, status: getStatus(book) });