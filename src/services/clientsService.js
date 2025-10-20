import { fetchJson } from "./dataClient";
export const getClients = () => fetchJson("clients.json");
