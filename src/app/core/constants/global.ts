// export const STATUS = ['Activo', 'Inactivo'];

import { D } from "node_modules/@angular/material/date-adapter.d-CtKXIxk0";

export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DELETED: 'deleted',
  VENTA: 'venta',
  APARTADO: 'apartado',
  PAGOS: 'pagos',
  LIQUIDADO: 'liquidado',
} as const;

export const INCOMETYPE = {
  APARTADOS: 'apartados',
  VENTA_CONTADO: 'venta_contado',
  MENSUALIDAD_VENTA: 'mensualidad_venta',
  COBROS_ADICIONALES: 'cobros_adicionales'
} as const;

export const SALESTYPE = {
  CREDITO: 'credito',
  CONTADO: 'contado',
  APARTADO: 'apartado',
  NORMAL: 'normal'
} as const;

export const CARSALETYPE = {
  PRIVADO: 'privado',
  EMPRESARIAL: 'empresarial',
} as const;

export const FUELTANK = {
  VACIO: 'vacio',
  Q1_4: '1/4',
  Q1_2: '1/2',
  Q3_4: '3/4',
  LLENO: 'lleno',
} as const;

export const PAYMENTSSALE = {
  CLIENTE: 'cliente',
  AVAL1: 'aval1',
  AVAL2: 'aval2',
} as const;

export const PAYMENTDAYS = {
  MES1: '1 de mes',
  MES15: '15 de mes',
  FIN_MES: 'fin de mes',
} as const;

export const METHODPAYMENTSALE = {
  EFECTIVO: 'efectivo',
  TRANSFERENCIA: 'transferencia',
  CHEQUE: 'cheque',
  TARJETA: 'tarjeta', 
} as const;

