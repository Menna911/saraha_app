import { ENC_SECRET_KEY } from "../config/config.service.js";
import bootstrap from "./app.bootstrap.js";
import { generateEncryption } from "./common/utils/security/encryption.security.js";
import { generateDecryption } from "./common/utils/security/encryption.security.js";
bootstrap()
//console.log({ENC_SECRET_KEY});
//generateEncryption()
//
const ENC_RESULT =await  generateEncryption("lol💕")
console.log({ENC_RESULT});

const DEC_RESULT = await generateDecryption(ENC_RESULT);
console.log({ENC_RESULT ,DEC_RESULT
});

