require("dotenv").config();
const mongoose = require('mongoose');

const app = require("./index.js");
const port = process.env.PORT_APP || 4000;

async function connectToDatabase() {
  try{

    mongoose.set('strictQuery', true);
    mongoose.connect(`${process.env.MONGO_URI}`)
    .then(() => { console.log("Connexion à la base de donnée réussi") })
    .catch(err => console.log(err))
  }
  catch(error){
    console.error("Erreur lors du démarrage du serveur :", error);
    process.exit(1); 
  }

}

(async () => {
  try {
    await connectToDatabase();
    app.listen(port, () => {
      console.log(`Serveur démarré sur http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Erreur lors du démarrage du serveur :", error);
    process.exit(1); 
  }
})();
