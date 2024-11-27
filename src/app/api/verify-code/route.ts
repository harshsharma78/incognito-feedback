import dbConnect from "../../../lib/dbConnect";
import UserModel from "../../../model/User";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, code } = await request.json();

    const decodedUsername = decodeURIComponent(username);

    const user = await UserModel.findOne({ username: decodedUsername });

    if (!user) {
      return Response.json(
        { sucess: false, message: "User not found!" },
        { status: 404 },
      );
    }

    const isCodeValid = user.verifyCode === code;
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

    if (isCodeValid && isCodeNotExpired) {
      user.isVerified = true;
      await user.save();

      return Response.json(
        { sucess: true, message: "Account verified successfully!" },
        { status: 200 },
      );
    } else if (!isCodeNotExpired) {
      return Response.json(
        {
          sucess: false,
          message:
            "Verification code has been expired, please sign-up again to get a new code!",
        },
        { status: 400 },
      );
    } else {
      return Response.json(
        { sucess: false, message: "Incorrect Verification Code" },
        { status: 400 },
      );
    }

  } catch (error) {
    console.error("Error in code verification", error);

    return Response.json(
      { sucess: false, message: "Error in code verification" },
      { status: 500 },
    );
  }
}
