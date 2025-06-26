import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/authentication";
import User, { IUser } from "@/model/user";
// import { sendEmailChangeOTP } from "@/app/lib/mailer";

export async function GET(req: NextRequest) {
  const user = await authenticate(req);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const userData = await User.findById(user._id).select("-password");
    if (!userData) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    return NextResponse.json(userData, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to fetch user", error: err },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const user = await authenticate(req);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const allowedFields = ["name", "mobile"];
    const updates: Partial<Record<string, any>> = {};

    for (const key of allowedFields) {
      if (body[key] !== undefined) updates[key] = body[key];
    }

    const updatedUser = await User.findByIdAndUpdate(user._id, updates, {
      new: true,
    }).select("-password");

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: "Update failed", error: err },
      { status: 500 }
    );
  }
}
// export async function PATCH(req: NextRequest) {
//   const user: IUser | null = await authenticate(req);
//   if (!user) {
//     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//   }

//   try {
//     const body = await req.json();
//     const { email: newEmail, name, mobile } = body;
//     const updates: Partial<IUser> = {};

//     if (name && name !== user.name) updates.name = name;
//     if (mobile && mobile !== user.mobile) updates.mobile = mobile;

//     if (newEmail && newEmail !== user.email) {
//       // Call OTP send function and return response immediately
//       try {
//         await sendEmailChangeOTP(user._id.toString(), user.email, newEmail);
//         return NextResponse.json({
//           message: "OTP sent to your current email. Please verify to confirm email change.",
//           requireVerification: true,
//         });
//       } catch (error) {
//         console.error("sendEmailChangeOTP error:", error);
//         return NextResponse.json({ message: "Failed to send OTP" }, { status: 500 });
//       }
//     }

//     if (Object.keys(updates).length > 0) {
//       const updatedUser = await User.findByIdAndUpdate(user._id, updates, {
//         new: true,
//       }).select("-password");

//       return NextResponse.json(updatedUser, { status: 200 });
//     }

//     return NextResponse.json({ message: "No changes detected" }, { status: 400 });
//   } catch (error) {
//     console.error("PATCH /api/profile error:", error);
//     return NextResponse.json({ message: "Update failed", error: String(error) }, { status: 500 });
//   }
// }

export async function DELETE(req: NextRequest) {
  const user = await authenticate(req);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const deletedUser = await User.findByIdAndDelete(user._id);
    if (!deletedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Account deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { message: "Deletion failed", error: err },
      { status: 500 }
    );
  }
}
