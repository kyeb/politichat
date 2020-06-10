import mongoose from "mongoose";
const { connect } = mongoose;
import pino from "pino";
const logger = pino();

export const init = () => {
  // connect to mongodb
  connect(process.env.MONGO_CONNECTION_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
    .then(() => logger.info("Server connected to MongoDB"))
    .catch((err) => logger.error("Error connecting to MongoDB", err));
};
