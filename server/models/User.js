import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema({
  id: String,
  title: String,
  content: String,
  createdAt: String,
  isPublic: Boolean,
  sourceRequest: Object,
});

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  plan: { type: String, default: 'Free' },
  tokens: { type: Number, default: 3 },
  documents: [DocumentSchema],
});

export default mongoose.model('User', UserSchema);