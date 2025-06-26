import nodemailer from "nodemailer";
import User from "@/model/user";
import dbConnect from "@/lib/mongoose";

export const sendAndGenerateOTP = async (email: string) => {
  await dbConnect();

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  user.otp = otp;
  user.otpExpiry = otpExpiry;
  await user.save();

  // Validate env
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("Email credentials not set in .env");
  }

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP for Password Reset",
    html: `<p>Your OTP is <strong>${otp}</strong>. It will expire in 10 minutes.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[DEV] OTP sent to ${email}`);
  } catch (error) {
    console.error("❌ Failed to send OTP email:", error);
    throw new Error("Failed to send email. Try again later.");
  }

  return { success: true, message: "OTP sent successfully" };
};
