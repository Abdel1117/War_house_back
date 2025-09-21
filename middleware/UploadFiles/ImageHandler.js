const multer = require("multer");
const path = require("path");

const MIME_TYPES = {

    "image/jpg": "jpg",
    "image/jpeg": "jpeg",
    "image/png": "png",
    "image/webp": "webp",
}

function imageValidation(dossier) {

    return multer.diskStorage({


        destination: (req, file, callback) => {
            const dir = path.join(__dirname, "..", "..", "image", dossier)
            callback(null, dir);
        },


        filename: (req, file, callback) => {
            const name = file.originalname;
            const nameWithoutExt = path.basename(name, path.extname(name))
            const extention = MIME_TYPES[file.mimetype];
            console.log(extention)
            if (extention) {
                const date = Date.now();
                const finalName = `${nameWithoutExt}_${date}.${extention}`;
                callback(null, finalName);
            } else {
                callback(new Error("Nous n'acceptons que les images de type PNG, JPEG, JPG ou Webp"));
            }

        }
    })
}

const upload = dossier => multer({ storage: imageValidation(dossier) })
module.exports = upload