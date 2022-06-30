const { Schema, model } = require(`mongoose`);


const badgeSchema = new Schema(
  {
    name: String,
    imageUrl: String
  },
);

const Badge = model(`Badge`, badgeSchema);

module.exports = Badge;