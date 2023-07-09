import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.File({ filename: "logs/app.log", level: "info" }),
    new winston.transports.File({ filename: "logs/error.log", level: "error" })
  ]
});

export default logger;