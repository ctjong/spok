if(process.env.APPINSIGHTS_INSTRUMENTATIONKEY)
{
    const appInsights = require("applicationinsights");
    appInsights.setup(process.env.APPINSIGHTS_INSTRUMENTATIONKEY);
    appInsights.start();
}

const express = require('express');
const path = require('path');
const app = express();
const http = require('http').Server(app);
const serverMsgHandler = require('./server-message-handler');
const fs = require('fs');
serverMsgHandler.initialize(http);

app.use('/static', express.static(path.join(__dirname, '../../build/static')));
app.use('/asset-manifest.json', express.static(path.join(__dirname, '../../build/asset-manifest.json')));
app.use('/favicon.ico', express.static(path.join(__dirname, '../../build/favicon.ico')));
app.use('/manifest.json', express.static(path.join(__dirname, '../../build/manifest.json')));
app.use('/service-worker.js', express.static(path.join(__dirname, '../../build/service-worker.js')));
app.get("*", (req, res) => 
{
    let index = fs.readFileSync(path.join(__dirname, "../../build/index.html"), "utf8");
    index = index.replace("<year/>", new Date().getUTCFullYear());
    res.send(index);
});

const port = process.env.port || 1337;
http.listen(port, () => 
{
    console.log(`listening on ${port}`);
});