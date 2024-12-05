import { getServerSession, User } from "next-auth";
import dbConnect from "../../../../lib/dbConnect";
import { authOptions } from "../../auth/[...nextauth]/options";
import UserModel from "../../../../model/User";

export async function DELETE(
  request: Request,
  { params }: { params: { messageId: string } },
) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;
  const messageId = params.messageId;

  if (!session || !session.user) {
    return Response.json(
      { success: false, message: "Not authenticated" },
      { status: 401 },
    );
  }

  try {
    const toBeDeleted = await UserModel.updateOne(
      {
        _id: user._id,
      },
      { $pull: { messages: { _id: messageId } } },
    );

    if (toBeDeleted.modifiedCount === 0) {
      return Response.json(
        { message: "Message not found or already deleted", success: false },
        { status: 404 },
      );
    }

    return Response.json(
      { message: "Message deleted successfully", success: true },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error while deleting message:", error);

    return Response.json(
      { message: "Error while deleting message", success: false },
      { status: 500 },
    );
  }
}
