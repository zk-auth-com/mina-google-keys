import Router from "@koa/router";
import { getHandler } from "./routes/google-keys.js";

const router = new Router();

router.prefix("/auth");
router.get("/", getHandler);                            
router.get("/:jwt", getHandler); 

export default router;


// nonce
// email
// adress poluchatelya
// suma