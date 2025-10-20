import { fetchJson } from "./dataClient";
export const getCustomerOrders = () => fetchJson("customerOrders.json");
