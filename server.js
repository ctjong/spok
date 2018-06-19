const express = require('express');
const path = require('path');
const path = require('path');
const appInsights = require("applicationinsights");

appInsights.setup("06ac4247-0b06-4ee0-8ddd-c5879bd2fb14");
appInsights.start();

const app = express();
app.use('/static', express.static(path.join(__dirname, 'build/static')));
app.use('/asset-manifest.json', express.static(path.join(__dirname, 'build/asset-manifest.json')));
app.use('/favicon.ico', express.static(path.join(__dirname, 'build/favicon.ico')));
app.use('/manifest.json', express.static(path.join(__dirname, 'build/manifest.json')));
app.use('/service-worker.js', express.static(path.join(__dirname, 'build/service-worker.js')));

app.get("*", (req, res) => 
{
    res.sendFile(path.join(__dirname, "build/index.html"));
});

const port = process.env.port || 3000;
app.listen(port, () => 
{
    console.log(`listening on ${port}`);
});