import express from "express";
const router = express.Router();

import { Task } from "../models/Task.js";

import { taskAddValidator, taskEditValidator } from "../validation.js";
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

router.patch("/edit/:id", authMiddleware, async (req, res) => {
  //Run body parameters through the validation schema before continuing:
  const { error } = taskEditValidator(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  //Find the task by ID
  const task = await Task.findByPk(req.params.id);
  if (!task) return res.status(404).send("Task not found");
  //Check if the user is the owner of the task
  if (task.userId !== req.user.id) {
    return res.status(403).send("You do not have permission to edit this task");
  }
  //Update the task
  if (req.body.title) {
    task.title = req.body.title;
  }
  if (req.body.description) {
    task.description = req.body.description;
  }
  if (req.body.dueDate) {
    task.dueDate = req.body.dueDate;
  }
  if (req.body.status) {
    task.status = req.body.status;
  }
  task
    .save()
    .then(() => {
      res.status(200).json({ status: "Success", updated_task_id: task.id });
    })
    .catch((err) => res.status(500).send(err.message));
});

router.get("/", authMiddleware, async (req, res) => {
  //Find all tasks for the user
  const tasks = await Task.findAll({ where: { userId: req.user.id } });
  res.status(200).json(tasks);
});

router.delete("/delete/:id", authMiddleware, async (req, res) => {
  //Find the task by ID
  const task = await Task.findByPk(req.params.id);
  if (!task) return res.status(404).send("Task not found");
  //Check if the user is the owner of the task
  if (task.userId !== req.user.id) {
    return res.status(403).send("You do not have permission to delete this task");
  }
  //Delete the task
  task
    .destroy()
    .then(() => {
      res.status(200).json({ status: "Success", deleted_task_id: task.id });
    })
    .catch((err) => res.status(500).send(err.message));
})

export default router;
