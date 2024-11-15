import * as Joi from 'joi';

export const validationSchema = Joi.object({
  PORT: Joi.number().required(),
  BOT_TOKEN: Joi.string().required(),
  // BANNER_URL: Joi.string().required(),
  MYSQL_HOST: Joi.string().required(),
  MYSQL_PORT: Joi.number().required(),
  MYSQL_USERNAME: Joi.string().required(),
  MYSQL_DBNAME: Joi.string().required(),
  MYSQL_PASSWORD: Joi.string().required(),
});
