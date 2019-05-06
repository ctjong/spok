if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
  const appInsights = require("applicationinsights");
  appInsights.setup(process.env.APPINSIGHTS_INSTRUMENTATIONKEY);
  appInsights.start();
}

const express = require("express");
const path = require("path");
const app = express();
const http = require("http").Server(app);
const serverMsgHandler = require("./server-message-handler");
const fs = require("fs");
serverMsgHandler.initialize(http);

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
  index = index.replace("<year/>", new Date().getUTCFullYear());
  res.send(index);
});

const port = process.env.port || 1337;
http.listen(port, () => {
  console.log(`listening on ${port}`);
});
