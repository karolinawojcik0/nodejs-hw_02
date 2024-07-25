import gravatar from 'gravatar';
import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const { Schema } = mongoose;

const userSchema = new Schema({
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
  },
  subscription: {
    type: String,
    enum: ["starter", "pro", "business"],
    default: "starter"
  },
  token: {
    type: String,
    default: null,
  },
  avatarURL: {
    type: String,
    default: function() {
      return gravatar.url(this.email, { s: '250', d: 'retro' }, true);
    }
  },
  verify: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    default: () => nanoid(),
  }
});

const User = mongoose.model('User', userSchema);

export default User;
