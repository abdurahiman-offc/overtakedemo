import mongoose from 'mongoose';

const tagSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    color: { type: String, default: 'bg-gray-100 text-gray-700' }
}, { timestamps: true });

export default mongoose.model('Tag', tagSchema);
