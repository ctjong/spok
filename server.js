const app = require('express')();
const path = require('path');

app.listen(3000, () => 
{
  console.log('listening on *:3000');
});

app.get("*", (req, res) => 
{
    res.sendFile(path.join(__dirname, "/client/build/index.html"));
});