import pkg from "@hapi/joi";
const Joi = pkg;

//Validation schema for the request body

export const registerValidator = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(6).required(),
    email: Joi.string().min(6).required().email(),
    password: Joi.string().min(6).required(),
  });
  return schema.validate(data);
};

export const loginValidator = (data) => {
  const schema = Joi.object({
    email: Joi.string().min(6).required().email(),
    password: Joi.string().min(6).required(),
  });
  return schema.validate(data);
};

export const taskAddValidator = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(3).required(),
    description: Joi.string().min(5).optional(),
    dueDate: Joi.date().iso().required(), // ISO format for date, as dates are a pain!
    status: Joi.string().valid("low", "medium", "high").required(),
  });
  return schema.validate(data);
};

export const taskEditValidator = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(3).optional(),
    description: Joi.string().min(5).optional(),
    dueDate: Joi.date().iso().optional(), // ISO format for date, as dates are a pain!
    status: Joi.string().valid("low", "medium", "high").optional(),
  });
  return schema.validate(data);
};
