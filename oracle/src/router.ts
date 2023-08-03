import Router from "@koa/router";
import { getHandler } from "./routes/google-keys.js";

const router = new Router();

router.prefix("/auth");
router.get("/", getHandler);                            
router.get("/:jwt/:recipient/:noncesc/:amount", getHandler); 

export default router;


// nonce
// email
// adress poluchatelya
// suma