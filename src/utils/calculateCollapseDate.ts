import { ResponseAlgorithm } from "../store/types/ResponseAlgorithm";

// Función auxiliar para calcular la fecha de colapso
export const calculateCollapseDate = (solutions: ResponseAlgorithm[], simulationStartTime: Date) => {
  if (solutions.length === 0) return null;

  const HOURS_PER_WINDOW = 3;
  const totalHours = solutions.length * HOURS_PER_WINDOW;

  // Calculamos la fecha de inicio de la última ventana de planificación
  const collapseDate = new Date(simulationStartTime);
  collapseDate.setHours(collapseDate.getHours() + totalHours - HOURS_PER_WINDOW);

  console.log('Cálculo de fecha de colapso:', {
    simulationStartTime,
    totalSolutions: solutions.length,
    totalHours,
    calculatedCollapseDate: collapseDate
  });

  return collapseDate;
};