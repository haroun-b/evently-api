const { Schema, model } = require(`mongoose`);


const eventSchema = new Schema(
  {
    creator: { type: Schema.Types.ObjectId, ref: 'User' },
    title: {
      type: String,
      required: true,
      maxLength: [50, `must not exceed 50 characters in length`],
      trim: true
    },
    location: {
      // follow the api
    },
    startAt: {
      type: Date
    },
    endAt: {
      type: Date
    },
    attendees: {
      minimum: Number,
      maximum: Number
    },
    price: {
      type: Number,
      min: 0,
      default: 0
    },
    description: {
      type: String,
      maxLength: [300, `must not exceed 300 characters in length`],
    },
    type: {
      type: String,
      enum : ['Art & Culture','Career & Business', 'Sport'],  // ripoff meetup
    },
    approvalRequired: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true
  }
);

const Event = model(`Event`, eventSchema);

module.exports = Event;