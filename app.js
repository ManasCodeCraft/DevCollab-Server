const express = require("express");
const authRouter = require("./routers/authRouter");
const projectRouter = require("./routers/projectRouter");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const directoryRouter = require("./routers/directoryRouter");
const fileRouter = require("./routers/fileRouter");
const invitationRouter = require("./routers/invitationRouter");
const { deployRouter } = require("./routers/deployRouter");
const { loadAllClientApps } = require("./client_request_handlers/clientProjectInit");
const { storeNodeApp } = require("./client_request_handlers/clientRouteSetUp");
const frontend_app = require('./config/config').frontendURL;
const port = require("./config/config").port;
const app = express();

async function init(){
    storeNodeApp(app);
    await loadAllClientApps();
}

function startServer() {
  app.use(express.json());
  app.use(
    express.urlencoded({
      extended: true,
    })
  );
  app.use(
    cors({
      origin: frontend_app,
      credentials: true,
    })
  );

  app.use(cookieParser());
  app.use("/auth", authRouter);
  app.use("/project", projectRouter);
  app.use("/directory", directoryRouter);
  app.use("/file", fileRouter);
  app.use("/invitation", invitationRouter);
  app.use("/host", deployRouter);

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}


(async () => {
  startServer();
  await init();
})();
