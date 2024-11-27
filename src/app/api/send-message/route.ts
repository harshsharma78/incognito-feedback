import dbConnect from "../../../lib/dbConnect";
import UserModel from "../../../model/User";
import { Message } from "@/model/User";

export async function POST(request: Request) {
  await dbConnect();

  const { username, content } = await request.json();

  try {
    const user = await UserModel.findOne({ username });

    if (!user) {
      return Response.json(
        {
          sucess: false,
          message: "User not found",
        },
        { status: 404 },
      );
    }

    // Is user accepting the messages
    if (!user.isAcceptingMessage) {
      return Response.json(
        {
          sucess: false,
          message: "User is not accepting the messages",
        },
        { status: 403 },
      );
    }

    const newMessage = { content, createdAt: new Date() };

    user.messages.push(newMessage as Message);
    await user.save();
    
    return Response.json(
      {
        sucess: true,
        message: "Messages sent successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.log("Failed to send message", error);

    return Response.json(
      {
        sucess: false,
        message: "Failed to send message",
      },
      { status: 500 },
    );
  }
}
