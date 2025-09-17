
export interface Cars {
  id: number;
  key: string;
  car_type_id: number;
  store_id: number;
  user_id: number;
  client_id: number;
  make: string;
  model: string;
  version: string;
  color: string;
  vin: string;
  km: number;
  cylinders: number;
  engine_number: string;
  sale_price: number;
  down_payment: number;
  car_acquisition: AcquisitionDto;
  checks: Checks | null;
  comments: Comments | null;
  arrived_at: Date
  status: string
}

export interface Checks {
  unidad_luces: Boolean;
  cuarto_luces: Boolean;
  antena: Boolean;
  espejos_laterales: Boolean;
  cristales: Boolean;
  emblemas: Boolean;
  llantas: Boolean;
  tapones_gasolina: Boolean;
  carroceria_sin_golpes: Boolean;
  claxon: Boolean;
  instrumentos_tablero: Boolean;
  aire_acondicionado: Boolean;
  limpiadores: Boolean;
  radio_estereo: Boolean;
  encendedor: Boolean;
  espejo_retrovisor: Boolean;
  ceniceros: Boolean;
  botones_interiores: Boolean;
  manijas_interiores: Boolean;
  tapetes: Boolean;
  vestiduras: Boolean;
  gato:Boolean;
  maneral_gato: Boolean;
  llave_ruedas: Boolean;
  herramientas: Boolean;
  traing_seguridad: Boolean;
  llanta_refaccion: Boolean;
  extinguidor: Boolean;
  tapon_aceite: Boolean;
  tapon_radiador: Boolean;
  filtro_aceite: Boolean;
  bateria: Boolean;
  filtro_aire: Boolean;
} 

export interface Comments {
  generales: string;
  carroceria: string;
  llantas: string;
  pintura: string;
  otros: string;
}

export const AcquisitionType = {
  // type = 'compras' |'consigna',
}

export interface AcquisitionDto {
  acquisition_type: string;
}