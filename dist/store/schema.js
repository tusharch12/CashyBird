import { Schema } from "mongoose";
import mongoose from "mongoose";
const ObjectId = Schema.ObjectId;
const UserSchema = new Schema({
    name: String,
    userName: String,
    email: { type: String, unique: true },
    password: String,
    games: [ObjectId]
});
const GameHistorySchema = new Schema({
    pFirst: ObjectId,
    pSecond: ObjectId,
    score: Number,
    status: String,
    winner: ObjectId
});
const UserModel = mongoose.model("User", UserSchema);
const GameHistoryModel = mongoose.model("Game_History", GameHistorySchema);
export { UserModel, GameHistoryModel };
