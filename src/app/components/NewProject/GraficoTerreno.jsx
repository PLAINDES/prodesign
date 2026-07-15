import Plotly from 'plotly.js/dist/plotly'; // Importa la versión pre-construida para evitar errores de Vite
import { useEffect, useState } from 'react';
import createPlotlyComponent from 'react-plotly.js/factory';

const Plot = createPlotlyComponent(Plotly);

const GraficoTerreno = ({ datos, indiceSeleccionado, setIndiceSeleccionado, setValueForm }) => {

    const [revision, setRevision] = useState(0);
    // ⏳ Estado para controlar la pantalla de carga del gráfico
    const [cargando, setCargando] = useState(false);

    // Escucha cambios globales en las props entrantes (Nuevo Terreno)
    useEffect(() => {
        setIndiceSeleccionado(0);
        setCargando(true);
        setRevision(prev => prev + 1);

        // 🔥 Registrar la primera opción por defecto en react-hook-form al cargar nuevos datos
        if (datos && Array.isArray(datos) && datos[0]?.vertices?.maximo_cuadrante) {
            setValueForm("maximo_cuadrante", datos[0].vertices.maximo_cuadrante);
        }

        const timer = setTimeout(() => {
            setCargando(false);
        }, 350); // Tiempo suficiente para que el DOM asimile el cambio

        return () => clearTimeout(timer);
    }, [datos, setValueForm, setIndiceSeleccionado]);

    // Función manejadora para los clics en las cards individuales
    const cambiarOpcion = (index) => {
        if (index === indiceSeleccionado) return;
        setCargando(true);
        setIndiceSeleccionado(index);
        setRevision(prev => prev + 1);
        
        // 🔥 Guardar el array del máximo cuadrante correspondiente en el react-hook-form
        if (datos && datos[index]?.vertices?.maximo_cuadrante) {
            setValueForm("terreno_maximo_cuadrante", datos[index]);
        }

        const timer = setTimeout(() => {
            setCargando(false);
        }, 300);

        return () => clearTimeout(timer);
    };

    // Validación de carga inicial absoluta
    if (!datos || !Array.isArray(datos) || datos.length === 0) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontFamily: 'sans-serif' }}>
                <p style={{ fontSize: '16px', fontWeight: '500' }}>Cargando opciones de terreno y cuadrantes...</p>
            </div>
        );
    }

    const opcionActual = datos[indiceSeleccionado];
    
    if (!opcionActual || !opcionActual.vertices) {
        return <p style={{ fontFamily: 'sans-serif', color: '#ef4444' }}>Estructura de datos inválida.</p>;
    }

    const { terreno, maximo_cuadrante } = opcionActual.vertices;

    const traceTerreno = {
        x: terreno.map(p => p[0]),
        y: terreno.map(p => p[1]),
        fill: 'toself',
        fillcolor: 'rgba(0, 100, 255, 0.15)',
        line: { color: 'blue', width: 2 },
        mode: 'lines',
        name: 'Terreno Original'
    };

    const traceCuadrante = {
        x: maximo_cuadrante.map(p => p[0]),
        y: maximo_cuadrante.map(p => p[1]),
        fill: 'toself',
        fillcolor: 'rgba(255, 0, 0, 0.35)',
        line: { color: 'red', width: 2 },
        mode: 'lines',
        name: `Opción ${indiceSeleccionado + 1}`
    };

    return (
        <div style={{ fontFamily: 'sans-serif', width: '100%' }}>
            
            {/* 🗂️ SECCIÓN DE CARDS SELECCIONABLES */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                {datos.map((opcion, index) => {
                    const esActivo = index === indiceSeleccionado;
                    return (
                        <div
                            key={`${index}-${revision}`}
                            onClick={() => cambiarOpcion(index)}
                            style={{
                                flex: 1,
                                padding: '16px',
                                borderRadius: '8px',
                                border: esActivo ? '2px solid #ef4444' : '1px solid #e2e8f0',
                                backgroundColor: esActivo ? '#fef2f2' : '#ffffff',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: esActivo ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
                                textAlign: 'center',
                                opacity: cargando ? 0.6 : 1 // Feedback visual en las cards durante recarga
                            }}
                        >
                            <h4 style={{ margin: '0 0 8px 0', color: esActivo ? '#b91c1c' : '#475569' }}>
                                Opción {index + 1}
                            </h4>
                            <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>
                                {opcion.area_m2 ? `${opcion.area_m2.toFixed(2)} m²` : '0 m²'}
                            </p>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>
                                Cuadrante Máximo {index + 1}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* 📊 CONTENEDOR DEL GRÁFICO CON OVERLAY DE CARGA */}
            <div 
                key={`plot-container-${revision}`} 
                style={{ 
                    position: 'relative', // Necesario para posicionar el spinner encima
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px', 
                    overflow: 'hidden',
                    backgroundColor: '#ffffff'
                }}
            >
                {/* 🌀 Capa de carga translúcida */}
                {cargando && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(255, 255, 255, 0.83)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 10,
                        backdropFilter: 'blur(2px)',
                        transition: 'opacity 0.2s ease'
                    }}>
                        <div style={{
                            border: '4px solid #f3f3f3',
                            borderTop: '4px solid #ef4444',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            animation: 'spin 1s linear infinite',
                            marginBottom: '12px'
                        }} />
                        <p style={{ margin: 0, color: '#1e293b', fontWeight: '500', fontSize: '14px' }}>
                            Procesando geometría...
                        </p>
                        
                        <style>{`
                            @keyframes spin {
                                0% { transform: rotate(0deg); }
                                100% { transform: rotate(360deg); }
                            }
                        `}</style>
                    </div>
                )}

                <Plot
                    data={[traceTerreno, traceCuadrante]}
                    layout={{
                        autosize: true,
                        title: `Visualización: Opción ${indiceSeleccionado + 1} (${opcionActual.area_m2?.toFixed(2)} m²)`,
                        xaxis: { title: 'Coordenada X', autorange: true },
                        yaxis: { title: 'Coordenada Y', scaleanchor: 'x', scaleratio: 1, autorange: true },
                        margin: { l: 50, r: 50, b: 50, t: 50 },
                        datarevision: revision 
                    }}
                    useResizeHandler={true}
                    style={{ width: "100%", height: "500px" }}
                />
            </div>
        </div>
    );
};

export default GraficoTerreno;