// src/types/Averia.ts

export type Averia = {
    tipo: string;
    fechaRegistro: string;
    tramoId: number;
    vehiculoId: string;
    fechaReparacion: string | null;
    cargaReplanificada: boolean;
};
