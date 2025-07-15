import express from "express";
const router = express.Router();

import { Task } from "../models/Task.js";

import { taskAddValidator } from "../validation.js";
import { authMiddleware } from "./authMiddleware.js";

router.post("/add", authMiddleware, async (req, res) => {
  //Run body parameters through the validation schema before continuing:
  const { error } = taskAddValidator(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //Build the task object to write to a database
  const newTask = {
    title: req.body.title,
    description: req.body.description,
    dueDate: req.body.dueDate,
    status: req.body.status,
    userId: req.user.id, // we get this from the authMiddleware
  };

  //Save the new user object, using the User model we defined in Sequelize. Return the new user ID in JSON
  Task.create(newTask)
    .then((savedTask) => {
      res.status(200).json({ status: "Success", new_task_id: savedTask.id });
    })
    .catch((err) => res.status(500).send(err.message));
});

export default router;