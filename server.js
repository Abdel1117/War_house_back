require("dotenv").config()
const app = require("./index.js");
const port = process.env.PORT_APP || 4000;  
/*  */
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});