import express from "express";
import dotenv from "dotenv";
dotenv.config();

import authRoutes from "./routes/auth.js";
import protectedRoutes from "./routes/protected.js";
import taskRoutes from "./routes/taskRoutes.js";

//Initialise Express
const app = express();

//Set up parser so we can read JSON info from the request
app.use(express.json());

//Set up API routes
app.use("/api/user", authRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/tasks", taskRoutes);

//404 Error routes as a catch-all
app.use((req, res, next) => {
  res.status(404).send("Error 404 - Resource not found");
});

//Set the default port to serve app on
const port = process.env.PORT || 3000;

app.listen(port, console.log(`App running on port: ${port}`));
