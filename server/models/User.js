import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema({
  _id: { type: String, required: true },  // custom string _id like "doc_123"
  title: String,
  content: String,
  createdAt: String,
  isPublic: Boolean,
  sourceRequest: Object,
}, { _id: false }); // prevent auto-generating ObjectId

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  plan: { type: String, default: 'Free' },
  tokens: { type: Number, default: 10 },
  documents: [DocumentSchema],
  resetToken: String, // Moved to UserSchema
  resetTokenExpiry: Date, // Moved to UserSchema
});

export default mongoose.model('User', UserSchema);