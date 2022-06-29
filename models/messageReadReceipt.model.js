const { Schema, model } = require(`mongoose`);

const messageReceiptSchema = new Schema(
  {
    received: [
      {
        by: {
          type: Schema.Types.ObjectId,
          ref: `User`,
          required: true
        },
        at: {
          type: Date,
          required: true
        }
      }
    ],
    seen: [
      {
        by: {
          type: Schema.Types.ObjectId,
          ref: `User`,
          required: true
        },
        at: {
          type: Date,
          required: true
        }
      }
    ]
  }
)

// TODO: add static methods: makeReceived; makeSeen

const MessageReceipt = model(`MessageReceipt`, messageReceiptSchema);

module.exports = MessageReceipt;