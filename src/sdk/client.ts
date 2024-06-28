import { createClient } from "./createClient.js";
  
import { operationUrlObject as agentUserThreadOperationUrlObject, operations as agentUserThreadOperations } from "./agent-user-thread.js";
import { operationUrlObject as agentAdminOperationUrlObject, operations as agentAdminOperations } from "./agent-admin.js";
import { operationUrlObject as agentOpenapiOperationUrlObject, operations as agentOpenapiOperations } from "./agent-openapi.js";
import { operationUrlObject as agentUserOperationUrlObject, operations as agentUserOperations } from "./agent-user.js";


 

export const agentUserThread = createClient({
  baseUrl: "https://data.actionschema.com/migrate-agent-user-thread",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: "Bearer " + process.env.AGENT_USER_THREAD_CRUD_AUTH_TOKEN
  },
  timeoutSeconds: 60,
});


 

export const agentAdmin = createClient({
  baseUrl: "https://data.actionschema.com/migrate-agent-admin",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: "Bearer " + process.env.AGENT_ADMIN_CRUD_AUTH_TOKEN
  },
  timeoutSeconds: 60,
});


 

export const agentOpenapi = createClient({
  baseUrl: "https://data.actionschema.com/migrate-agent-openapi",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: "Bearer " + process.env.AGENT_OPENAPI_CRUD_AUTH_TOKEN
  },
  timeoutSeconds: 60,
});


 

export const agentUser = createClient({
  baseUrl: "https://data.actionschema.com/migrate-agent-user",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: "Bearer " + process.env.AGENT_USER_CRUD_AUTH_TOKEN
  },
  timeoutSeconds: 60,
});
