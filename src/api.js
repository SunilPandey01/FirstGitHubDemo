const express = require("express");
var bodyParser = require("body-parser");
setupEnvironment();
const app = express();
const {
  readKey,
  encrypt,
  decryptionKey,
  decryptedResponse,
} = require("./openPGP");
var fs = require("fs");

const enableLoggingDebug = Boolean(process.env.EnableLoggingDebug === "true");
const pass_phrase = Number(process.env.Passphrase) || 0;

// bodyParser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// enable cors
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, Content-Type, X-Requested-With, accept, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization, accept-language, User-Language, Content-Type, User-Id, x-requested-with,iPlanetDirectoryPro,X-IBM-Client-Secret,X-IBM-Client-Id,remote_user,role_name,product_type,manreview,company_code,region_code,role,label,responseType,company_id,statuaory_company_code,statutory_company_code"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, GET, DELETE, PUT, PATCH, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Expose-Headers",
    "Origin, Access-Control-Request-Method, Access-Control-Allow-Origin, Access-Control-Allow-Credentials"
  );
  next();
});

app.post("/encrypt", async (req, res, next) => {
  try {
    const plaintext = req.body.message || "Welcome to DXC..!";
    var publicKeyData = fs.readFileSync(`${__dirname}/public.key`, "utf8");
    //enableLoggingDebug && console.log("Get encryption file data :>> ", publicKeyData.toString());
    const encryptionKey = await readKey({ armoredKey: publicKeyData });
    enableLoggingDebug && console.log("encryptionKey :>> ", encryptionKey);

    const encryptedResponse = await encrypt(plaintext, encryptionKey);
    console.log("encryptedResponse :>> ", encryptedResponse);

    // return
    res.status(200).json({
      outcome: "success",
      messages: [
        {
          context: "/encrypt",
          message: "Encrypted",
          data: JSON.stringify(encryptedResponse),
          // data: `${JSON.stringify(encryptedResponse)}`,
        },
      ],
    });
  } catch (error) {
    res.status(500).json({
      outcome: "error",
      messages: [
        {
          context: error.context || "",
          message: error.message,
        },
      ],
    });
  }
});

app.post("/decrypt", async (req, res, next) => {
  try {
    var encrypted_message = req.body.encrypted || "";
    
    var privateKeyData = fs.readFileSync(`${__dirname}/private.key`, "utf8");
    //enableLoggingDebug && console.log("Get decrypt file data :>> ", privateKeyData.toString());
    const privateKey  = await decryptionKey({armoredKey: privateKeyData, passphrase: pass_phrase});
    // await privateKey.decrypt(secretValue.passphrase);
    console.log("decryptionKey :>> ", privateKey);
    
    const decryptedResp = await decryptedResponse(encrypted_message, privateKey);
    enableLoggingDebug && console.log("decryptedResp :>> ", decryptedResp );

    // return
    res.status(200).json({
      outcome: "success",
      messages: [
        {
          context: "/encrypt",
          message: "Decrypted",
          data: decryptedResp.data,
        },
      ],
    });
  } catch (error) {
    res.status(500).json({
      outcome: "error",
      messages: [
        {
          context: error.context || "",
          message: error.message,
        },
      ],
    });
  }
});

// default req
app.use("/", (req, res, next) => {
  res.status(200).json({
    outcome: "success",
    messages: [
      {
        context: "/root",
        message: "Health is good",
      },
    ],
  });
});

// listen 9000 port
var server = app.listen(process.env.PORT, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log(
    "Localhost Lambda Debug server  listening at http://%s:%s",
    host,
    port
  );
});

function setupEnvironment() {
  require("dotenv").config({ path: __dirname + `/environments/.env.dev` });
}
