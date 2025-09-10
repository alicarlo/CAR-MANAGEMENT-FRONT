export type Estatus = 'EN VENTA' | 'APARTADO' | 'EN PAGOS' | 'LIQUIDADO';
export type TipoAdquisicion = 'COMPRAS' | 'CONSIGNA';

// Grupo de checks (bool)
export interface CarsChecks {
  unidadLuces: boolean;
  cuartosLuces: boolean;
  antena: boolean;
  espejosLaterales: boolean;
  cristales: boolean;
  emblemas: boolean;
  llantas: boolean;
  taponesRines: boolean;
  moldurasCompletas: boolean;
  taponGasolina: boolean;
  carroceriaSinGoles: boolean;
  claxon: boolean;
  instrumentosTablero: boolean;
  aireAcondicionado: boolean;
  limpiadores: boolean;
  radioEstereo: boolean;
  encendedor: boolean;
  espejoRetrovisor: boolean;
  ceniceros: boolean;
  botonesInteriores: boolean;
  manijasInteriores: boolean;
  tapetes: boolean;
  vestiduras: boolean;
  gato: boolean;
  maneralGato: boolean;
  llaveRuedas: boolean;
  estHerramientas: boolean;
  trianguloSeguridad: boolean; // "Traing. de Seguridad"
  llantaRefaccion: boolean;
  extinguidor: boolean;
  taponAceite: boolean;
  taponRadiador: boolean;
  filtroAceite: boolean;
  bateria: boolean;
  filtroAire: boolean;
}


export interface Cars {
  id?: string;
  tipoAutoId: string; 
  sucursalId: string;
  marca: string;
  linea: string;
  modelo: string;
  color: string;
  serie: string;      
  numeroMotor: string;    
  kilometraje: number;
  cilindros: number;
  fechaLlegada: string; 
  precioVenta: number;
  enganche: number;
  estatus: Estatus;
  tipoAdquisicion: TipoAdquisicion;
  checks: CarsChecks;
  comentarios?: string;
  comentariosCarroceria?: string;
  comentariosLlantas?: string;
  comentariosPintura?: string;
  comentariosOtros?: string;
}