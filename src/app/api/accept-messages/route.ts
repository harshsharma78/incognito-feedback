import { getServerSession, User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "../../../lib/dbConnect";
import UserModel from "../../../model/User";

export async function POST(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;

  if (!session || !session.user) {
    return Response.json(
      { sucess: false, message: "Not Authenticated" },
      { status: 401 },
    );
  }
  const userId = user._id;
  const { acceptingMessages } = await request.json();

  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { isAcceptingMessage: acceptingMessages },
      { new: true },
    );

    if (!updatedUser) {
      return Response.json(
        {
          sucess: false,
          message: "Failed to update user status to accept messages",
        },
        { status: 401 },
      );
    }

    return Response.json(
      {
        sucess: true,
        message: "Updated user status to accept messages",
        updatedUser,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to update user status to accept messages", error);

    return Response.json(
      {
        sucess: false,
        message: "Failed to update user status to accept messages",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;

  if (!session || !session.user) {
    return Response.json(
      { sucess: false, message: "Not Authenticated" },
      { status: 401 },
    );
  }

  const userId = user._id;
  try {
    const foundUser = await UserModel.findById(userId);

    if (!foundUser) {
      return Response.json(
        {
          sucess: false,
          message: "User not found!",
        },
        { status: 404 },
      );
    }

    return Response.json(
      {
        sucess: true,
        isAcceptingMessages: foundUser.isAcceptingMessage,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in getting message acceptance status", error);

    return Response.json(
      {
        sucess: false,
        message: "Error in getting message acceptance status",
      },
      { status: 500 },
    );
  }
}
