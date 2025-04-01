-- DropForeignKey
ALTER TABLE "Contest" DROP CONSTRAINT "Contest_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "InvitedUser" DROP CONSTRAINT "InvitedUser_contestId_fkey";

-- DropForeignKey
ALTER TABLE "InvitedUser" DROP CONSTRAINT "InvitedUser_userId_fkey";

-- CreateTable
CREATE TABLE "CollaborationRoom" (
    "id" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CollaborationRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollaborationUser" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CollaborationUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvitedRoomUser" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvitedRoomUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CollaborationUser_userId_roomId_key" ON "CollaborationUser"("userId", "roomId");

-- CreateIndex
CREATE UNIQUE INDEX "InvitedRoomUser_userId_roomId_key" ON "InvitedRoomUser"("userId", "roomId");

-- AddForeignKey
ALTER TABLE "Contest" ADD CONSTRAINT "Contest_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitedUser" ADD CONSTRAINT "InvitedUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitedUser" ADD CONSTRAINT "InvitedUser_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollaborationRoom" ADD CONSTRAINT "CollaborationRoom_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollaborationRoom" ADD CONSTRAINT "CollaborationRoom_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollaborationUser" ADD CONSTRAINT "CollaborationUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollaborationUser" ADD CONSTRAINT "CollaborationUser_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "CollaborationRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitedRoomUser" ADD CONSTRAINT "InvitedRoomUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitedRoomUser" ADD CONSTRAINT "InvitedRoomUser_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "CollaborationRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
