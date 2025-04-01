-- CreateIndex
CREATE INDEX "CollaborationRoom_problemId_idx" ON "CollaborationRoom"("problemId");

-- CreateIndex
CREATE INDEX "CollaborationRoom_creatorId_idx" ON "CollaborationRoom"("creatorId");

-- CreateIndex
CREATE INDEX "CollaborationUser_roomId_idx" ON "CollaborationUser"("roomId");

-- CreateIndex
CREATE INDEX "InvitedRoomUser_roomId_idx" ON "InvitedRoomUser"("roomId");
