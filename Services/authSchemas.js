const Joi = require("joi");

const registerSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  address: Joi.string().min(2).max(255).required(),
  phone: Joi.string().min(10).max(15).required(),
  password: Joi.string().min(8).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

module.exports = { registerSchema, loginSchema };
