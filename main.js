// server.js
import express from 'express';
import path from 'path';
import routes from './routes.js';
import { config } from 'dotenv';
config()

const app = express();


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(process.env.PATH_TO_FRONTEND || './frontend'))

// Routes
app.use('/', routes);


const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
