import React, { useState } from 'react';
import { Upload, FileCode, CheckCircle2, AlertCircle, ChevronRight, ChevronLeft, Download, Eye, Code } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { parseExcelFile } from './lib/excelParser';
import { parseXmlFile, updateXmlWithGuests } from './lib/xmlParser';
import type { GuestRecord, XmlData } from './types/guest';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [step, setStep] = useState(1);
  const [xmlData, setXmlData] = useState<XmlData | null>(null);
  const [guestRecords, setGuestRecords] = useState<GuestRecord[]>([]);
  const [finalXml, setFinalXml] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const steps = [
    { id: 1, name: 'XML Base', icon: FileCode },
    { id: 2, name: 'Excel', icon: Upload },
    { id: 3, name: 'Previsualizar', icon: Eye },
    { id: 4, name: 'Transferir', icon: CheckCircle2 },
    { id: 5, name: 'Resultado', icon: Code },
    { id: 6, name: 'Finalizar', icon: Download },
  ];

  const handleXmlUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      const data = await parseXmlFile(file);
      setXmlData(data);
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Error al cargar XML');
    }
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      const records = await parseExcelFile(file);
      setGuestRecords(records);
      setStep(3);
    } catch (err: any) {
      setError(err.message || 'Error al cargar Excel');
    }
  };

  const handleTransfer = () => {
    if (!xmlData?.doc || guestRecords.length === 0) return;
    try {
      const validGuests = guestRecords.filter(r => r.errors.length === 0);
      const xml = updateXmlWithGuests(xmlData.doc, validGuests);
      setFinalXml(xml);
      setStep(5);
    } catch (err: any) {
      setError(err.message || 'Error al generar XML');
    }
  };

  const downloadXml = () => {
    const blob = new Blob([finalXml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consolidado_${new Date().getTime()}.xml`;
    a.click();
    URL.revokeObjectURL(url);
    setStep(6);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
              <FileCode size={20} />
            </div>
            Hospedajes XML Pro
          </h1>
          <div className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            Procesamiento Local Seguro
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Stepper */}
        <nav className="mb-12">
          <ol className="flex items-center w-full">
            {steps.map((s, idx) => (
              <li key={s.id} className={cn(
                "flex items-center",
                idx !== steps.length - 1 ? "w-full" : ""
              )}>
                <div className={cn(
                  "flex flex-col items-center gap-2",
                  step >= s.id ? "text-indigo-600" : "text-slate-400"
                )}>
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                    step === s.id ? "bg-indigo-50 border-indigo-600 scale-110" : 
                    step > s.id ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-200"
                  )}>
                    <s.icon size={20} />
                  </div>
                  <span className="text-xs font-medium whitespace-nowrap">{s.name}</span>
                </div>
                {idx !== steps.length - 1 && (
                  <div className={cn(
                    "h-0.5 w-full mx-4",
                    step > s.id ? "bg-indigo-600" : "bg-slate-200"
                  )} />
                )}
              </li>
            ))}
          </ol>
        </nav>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start gap-3">
            <AlertCircle className="shrink-0 mt-0.5" size={18} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
          {/* Step 1: XML Base */}
          {step === 1 && (
            <div className="p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <FileCode size={40} />
                </div>
                <h2 className="text-2xl font-bold mb-2">Carga el XML Base</h2>
                <p className="text-slate-500 mb-8">Sube la plantilla XML que contiene el establecimiento y contrato.</p>
                <label className="block w-full cursor-pointer">
                  <input type="file" accept=".xml" className="hidden" onChange={handleXmlUpload} />
                  <div className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 inline-flex items-center gap-2">
                    Seleccionar Archivo XML
                    <ChevronRight size={20} />
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Step 2: Excel */}
          {step === 2 && (
            <div className="p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Upload size={40} />
                </div>
                <h2 className="text-2xl font-bold mb-2">Carga el Excel de Huéspedes</h2>
                <p className="text-slate-500 mb-8">Sube el archivo .xlsx con los registros de los viajeros.</p>
                <label className="block w-full cursor-pointer">
                  <input type="file" accept=".xlsx" className="hidden" onChange={handleExcelUpload} />
                  <div className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-emerald-200 inline-flex items-center gap-2">
                    Seleccionar Archivo Excel
                    <ChevronRight size={20} />
                  </div>
                </label>
                <button onClick={() => setStep(1)} className="block w-full mt-4 text-slate-400 hover:text-slate-600 font-medium text-sm">
                  Volver al paso anterior
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Preview Table */}
          {step === 3 && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold">Revisión de Huéspedes</h2>
                  <p className="text-sm text-slate-500">{guestRecords.length} registros encontrados</p>
                </div>
                <button 
                  onClick={() => setStep(4)} 
                  disabled={guestRecords.filter(r => r.errors.length === 0).length === 0}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
                >
                  Continuar a Transferencia
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 border-b border-slate-200">Estado</th>
                      <th className="px-4 py-3 border-b border-slate-200">Nombre</th>
                      <th className="px-4 py-3 border-b border-slate-200">Documento</th>
                      <th className="px-4 py-3 border-b border-slate-200">Nacionalidad</th>
                      <th className="px-4 py-3 border-b border-slate-200">Fecha Nac.</th>
                      <th className="px-4 py-3 border-b border-slate-200">Observaciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {guestRecords.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          {r.errors.length > 0 ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                              <AlertCircle size={14} /> Error
                            </span>
                          ) : r.warnings.length > 0 ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                              <AlertCircle size={14} /> Advertencia
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                              <CheckCircle2 size={14} /> Válido
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium">{r.nombre} {r.apellido1}</td>
                        <td className="px-4 py-3 text-slate-500">{r.tipoDocumento}: {r.numeroDocumento}</td>
                        <td className="px-4 py-3 text-slate-500">{r.nacionalidad}</td>
                        <td className="px-4 py-3 text-slate-500">{r.fechaNacimiento}</td>
                        <td className="px-4 py-3 max-w-xs">
                          {r.errors.map((e, idx) => (
                            <p key={idx} className="text-red-500 text-[10px] leading-tight">• {e}</p>
                          ))}
                          {r.warnings.map((w, idx) => (
                            <p key={idx} className="text-amber-500 text-[10px] leading-tight">• {w}</p>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Step 4: Confirm */}
          {step === 4 && (
            <div className="p-12 text-center">
              <div className="max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={40} />
                </div>
                <h2 className="text-2xl font-bold mb-6">Resumen de Transferencia</h2>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <p className="text-slate-500 text-sm font-medium mb-1">Huéspedes en XML</p>
                    <p className="text-3xl font-black">{xmlData?.numPersonas}</p>
                  </div>
                  <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                    <p className="text-indigo-600 text-sm font-medium mb-1">Nuevos a añadir</p>
                    <p className="text-3xl font-black text-indigo-600">
                      +{guestRecords.filter(r => r.errors.length === 0).length}
                    </p>
                  </div>
                </div>

                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-amber-800 text-left text-sm mb-8 flex items-start gap-3">
                  <AlertCircle className="shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="font-bold mb-1">Atención</p>
                    <p>Se omitirán {guestRecords.filter(r => r.errors.length > 0).length} registros con errores críticos. Los registros con advertencias se añadirán de todas formas.</p>
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <button onClick={() => setStep(3)} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-8 py-4 rounded-xl font-bold transition-all flex items-center gap-2">
                    <ChevronLeft size={20} />
                    Revisar Lista
                  </button>
                  <button onClick={handleTransfer} className="bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-4 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 flex items-center gap-2">
                    Transferir Datos al XML
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Result View */}
          {step === 5 && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">XML Generado</h2>
                <button 
                  onClick={downloadXml} 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-200"
                >
                  Consolidar y Descargar
                  <Download size={20} />
                </button>
              </div>

              <div className="bg-slate-900 rounded-xl p-4 overflow-auto max-h-[600px]">
                <pre className="text-emerald-400 text-xs font-mono leading-relaxed">
                  <code>{finalXml}</code>
                </pre>
              </div>
            </div>
          )}

          {/* Step 6: Finalize */}
          {step === 6 && (
            <div className="p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={40} />
                </div>
                <h2 className="text-3xl font-black mb-2">¡Todo Listo!</h2>
                <p className="text-slate-500 mb-8">La operación ha sido consolidada. Tu archivo XML ha sido descargado correctamente.</p>
                
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-left mb-8">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400 mb-4">Resumen de Consolidación</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Personas añadidas</span>
                      <span className="font-bold text-indigo-600">+{guestRecords.filter(r => r.errors.length === 0).length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Estado</span>
                      <span className="font-bold text-emerald-600">Consolidado</span>
                    </div>
                  </div>
                </div>

                <button onClick={() => window.location.reload()} className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 w-full">
                  Empezar Nueva Operación
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-6 py-12 text-center text-slate-400 text-sm">
        <p>© 2026 Hospedajes XML Pro • Una herramienta para el cumplimiento normativo</p>
        <p className="mt-1">Los datos se procesan localmente. Nunca abandonan tu equipo.</p>
      </footer>
    </div>
  );
}
