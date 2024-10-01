import mongoose from "mongoose";

export const connectToDb = () => {
  mongoose
    .connect(process.env.DB_URL, { dbName: "chatApp" })
    .then((msg) => {
      console.log("connected to db");
    })
    .catch((error) => {
      console.log(error);
    });
};
