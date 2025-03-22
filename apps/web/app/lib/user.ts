import {db} from "../db";

export async function getUserRole(userId: string): Promise<string>{
    const user = await db.user.findUnique({
        where: {id: userId}
    });
    return user?.role ?? "USER";
}