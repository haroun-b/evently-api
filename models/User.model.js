const { Schema, model } = require(`mongoose`);

const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
      maxLength: [20, `must not exceed 20 characters in length`],
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
    },
    email: {
      type: String,
      unique: true,
      validate: {
        validator: (str) => {
          if (str.length > 254) {
            return false;
          }
          if (str.split(`@`)[0].length > 64) {
            return false;
          }

          const emailRegex =
            /^[a-z][-_+\.]?(([a-z]|\d)+[-_+\.]?)+([a-z]|\d)@(([a-z]|\d)+-?)+([a-z]|\d)(\.[a-z](([a-z]|\d)-?){0,30}([a-z]|\d))$/g;

          return str.match(emailRegex) !== null;
        },
        message: (email) => `${email.value} is not a valid email`,
      },
    },
    name: {
      type: String,
      maxLength: [50, `must not exceed 50 characters in length`],
      trim: true,
    },
    bio: {
      type: String,
      maxLength: [300, `must not exceed 300 characters in length`],
      trim: true,
    },
    imageUrl: {
      type: String,
      default:
        "https://res.cloudinary.com/dh1pzjhka/image/upload/v1656926132/evently-app/pp-fb_llnyub.jpg",
    },
    badges: [{ type: Schema.Types.ObjectId, ref: "Badge" }],
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = model(`User`, userSchema);

module.exports = User;
