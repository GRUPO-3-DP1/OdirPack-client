import React, { useState, useEffect } from 'react';

interface FechaProps {
  className?: string;
}

const Fecha: React.FC<FechaProps> = ({ className }) => {
  const [fecha, setFecha] = useState(new Date());

  useEffect(() => {
    const intervalo = setInterval(() => {
      setFecha(new Date());
    }, 1000);

    return () => clearInterval(intervalo);
  }, []);

  const formatearFecha = (fecha: Date) => {
    const opcionesFecha: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    const opcionesHora: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };

    const fechaFormateada = fecha.toLocaleDateString('es-ES', opcionesFecha);
    const horaFormateada = fecha.toLocaleTimeString('es-ES', opcionesHora);

    const fechaCapitalizada = fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);

    return `${fechaCapitalizada}, ${horaFormateada}`;
  };

  return (
    <p className={className}>{formatearFecha(fecha)}</p>
  );
};

export default Fecha;