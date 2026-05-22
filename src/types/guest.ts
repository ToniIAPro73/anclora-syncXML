export type DocumentType = 'NIF' | 'NIE' | 'PAS' | 'OTRO';
export type Parentesco = 'AB' | 'BA' | 'BN' | 'CY' | 'CD' | 'HR' | 'HJ' | 'PM' | 'NI' | 'SB' | 'SG' | 'TI' | 'YN' | 'TU' | 'OT';
export type Sexo = 'H' | 'M' | 'O';

export interface GuestRecord {
  sourceRow: number;
  nombre: string;
  apellido1: string;
  apellido2?: string;
  fechaNacimiento: string;
  nacionalidad: string;
  tipoDocumento: DocumentType;
  numeroDocumento: string;
  correo?: string;
  telefono?: string;
  direccion?: string;
  codigoPostal?: string;
  nombreMunicipio?: string;
  codigoMunicipio?: string;
  pais?: string;
  fechaLlegada?: string;
  fechaSalida?: string;
  parentesco?: Parentesco;
  rol: 'VI';
  sexo?: Sexo;
  warnings: string[];
  errors: string[];
}

export interface XmlData {
  fileName: string;
  codigoEstablecimiento: string;
  numPersonas: number;
  personasExistentes: any[];
  fullXml: string;
  doc?: Document;
}
