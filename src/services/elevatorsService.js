import { list, create, update, remove, subscribe } from "./db";

export const getElevators = () => list("elevators");
export const createElevator = (data) => create("elevators", data);
export const updateElevator = (data) => update("elevators", data);
export const removeElevator = (id) => remove("elevators", id);
export const onElevatorsChange = (fn) => subscribe("elevators", fn);
