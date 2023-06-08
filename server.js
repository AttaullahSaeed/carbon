import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import routes from "./routes/companies.js";
import { Tokens } from "./models/models.js";
import { initXero, refreshTokenSet, getAccounts } from "./xero/xero.js";
import { setEnvValue } from "./utils.js";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // To parse the incoming requests with JSON payloads
// parse application/json

const port = process.env.PORT || 3003;

// ############ Signup and sigin Routes ###############

app.use("/api/v1", routes);

// ############ Signup and sigin Routes ###############
let tokenSet = JSON.parse(process.env["TOKENS"]);

app.get("/connect_to_xero", async (req, res) => {
  const xero = initXero();
  let consentUrl = await xero.buildConsentUrl();
  // res.redirect(consentUrl);
  res.send({
    consentUrl,
  });
});

app.get("/callback", async (req, res) => {
  const xero = initXero();
  await xero.initialize();

  tokenSet = await xero.apiCallback(req.url);

  process.env["TOKENS"] = JSON.stringify(tokenSet);
  setEnvValue("TOKENS", JSON.stringify(tokenSet));
  await xero.setTokenSet(tokenSet);
  tokenSet = refreshTokenSet(xero, tokenSet);

  await xero.updateTenants();
  const activeTenantId = xero.tenants[0].tenantId;
  try {
    const getAccountsResponse = await xero.accountingApi.getAccounts(
      activeTenantId
    );
    res.json(getAccountsResponse.body.accounts);
  } catch (error) {
    console.log(error);
  }
});
const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "./client/build")));
app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build/index.html"));
});
if (process.env.NODE_ENV === "production") {
  app.use(express.static("./client"));
}
app.use("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../build", "index.html"));
});
app.get("/api/v1/accounts", async (req, res) => {
  tokenSet = JSON.parse(process.env["TOKENS"]);

  const accounts = await getAccounts(tokenSet);
  if (!accounts) {
    res.status(500).json("Something went wrong! Please try again later.");
  }
  res.status(200).json({ data: accounts });
});

app.use(function (req, res) {
  //res.setHeader('Content-Type', 'text/plain')
  //res.write('you posted:\n')
  //res.end(JSON.stringify(req.body, null, 2))
});
/*app.use("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../build", "index.html"));
});*/

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
