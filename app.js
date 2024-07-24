const config = require("./config/config");
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");

const { devLog } = require("./utils/logger");
console.dev = devLog;

// importing routers
const authRouter = require("./routers/authRouter");
const projectRouter = require("./routers/projectRouter");
const directoryRouter = require("./routers/directoryRouter");
const fileRouter = require("./routers/fileRouter");
const invitationRouter = require("./routers/invitationRouter");
const executionServerRouter = require("./routers/executionServerRouter");

// importing configs and socket
const socketInit = require("./socket");

const app = express();

const server = http.createServer(app);
socketInit(server);

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

const allowedOrigins = [
  config.frontendURL,
  config.baseURL,
  config.executionServerURL
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS, - ${origin}`));
      }
    },
    credentials: true,
  })
);


app.use(cookieParser());

app.use("/auth", authRouter);
app.use("/project", projectRouter);
app.use("/directory", directoryRouter);
app.use("/file", fileRouter);
app.use("/invitation", invitationRouter);
app.use("/from-execution-server", executionServerRouter)


server.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
