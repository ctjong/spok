const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const execCmd = (cmd) => 
{
    return new Promise((resolve) => 
    {
        console.log(`Executing "${cmd}"`);
        exec(cmd, (err, stdout, stderr) => 
        {
            console.log(stdout);
            if(err)
            {
                console.log(stderr);
                console.log(err);
                throw "An error occurred. Aborting.";
            }
            resolve();
        });
    });
};

const ensureNodeModulesExists = () => 
{
    return new Promise((resolve) => 
    {
        fs.exists(path.join(__dirname, "node_modules"), exists => 
        {
            if(!exists)
                execCmd("npm install").then(resolve);
            else
                resolve();
        });
    });
};

module.exports = () => 
{
    return new Promise((resolve) => 
    {
        ensureNodeModulesExists().then(() => 
        {
            const buildCmd = `node ${path.join(__dirname, "/node_modules/react-scripts/scripts/build.js")}`;
            execCmd(buildCmd).then(resolve);
        });
    });
};