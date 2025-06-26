import mongoose, { Schema, models } from "mongoose";

const contactSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
});

const Contact = models.Contact || mongoose.model("Contact", contactSchema);

export default Contact;
