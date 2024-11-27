import { getServerSession, User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "../../../lib/dbConnect";
import UserModel from "../../../model/User";
import mongoose from "mongoose";

// Fetch all messages using aggregation
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
  const userId = new mongoose.Types.ObjectId(user._id);

  try {
    const user = await UserModel.aggregate([
      { $match: { id: userId } },
      { $unwind: "$messages" },
      { $sort: { "messages.createdAt": -1 } },
      { $group: { _id: "$_id", messages: { $push: "$messages" } } },
    ]);

    if (!user || user.length === 0) {
      return Response.json(
        { sucess: false, message: "User not found" },
        { status: 404 },
      );
    }

    return Response.json(
      {
        sucess: true,
        message: "Messages fetched successfully",
        messages: user[0].messages,
      },
      { status: 200 },
    );
  } catch (error) {
    console.log("Failed to fetch messages", error);

    return Response.json(
      {
        sucess: false,
        message: "Failed to fetch messages",
      },
      { status: 500 },
    );
  }
}
