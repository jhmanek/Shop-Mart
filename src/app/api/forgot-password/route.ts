// // app/api/forgot-password/route.ts

// import { NextResponse } from "next/server";
// import { sendAndGenerateOTP } from "@//lib/mailer";

// export async function POST(req: Request) {
//   const { email } = await req.json();

//   try {
//     const result = await sendAndGenerateOTP(email);
//     return NextResponse.json(result, { status: 200 });
//   } catch (error: any) {
//     return NextResponse.json(
//       { success: false, message: error.message },
//       { status: 400 }
//     );
//   }
// }
import { NextResponse } from "next/server";
import { sendAndGenerateOTP } from "@/lib/mailer"; // make sure this path is correct

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body || typeof body.email !== "string" || body.email.trim() === "") {
      return NextResponse.json(
        { success: false, message: "Email is required." },
        { status: 400 }
      );
    }

    const email = body.email.trim();
    const result = await sendAndGenerateOTP(email);

    return NextResponse.json(
      { success: true, message: "OTP sent successfully", result },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in forgot-password route:", error);
    return NextResponse.json(
      { success: false, message: "Invalid JSON input or server error." },
      { status: 400 }
    );
  }
}
