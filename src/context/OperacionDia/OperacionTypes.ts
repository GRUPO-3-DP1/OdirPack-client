import { Dispatch, SetStateAction } from "react";
import { Pedido } from "../../store/types/Pedido";


export type OperacionContextProps = {
  pedidos: Pedido[];
  planificando: boolean;
  setPlanificando: Dispatch<SetStateAction<boolean>>;
};