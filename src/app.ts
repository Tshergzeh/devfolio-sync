import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Devfolio Sync API is live');
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
