import { Dispatch, SetStateAction } from "react";

export type OperacionContextProps = {
  planificando: boolean;
  setPlanificando: Dispatch<SetStateAction<boolean>>;
  startTime: Date|null;
};