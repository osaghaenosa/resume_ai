import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
    id: String,
    title: String,
    content: String,
    createdAt: String,
});

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    plan: { type: String, default: 'Free' },
    tokens: { type: Number, default: 3 },
    documents: [documentSchema]
});

<<<<<<< HEAD
export default mongoose.model('User', userSchema);
=======
export default mongoose.model('User', userSchema);
>>>>>>> 03bf448cee3561e1b68a09c508de34705e343ff5
