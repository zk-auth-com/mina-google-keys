import fastify from "fastify";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import cors from "@fastify/cors";
import {sendTxs, updateEmail} from "./contract.js"

const port = 3001;

interface emailUpdate {
	email: string
}

interface tx {
  tx_data: {
    email: string;
    recipient: string;
    nonce: number;
    amount: number;
  };
  signature: {
    r: string;
    s: string;
  };
}


const RunServer = async () => {
  const app = fastify();

  await app.register(fastifySwagger, {
    mode: "dynamic",
    openapi: {
      info: {
        title: "Zkauth backend API",
        description: "",
        version: "0.0.1",
      },
    },
  });

  await app.register(fastifySwaggerUi, {
    routePrefix: "/docs",
  });

  const updateEmailSchema = {
    schema: {
      description: "Update email",
      summary: "update email in contract",
      body: {
        type: "object",
        properties: {
          email: {
            type: "string",
          },
        },
      },
      response: {
        201: {
          description: "Successful response",
          type: "object",
          properties: {
            Result: {
              type: "object",
              properties: {
                result: {
                  type: "string",
                },
              },
            },
          },
        },
      },
    },
  };

  const sendTxFromContractSchema = {
    schema: {
      description: "Send tx from contract",
      summary: "send tx by email and tx data",
      body: {
        type: "object",
        properties: {
          tx_data: {
            type: "object",
            properties: {
              email: {
                type: "string",
              },
              recipient: {
                type: "string",
              },
              nonce: {
                type: "integer",
              },
              amount: {
                type: "integer",
              },
            },
          },
          signature: {
            type: "object",
            properties: {
              r: {
                type: "string",
              },
              s: {
                type: "string",
              },
            },
          },
        },
      },
      response: {
        201: {
          description: "Successful response",
          type: "object",
          properties: {
            Result: {
              type: "object",
              properties: {
                tx: {
                  type: "string",
                },
              },
            },
          },
        },
      },
    },
  };

  await app.register(cors, {
    
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE"], 
  });


  

  await app.register(async (route) => {
    route.get("/get_nonce", async (request, reply) => {
      reply.header("Access-Control-Allow-Origin", "*");
      reply.header("Access-Control-Allow-Credentials", true);

      await reply.send({ Result: { nonce: 0 } });
    });
    route.get("/send_to_contract", async (request, reply) => {
      reply.header("Access-Control-Allow-Origin", "*");
      reply.header("Access-Control-Allow-Credentials", true);
      

      await reply.send({ Result: "OK" });
    });

    route.post("/update_email", updateEmailSchema, async (request, reply) => {
      console.log("email ", request.body);
      reply.header("Access-Control-Allow-Origin", "*");
      reply.header("Access-Control-Allow-Credentials", true);
      const emailUpd = request.body as emailUpdate;
      const tx = await updateEmail(emailUpd.email);
      await reply.send({ Result: { result: tx } });
    });

    route.post(
      "/send_tx_from_contract",
      sendTxFromContractSchema,
      async (request, reply) => {
        console.log("tx info ", request.body);
        reply.header("Access-Control-Allow-Origin", "*");
        reply.header("Access-Control-Allow-Credentials", true);
        const txInfo = request.body as tx;
        const tx = await sendTxs(
          txInfo.tx_data.email,
          txInfo.tx_data.recipient,
          txInfo.tx_data.amount,
          txInfo.signature
        );
        await reply.send({ Result: { tx: tx } });
      }
    );
  });

  return app;
};

const Run = async () => {
  const app = await RunServer();
  app.listen({ host: "::", port }, (error, address) => {
    if (error != null) {
      throw error;
    }
    console.log(address);
  });
};
export { Run };
