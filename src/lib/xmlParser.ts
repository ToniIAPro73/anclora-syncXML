import type { XmlData } from '../types/guest';

export const parseXmlFile = async (file: File): Promise<XmlData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'application/xml');

        const errorNode = doc.querySelector('parsererror');
        if (errorNode) throw new Error('Error al parsear XML: Estructura inválida');

        const solicitud = doc.getElementsByTagName('solicitud')[0];
        if (!solicitud) throw new Error('No se encontró el nodo <solicitud>');

        const codigoEstablecimiento = doc.getElementsByTagName('codigoEstablecimiento')[0]?.textContent || '';
        const numPersonas = parseInt(doc.getElementsByTagName('numPersonas')[0]?.textContent || '0', 10);
        
        const personas = Array.from(doc.getElementsByTagName('persona'));

        resolve({
          fileName: file.name,
          codigoEstablecimiento,
          numPersonas,
          personasExistentes: personas,
          fullXml: text,
          doc
        });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

export const updateXmlWithGuests = (baseDoc: Document, newGuests: any[]): string => {
  const doc = baseDoc.cloneNode(true) as Document;
  const comunicacion = doc.getElementsByTagName('comunicacion')[0];
  const contrato = doc.getElementsByTagName('contrato')[0];
  const numPersonasNode = contrato.getElementsByTagName('numPersonas')[0];

  if (!comunicacion) throw new Error('Nodo <comunicacion> no encontrado para insertar huéspedes');

  newGuests.forEach(guest => {
    const personaNode = doc.createElement('persona');

    const appendText = (parent: Element, tagName: string, text?: string) => {
      if (text === undefined) return;
      const el = doc.createElement(tagName);
      el.textContent = text;
      parent.appendChild(el);
    };

    appendText(personaNode, 'rol', guest.rol);
    appendText(personaNode, 'nombre', guest.nombre);
    appendText(personaNode, 'apellido1', guest.apellido1);
    appendText(personaNode, 'apellido2', guest.apellido2 || '');
    appendText(personaNode, 'tipoDocumento', guest.tipoDocumento);
    appendText(personaNode, 'numeroDocumento', guest.numeroDocumento);
    appendText(personaNode, 'soporteDocumento', ''); // Placeholder
    appendText(personaNode, 'fechaNacimiento', guest.fechaNacimiento + '+02:00');
    appendText(personaNode, 'nacionalidad', guest.nacionalidad);
    appendText(personaNode, 'sexo', guest.sexo || 'H'); // Default H

    const direccionNode = doc.createElement('direccion');
    appendText(direccionNode, 'direccion', guest.direccion);
    appendText(direccionNode, 'direccionComplementaria', '');
    
    if (guest.nacionalidad === 'ESP') {
      appendText(direccionNode, 'codigoMunicipio', guest.codigoMunicipio || '00000');
    } else {
      appendText(direccionNode, 'nombreMunicipio', guest.nombreMunicipio || 'Desconocido');
    }
    
    appendText(direccionNode, 'codigoPostal', guest.codigoPostal || '00000');
    appendText(direccionNode, 'pais', guest.nacionalidad === 'ESP' ? 'ESP' : (guest.pais || 'ESP'));
    personaNode.appendChild(direccionNode);

    appendText(personaNode, 'telefono', guest.telefono || '');
    appendText(personaNode, 'telefono2', '');
    appendText(personaNode, 'correo', guest.correo || '');
    appendText(personaNode, 'parentesco', guest.parentesco || 'OT');

    comunicacion.appendChild(personaNode);
  });

  // Update total count
  const totalPersonas = doc.getElementsByTagName('persona').length;
  if (numPersonasNode) {
    numPersonasNode.textContent = totalPersonas.toString();
  }

  const serializer = new XMLSerializer();
  return serializer.serializeToString(doc);
};
