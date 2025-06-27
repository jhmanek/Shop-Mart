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
import { NextRequest, NextResponse } from "next/server";
import { sendAndGenerateOTP } from "@/lib/mailer";
import { rateLimit } from "@/lib/rateLimiter";

export async function POST(req: NextRequest) {
  // IP-based rate limit
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const allowed = rateLimit(ip, 5, 3000); // 5 req per 3 sec

  if (!allowed) {
    return NextResponse.json(
      {
        success: false,
        message: "Too many OTP requests. Please wait a few seconds.",
      },
      { status: 429 }
    );
  }

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
