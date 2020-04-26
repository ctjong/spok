import * as express from "express";
import * as path from "path";
import * as http from "http";
import * as fs from "fs";
import ServerHandler from "./server-handler";

if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
  const appInsights = require("applicationinsights");
  appInsights.setup(process.env.APPINSIGHTS_INSTRUMENTATIONKEY);
  appInsights.start();
}

const app = express();
const httpServer = new http.Server(app);
ServerHandler.initialize(httpServer);

app.use("/static", express.static(path.join(__dirname, "../../client/static")));
app.use(
  "/asset-manifest.json",
  express.static(path.join(__dirname, "../../client/asset-manifest.json"))
);
app.use(
  "/favicon.ico",
  express.static(path.join(__dirname, "../../client/favicon.ico"))
);
app.use(
  "/manifest.json",
  express.static(path.join(__dirname, "../../client/manifest.json"))
);
app.use(
  "/service-worker.js",
  express.static(path.join(__dirname, "../../client/service-worker.js"))
);
app.get("*", (req: any, res: any) => {
  let index = fs.readFileSync(
    path.join(__dirname, "../../client/index.html"),
    "utf8"
  );
  const year = new Date().getUTCFullYear().toString();
  index = index.replace("<year/>", year);
  res.send(index);
});

const port = process.env.port || 1337;
httpServer.listen(port, () => {
  console.log(`listening on ${port}`);
});
