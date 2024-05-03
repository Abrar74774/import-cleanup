// server.js
import express from 'express';
import path from 'path';
import routes from './routes.js';
import { config } from 'dotenv';
config() // Create the .env file

const app = express();


// Middleware
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));
app.use(express.static(process.env.PATH_TO_FRONTEND || './frontend'))

// Routes
app.use('/', routes);


const PORT = process.env.PORT || 3003;
console.log(process.env.PORT)
app.listen(PORT, () => {
    console.log(`Frontend served on  http://localhost:${PORT}`);
});
