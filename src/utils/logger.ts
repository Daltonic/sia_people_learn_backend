import logger from "pino";
import dayjs from "dayjs";

const log = logger({
  transport: {
    target: "pino-pretty",
  },
  level: process.env.LOG_LEVEL,
  base: {
    pid: false,
  },
  timestamp: () => `, time: ${dayjs().format()}`,
});

export default log;
