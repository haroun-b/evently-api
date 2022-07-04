const { Schema, model } = require(`mongoose`);

const eventSchema = new Schema(
  {
    creator: { type: Schema.Types.ObjectId, ref: "User" },
    title: {
      type: String,
      required: true,
      maxLength: [50, `must not exceed 50 characters in length`],
      trim: true,
    },
    address: {
      city: String,
      postcode: String,
      street: String,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    startAt: {
      type: Date,
    },
    endAt: {
      type: Date,
    },
    attendees: {
      minimum: {
        type: Number,
        min: 1,
        default: 1,
      },
      maximum: {
        type: Number,
        min: 1,
      },
    },
    price: {
      type: Number,
      min: 0,
      default: 0,
    },
    description: {
      type: String,
      maxLength: [300, `must not exceed 300 characters in length`],
    },
    type: {
      type: String,
      enum: [
        "Art & Culture",
        "Writing",
        "Music",
        "Dancing",

        "Games",
        "Pets & Animals",
        "Language",
        "Education",
        "Science",
        "Technology",

        "Career & Business",
        "Politics",
        "Community & envrionment",

        "Parents & Family",
        "Hobbies & Passions",
        "Health & wellbeing",
        "Religion & Spirituality",

        "Sports",
        "Outdoor",
      ],
    },
    imageUrl: {
      type: String,
      default:
        "https://res.cloudinary.com/dh1pzjhka/image/upload/v1656930203/evently-app/event-icon_ixycye.png",
    },
    approvalRequired: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Event = model(`Event`, eventSchema);

module.exports = Event;
