const { Schema, model } = require(`mongoose`);

const attendanceRequestSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["Pending", "Approved"] },
    event: { type: Schema.Types.ObjectId, ref: "Event" },
  },
  {
    timestamps: true,
  }
);

const AttendanceRequest = model(`AttendanceRequest`, attendanceRequestSchema);

module.exports = AttendanceRequest;
