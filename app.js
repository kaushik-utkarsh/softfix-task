const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./DB/db');
const authRoutes = require('./Routes/users');
const postRoutes = require('./Routes/posts');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));