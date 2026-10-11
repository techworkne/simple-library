import express from "express";

const app = express();
const PORT = 4000;


app.get('/', (req, res) => {
    res.send('Домашняя библиотека работает.');
});

app.get('/ping', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log('сервер запущен');
});