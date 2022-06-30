const { Schema, model } = require(`mongoose`);


const messageSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: `User`,
      required: true
    },
    event: {
      type: Schema.Types.ObjectId,
      ref: `Event`,
      required: true
    },
    message: {
      type: String,
      required: true,
      maxLength: [300, `must not exceed 300 characters in length`],
      trim: true
    },
  },
  {
    timestamps: true
  }
);


const Message = model(`Message`, messageSchema);

module.exports = Message;


