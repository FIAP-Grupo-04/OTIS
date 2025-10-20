import { fetchJson } from "./dataClient";
export const getOperationTypes = () => fetchJson("operationTypes.json");
export const getTechnicians = () => fetchJson("technicians.json");
export const getOperationsSeed = () => fetchJson("operations.json");
