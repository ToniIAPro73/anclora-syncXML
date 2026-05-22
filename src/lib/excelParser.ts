import * as XLSX from 'xlsx';
import type { GuestRecord } from '../types/guest';
import { 
  parseSpanishDate, 
  normalizeDocumentType, 
  normalizeNationality, 
  normalizePhone, 
  extractPostalCode 
} from './normalizers';

export const parseExcelFile = async (file: File): Promise<GuestRecord[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        const records: GuestRecord[] = jsonData.map((row, index) => {
          const errors: string[] = [];
          const warnings: string[] = [];

          const nombre = String(row['Nombre'] || '').trim();
          const apellido1 = String(row['1. Apellido'] || '').trim();
          const docTypeStr = String(row['Tipo de documento de identidad'] || '').trim();
          const docNum = String(row['Número de documento'] || '').trim();
          const birthDateStr = row['Fecha de nacimiento'];
          const nationalityStr = String(row['Nationality'] || '').trim();
          const arrivalStr = row['Fecha de llegada'];
          const departureStr = row['Fecha de salida'];
          const address = String(row['Dirección de residencia'] || '').trim();

          if (!nombre) errors.push('Nombre obligatorio');
          if (!apellido1) errors.push('1. Apellido obligatorio');
          if (!docTypeStr) errors.push('Tipo de documento obligatorio');
          if (!docNum) errors.push('Número de documento obligatorio');
          
          const birthDate = parseSpanishDate(birthDateStr);
          if (!birthDate) errors.push('Fecha de nacimiento inválida u obligatoria');

          const arrivalDate = parseSpanishDate(arrivalStr);
          if (!arrivalDate) warnings.push('Fecha de llegada no detectada');

          const departureDate = parseSpanishDate(departureStr);
          if (!departureDate) warnings.push('Fecha de salida no detectada');

          const nationality = normalizeNationality(nationalityStr);
          if (!nationality) errors.push('Nacionalidad obligatoria');

          const cp = extractPostalCode(address);
          if (!cp) warnings.push('Código postal no detectado en la dirección');

          return {
            sourceRow: index + 2, // 1-based + header
            nombre,
            apellido1,
            apellido2: String(row['2. Apellido'] || '').trim(),
            fechaNacimiento: birthDate || '',
            nacionalidad: nationality,
            tipoDocumento: normalizeDocumentType(docTypeStr),
            numeroDocumento: docNum.toUpperCase(),
            correo: String(row['Correo electrónico'] || '').trim(),
            telefono: normalizePhone(row['Número de teléfono']),
            direccion: address,
            codigoPostal: cp,
            fechaLlegada: arrivalDate || undefined,
            fechaSalida: departureDate || undefined,
            parentesco: row['Parentesco'] || undefined,
            rol: 'VI',
            warnings,
            errors
          };
        });

        resolve(records);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};
