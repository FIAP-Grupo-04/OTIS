import { list, create, update, remove, subscribe } from "./db";

export const getClients = () => list("clients");
export const createClient = (data) => create("clients", data);
export const updateClient = (data) => update("clients", data);
export const removeClient = (id) => remove("clients", id);
export const onClientsChange = (fn) => subscribe("clients", fn);
