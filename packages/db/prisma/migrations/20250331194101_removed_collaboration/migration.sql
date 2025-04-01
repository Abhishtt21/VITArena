/*
  Warnings:

  - You are about to drop the `CollaborationRoom` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CollaborationUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InvitedRoomUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CollaborationRoom" DROP CONSTRAINT "CollaborationRoom_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "CollaborationRoom" DROP CONSTRAINT "CollaborationRoom_problemId_fkey";

-- DropForeignKey
ALTER TABLE "CollaborationUser" DROP CONSTRAINT "CollaborationUser_roomId_fkey";

-- DropForeignKey
ALTER TABLE "CollaborationUser" DROP CONSTRAINT "CollaborationUser_userId_fkey";

-- DropForeignKey
ALTER TABLE "InvitedRoomUser" DROP CONSTRAINT "InvitedRoomUser_roomId_fkey";

-- DropForeignKey
ALTER TABLE "InvitedRoomUser" DROP CONSTRAINT "InvitedRoomUser_userId_fkey";

-- DropTable
DROP TABLE "CollaborationRoom";

-- DropTable
DROP TABLE "CollaborationUser";

-- DropTable
DROP TABLE "InvitedRoomUser";
