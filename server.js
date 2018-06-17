const express = require('express');
const path = require('path');

const app = express();
app.use('/static', express.static(path.join(__dirname, 'build/static')));
app.use('/asset-manifest.json', express.static(path.join(__dirname, 'build/asset-manifest.json')));
app.use('/favicon.ico', express.static(path.join(__dirname, 'build/favicon.ico')));
app.use('/manifest.json', express.static(path.join(__dirname, 'build/manifest.json')));
app.use('/service-worker.js', express.static(path.join(__dirname, 'build/service-worker.js')));

app.listen(3000, () => 
{
    console.log('listening on *:3000');
});

app.get("*", (req, res) => 
{
    res.sendFile(path.join(__dirname, "build/index.html"));
});