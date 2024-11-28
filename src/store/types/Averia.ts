export type Averia = {
    tipo: string; // Tipo de avería 1,2, 3
    fechaRegistro: string; // Fecha de registro en formato ISO (YYYY-MM-DDTHH:mm:ss)
    ubiInicio: string; // Id oficina Ubicación inicial
    ubiFin: string; // Id oficina  Ubicación final
    vehiculoId: string; // ID del vehículo relacionado con la avería
    fechaReparacion: string | null; // Fecha estimada de reparación, puede ser null
    cargaReplanificada: boolean; // Indicador de si la carga fue replanificada
};
