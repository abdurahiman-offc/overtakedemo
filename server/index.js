import app, { connectDB } from '../api/index.js';

const PORT = process.env.PORT || 5001;

// Proactively connect to DB on start to avoid initial request lag
connectDB().catch(err => console.error('Initial DB connection failed:', err));

app.listen(PORT, () => {
    console.log(`Local development server running on port ${PORT}`);
});
