const initialVehicles = [
  {
    idVehiculo: "V001",
    capacidadCarga: 120,
    fechaLibre: "2024-10-22T06:34:51",
    ruta: {
      tramos: [
        {
          origen: {
            codigo: "150101",
            descripcion: "LIMA"
          },
          destino: {
            codigo: "070101",
            descripcion: "CALLAO"
          }
        },
        {
          origen: {
            codigo: "070101",
            descripcion: "CALLAO"
          },
          destino: {
            codigo: "150501",
            descripcion: "CAÑETE"
          }
        },
        {
          origen: {
            codigo: "150501",
            descripcion: "CAÑETE"
          },
          destino: {
            codigo: "070101",
            descripcion: "CALLAO"
          }
        },
        {
          origen: {
            codigo: "070101",
            descripcion: "CALLAO"
          },
          destino: {
            codigo: "150801",
            descripcion: "HUAURA"
          }
        },
        {
          origen: {
            codigo: "150801",
            descripcion: "HUAURA"
          },
          destino: {
            codigo: "150101",
            descripcion: "LIMA"
          }
        }
      ],
      pedidos: [
        {
          idPedido: "PED-0002",
          ubigeoDestino: "150501",
          fechaRegistro: "2024-10-21T00:00:00",
          cantidad: 67,
          idCliente: "000624"
        },
        {
          idPedido: "PED-0001",
          ubigeoDestino: "150801",
          fechaRegistro: "2024-10-21T00:02:00",
          cantidad: 19,
          idCliente: "000707"
        }
      ],
      fechaInicio: "2024-10-21T03:00:00",
      fechasSalida: [
        "2024-10-21T03:00:00",
        "2024-10-21T07:10:21",
        "2024-10-21T13:09:59",
        "2024-10-21T19:09:38",
        "2024-10-22T00:50:23"
      ],
      fechasLlegada: [
        "2024-10-21T03:10:21",
        "2024-10-21T09:09:59",
        "2024-10-21T15:09:38",
        "2024-10-21T20:50:23",
        "2024-10-22T02:34:51"
      ]
    },
    position: {
      lat: -12.04591952,
      lng: -77.03049615,
      progress: 0,
      currentSegmentIndex: -1
    }
  },
  // Puedes añadir más vehículos siguiendo la misma estructura

  {
    idVehiculo: "V0010",
    capacidadCarga: 150,
    fechaLibre: "2024-10-22T08:00:00",
    ruta: {
      tramos: [
        {
          origen: {
            codigo: "150101",
            descripcion: "LIMA"
          },
          destino: {
            codigo: "150801",
            descripcion: "HUAURA"
          }
        },
        {
          origen: {
            codigo: "150801",
            descripcion: "HUAURA"
          },
          destino: {
            codigo: "150101",
            descripcion: "LIMA"
          }
        }
      ],
      pedidos: [
        {
          idPedido: "PED-0003",
          ubigeoDestino: "150801",
          fechaRegistro: "2024-10-21T00:00:00",
          cantidad: 45,
          idCliente: "000825"
        }
      ],
      fechaInicio: "2024-10-21T03:00:00",
      fechasSalida: [
        "2024-10-21T03:00:00",
        "2024-10-21T07:10:21",
      ],
      fechasLlegada: [
        "2024-10-21T03:10:21",
        "2024-10-21T09:09:59",
      ]
    },
    position: {
      lat: -16.29,
      lng: -63.58,
      progress: 0,
      currentSegmentIndex: -1
    }
  }

];

export default initialVehicles;