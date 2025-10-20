import { fetchJson } from "./dataClient";
export const getElevatorsSeed = () => fetchJson("elevators.json");
export const getModels = () => fetchJson("elevatorModels.json");
