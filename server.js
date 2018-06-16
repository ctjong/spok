const app = require('express')();
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');

if(!fs.existsSync(path.join(__dirname, "/client/build")))
{
    const buildCmd = `node ${path.join(__dirname, "/client/node_modules/react-scripts/scripts/build.js")}`;
    console.log(`Executing ${buildCmd}`);
    process.chdir("./client");
    exec(buildCmd, (e, stdout, stderr) => {
      console.log(stdout);
      console.log(stderr);
    });
}

app.listen(3000, () => 
{
    console.log('listening on *:3000');
});

app.get("*", (req, res) => 
{
    res.sendFile(path.join(__dirname, "/client/build/index.html"));
});