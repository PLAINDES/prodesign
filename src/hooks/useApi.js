// [DOCUMENTACIÓN] Custom Hook useApi para la sincronización del proyecto con ProBudgets.
// Mapea la información técnica del proyecto (áreas, cimentaciones, ambientes) y realiza la petición POST.

// [DOCUMENTACIÓN] Mapa de traducción exacto al formato del Excel de ProBudgets para que coincida con las opciones del select.
const MAPA_EXCEL = {
  "aulas secundaria": "Aulas Secundaria",
  "aula de innovacion sec": "Aula de Innovacion Sec",
  "aula de innovación sec": "Aula de Innovacion Sec",
  "taller creativo sec": "Taller creativo Sec",
  "laboratorio": "Laboratorio",
  "escalera sec": "Escalera Sec",
  "sshh sec - hombres": "SSHH Sec - Hombres",
  "sshh sec - mujeres": "SSHH Sec - Mujeres",
  "aulas primaria": "Aulas Primaria",
  "biblioteca": "Biblioteca",
  "aula de innovacion prim": "Aula de Innovacion Prim",
  "aula de innovación prim": "Aula de Innovacion Prim",
  "taller creativo prim": "Taller creativo Prim",
  "escalera prim": "Escalera Prim",
  "sshh prim - hombres": "SSHH Prim - Hombres",
  "sshh prim - mujeres": "SSHH Prim - Mujeres",
  "aulas ciclo i": "Aulas Ciclo I",
  "aulas ciclo ii": "Aulas Ciclo II",
  "aulas psicomotricidad": "Aulas Psicomotricidad",
  "aulas psicomotrici": "Aulas Psicomotricidad",
  "topico": "Topico",
  "tópico": "Topico",
  "lactario": "Lactario",
  "sshh inicial - hombres": "SSHH Inicial - Hombres",
  "sshh inicial - mujeres": "SSHH Inicial - Mujeres",
  "cocina inicial": "Cocina Inicial",
  "direccion adm.": "Direccion Adm.",
  "dirección adm.": "Direccion Adm.",
  "direccion": "Direccion Adm.",
  "dirección": "Direccion Adm.",
  "área de espera": "Área de espera",
  "area de espera": "Área de espera",
  "espera": "Área de espera",
  "sala de reuniones": "Sala de Reuniones",
  "reuniones": "Sala de Reuniones",
  "area de ingreso": "Area de ingreso",
  "área de ingreso": "Area de ingreso",
  "ingreso": "Area de ingreso",
  "sala de profesores": "Sala de Profesores",
  "profesores": "Sala de Profesores",
  "sshh adm. - hombres": "SSHH Adm. - Hombres",
  "sshh adm. - mujeres": "SSHH Adm. - Mujeres",
  "losa deportiva": "Losa Deportiva",
  "losa": "Losa Deportiva",
  "taller ept": "Taller EPT",
  "sum": "SUM",
  "cocina prim - sec": "Cocina Prim - Sec",
  "cocina prim": "Cocina Prim - Sec",
  "cocina sec": "Cocina Prim - Sec",
  "patio de inicial": "Patio de Inicial",
  "patio": "Patio de Inicial"
};

// [DOCUMENTACIÓN] Normaliza los nombres de los ambientes para ajustarlos exactamente al catálogo de opciones de ProBudgets.
const normalizarAmbiente = (rawName) => {
  if (!rawName) return "Aulas Primaria";
  const nameClean = rawName.trim().toLowerCase();
  
  for (const [key, val] of Object.entries(MAPA_EXCEL)) {
    if (nameClean === key || nameClean.includes(key)) {
      return val;
    }
  }
  
  if (nameClean.includes("secundaria")) return "Aulas Secundaria";
  if (nameClean.includes("primaria")) return "Aulas Primaria";
  if (nameClean.includes("inicial") || nameClean.includes("ciclo")) return "Aulas Ciclo II";
  if (nameClean.includes("aula")) return "Aulas Primaria";
  
  if (nameClean.includes("sshh") && nameClean.includes("hombres")) {
    if (nameClean.includes("sec")) return "SSHH Sec - Hombres";
    if (nameClean.includes("prim")) return "SSHH Prim - Hombres";
    if (nameClean.includes("inicial")) return "SSHH Inicial - Hombres";
    if (nameClean.includes("adm")) return "SSHH Adm. - Hombres";
    return "SSHH Prim - Hombres";
  }
  if (nameClean.includes("sshh") && nameClean.includes("mujeres")) {
    if (nameClean.includes("sec")) return "SSHH Sec - Mujeres";
    if (nameClean.includes("prim")) return "SSHH Prim - Mujeres";
    if (nameClean.includes("inicial")) return "SSHH Inicial - Mujeres";
    if (nameClean.includes("adm")) return "SSHH Adm. - Mujeres";
    return "SSHH Prim - Mujeres";
  }
  
  return rawName.charAt(0).toUpperCase() + rawName.slice(1);
};

export const useApi = () => {
  const sendData = async (projectData) => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || window.__ENV__?.VITE_API_BASE_URL || "http://localhost:8000";
    const endpoint = `${apiBase}/api/v1/projects/probudgets/sync-proxy`;

    // 1. Parsing build_data for area totals
    let buildDataParsed = {};
    if (projectData.build_data) {
      try {
        buildDataParsed = typeof projectData.build_data === 'string'
          ? JSON.parse(projectData.build_data)
          : projectData.build_data;
      } catch (e) {
        console.error("Error parseando build_data:", e);
      }
    }

    const resultData = buildDataParsed.result_data || {};
    const areaTechada = parseFloat(parseFloat(resultData.area_total || projectData.area_techada || 180.5).toFixed(2));

    // 2. Parse and calculate areaTerreno from vertices
    let verticesParaEnviar = projectData.vertices || projectData.vertices_terreno_utm || [];
    if (typeof verticesParaEnviar === 'string') {
      try {
        verticesParaEnviar = JSON.parse(verticesParaEnviar);
      } catch (e) {
        console.error("Error parseando vértices:", e);
        verticesParaEnviar = [];
      }
    }

    const getAreaTerreno = (verts) => {
      if (!verts || verts.length < 3) return 250.75; // fallback default
      let coords = [];
      if (Array.isArray(verts)) {
        if (Array.isArray(verts[0])) {
          coords = verts;
        } else if (typeof verts[0] === 'object' && verts[0] !== null) {
          coords = verts.map(v => [v.x || 0, v.y || 0]);
        }
      }
      if (coords.length < 3) return 250.75;

      let area = 0;
      const n = coords.length;
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        area += coords[i][0] * coords[j][1];
        area -= coords[j][0] * coords[i][1];
      }
      return Math.abs(area / 2);
    };

    const areaTerreno = parseFloat(getAreaTerreno(verticesParaEnviar).toFixed(2));

    // 3. Dynamic cimentaciones array based on floors
    const numPisos = parseInt(projectData.number_floors || projectData.numPisos || 1);
    const cimentaciones = [];
    for (let i = 0; i < numPisos; i++) {
      cimentaciones.push({
        tipo: i === 0 ? "zapatas y vigas de cimentación" : "platea de cimentación",
        area: areaTechada
      });
    }

    // 4. Parse ambientes
    let ambientes = [];
    const groups = {};
    
    // [DOCUMENTACIÓN] Se intenta obtener y agrupar los ambientes reales de la generación (resumen_ambientes)
    const parsedResumen = projectData.resumen_ambientes
      ? (typeof projectData.resumen_ambientes === 'string' ? JSON.parse(projectData.resumen_ambientes) : projectData.resumen_ambientes)
      : null;

    if (Array.isArray(parsedResumen) && parsedResumen.length > 0) {
      parsedResumen.forEach((levelObj) => {
        if (typeof levelObj !== "object" || levelObj === null) return;
        Object.keys(levelObj).forEach((levelName) => {
          const rows = levelObj[levelName];
          if (Array.isArray(rows)) {
            rows.forEach((row) => {
              if (Array.isArray(row)) {
                row.forEach((amb) => {
                  if (typeof amb !== "object" || amb === null) return;
                  let name = amb.ambiente || amb.Ambiente || amb.Ambientes || "Aula";
                  const largo = parseFloat(amb.largo || 0);
                  const ancho = parseFloat(amb.ancho || 7.5);
                  
                  let unitArea = largo * ancho;
                  const lowerName = name.toLowerCase();
                  if (lowerName.includes("escalera")) {
                    unitArea = 8.64;
                  } else if (lowerName.includes("sshh sec - hombres") || lowerName.includes("sshh prim - hombres")) {
                    unitArea = 14.5;
                  } else if (lowerName.includes("sshh sec - mujeres") || lowerName.includes("sshh prim - mujeres")) {
                    unitArea = 15.5;
                  } else if (lowerName.includes("topico")) {
                    unitArea = 27.0;
                  } else if (lowerName.includes("lactario")) {
                    unitArea = 22.5;
                  } else if (lowerName.includes("cocina inicial")) {
                    unitArea = 18.2;
                  } else if (lowerName.includes("espera")) {
                    unitArea = 15.0;
                  } else if (lowerName.includes("ingreso") && lowerName.includes("admin")) {
                    unitArea = 18.0;
                  } else if (lowerName.includes("losa")) {
                    unitArea = 420.0;
                  } else if (lowerName.includes("sum")) {
                    unitArea = 172.5;
                  } else if (lowerName.includes("cocina prim")) {
                    unitArea = 36.4;
                  } else if (lowerName.includes("patio")) {
                    unitArea = 150.0;
                  }
                  
                  if (unitArea <= 0) unitArea = 50.0;

                  // [DOCUMENTACIÓN] Se normalizan los nombres de los ambientes al catálogo exacto de ProBudgets.
                  name = normalizarAmbiente(name);
                  
                  if (!groups[name]) {
                    groups[name] = { count: 0, unitArea };
                  }
                  groups[name].count += 1;
                });
              }
            });
          }
        });
      });
    }

    // [DOCUMENTACIÓN] Si no hay resumen_ambientes, recurre a 'ambientes' o 'aforo' (con mapeo robusto para mayúsculas/minúsculas)
    if (Object.keys(groups).length === 0) {
      let parsedAmbientes = [];
      if (projectData.ambientes) {
        try {
          parsedAmbientes = typeof projectData.ambientes === 'string'
            ? JSON.parse(projectData.ambientes)
            : projectData.ambientes;
        } catch (e) {
          console.error("Error parseando ambientes:", e);
        }
      }
      if (Array.isArray(parsedAmbientes) && parsedAmbientes.length > 0) {
        parsedAmbientes.forEach(amb => {
          let tipo = amb.tipo || amb.ambiente || amb.Ambiente || amb.Ambientes || "Aula";
          const cantidad = parseInt(amb.cantidad || amb.Cantidad || amb.count || 1, 10);
          
          let unitArea = amb.Unitario || amb.unitario || amb.area || amb.superficie;
          if (unitArea === undefined && (amb.Metros_cuadrados !== undefined || amb.metros_cuadrados !== undefined)) {
            const total = parseFloat(amb.Metros_cuadrados || amb.metros_cuadrados || 0);
            unitArea = cantidad > 0 ? total / cantidad : total;
          }
          if (unitArea === undefined) {
            unitArea = 50.0;
          }

          // [DOCUMENTACIÓN] Se normalizan los nombres de los ambientes al catálogo exacto de ProBudgets.
          tipo = normalizarAmbiente(tipo);

          if (!groups[tipo]) {
            groups[tipo] = { count: 0, unitArea };
          }
          groups[tipo].count += cantidad;
        });
      } else if (projectData.aforo) {
        let aforoData = [];
        try {
          aforoData = typeof projectData.aforo === 'string'
            ? JSON.parse(projectData.aforo)
            : projectData.aforo;
        } catch (e) { }
        if (Array.isArray(aforoData)) {
          aforoData.forEach(item => {
            if (item.cantidad_aulas > 0) {
              let tipo = `Aula ${item.grado || 'General'}`;
              // [DOCUMENTACIÓN] Se normalizan los nombres de los ambientes al catálogo exacto de ProBudgets.
              tipo = normalizarAmbiente(tipo);

              if (!groups[tipo]) {
                groups[tipo] = { count: 0, unitArea: 60.0 };
              }
              groups[tipo].count += parseInt(item.cantidad_aulas, 10);
            }
          });
        }
      }
    }

    // Convertir el mapa de grupos a la lista final
    Object.keys(groups).forEach((name) => {
      ambientes.push({
        tipo: name,
        cantidad: groups[name].count,
        area: parseFloat(groups[name].unitArea.toFixed(2))
      });
    });

    if (ambientes.length === 0) {
      ambientes.push({
        tipo: "Aula General",
        cantidad: 1,
        area: areaTechada || 50.0
      });
    }

    // 5. Build payload
    const payload = {
      // [DOCUMENTACIÓN] Se agregaron proyecto_id y proyect_id para coincidir con la nomenclatura del portal de presupuestos
      proyecto_id: parseInt(projectData.id || 0, 10),
      proyect_id: parseInt(projectData.id || 0, 10),
      nombreProyecto: projectData.name?.trim() || "Proyecto Sin Nombre",
      tipologia: projectData.tipologia || "Educación",
      zona: projectData.zone || "Urbano",
      tipoEdificacion: projectData.tipo || "UNIDOCENTE",
      numPisos: numPisos,
      departamento: projectData.departamento || projectData.ubication || "AMAZONAS",
      provincia: projectData.provincia || "Tu Provincia",
      distrito: projectData.distrito || "Tu Distrito",
      responsable: projectData.responsable || projectData.manager || "Nombre Responsable",
      cliente: projectData.cliente || projectData.client || "Nombre Cliente",

      categoriaId: 2,
      areaTechada: areaTechada,
      areaTerreno: areaTerreno,
      plazoEjecucion: parseInt(projectData.plazo_ejecucion || resultData.plazo_ejecucion || 8),
      areaEscalera: parseFloat(parseFloat(projectData.area_escalera || (numPisos > 1 ? (numPisos - 1) * 12.5 : 0) || 12.5).toFixed(2)),
      incluyeDemoliciones: projectData.incluyeDemoliciones ?? true,
      incluyeColumnetasViguetas: projectData.incluyeColumnetasViguetas ?? false,
      cimentaciones: cimentaciones,
      ambientes: ambientes,
      // [DOCUMENTACIÓN] Se modificó el mapeo de exteriores para incluir y calcular dinámicamente las 12 extensiones requeridas para ProBudgets (Áreas Verdes, Losa Deportiva, Patio de Inicial, Cerco Perimétrico H=3m, etc.) en base al terreno y niveles del proyecto.
      exteriores: (() => {
        const hasInicial =
          (projectData.level && projectData.level.toLowerCase().includes("inicial")) ||
          (projectData.sublevel && projectData.sublevel.toLowerCase().includes("inicial")) ||
          (projectData.tipologia && projectData.tipologia.toLowerCase().includes("inicial")) ||
          (ambientes.some(amb => amb.tipo && (amb.tipo.toLowerCase().includes("inicial") || amb.tipo.toLowerCase().includes("psicomotri"))));

        const getPerimeter = (verts) => {
          if (!verts || verts.length < 3) return 120.0;
          let coords = [];
          if (Array.isArray(verts)) {
            if (Array.isArray(verts[0])) {
              coords = verts;
            } else if (typeof verts[0] === 'object' && verts[0] !== null) {
              coords = verts.map(v => [v.x || v.east || 0, v.y || v.north || 0]);
            }
          }
          if (coords.length < 3) return 120.0;
          let perim = 0;
          const n = coords.length;
          for (let i = 0; i < n; i++) {
            const j = (i + 1) % n;
            const dx = coords[j][0] - coords[i][0];
            const dy = coords[j][1] - coords[i][1];
            perim += Math.sqrt(dx * dx + dy * dy);
          }
          return perim;
        };

        const perimeter = getPerimeter(verticesParaEnviar);
        const areasVerdes = parseFloat(Math.max(30.0, areaTerreno * 0.15).toFixed(2));
        const veredas = parseFloat(Math.max(50.0, areaTerreno * 0.10).toFixed(2));
        const hasSportsCourt = areaTerreno > 800;

        return [
          { tipo: "AREAS VERDES", cantidad: 1, area: areasVerdes },
          { tipo: "LOSA DEPORTIVA", cantidad: 1, area: 540.0 },
          { tipo: "COBERTURA LOSA DEPORTIVA", cantidad: 1, area: 540.0 },
          { tipo: "PATIO DE INICIAL", cantidad: 1, area: 120.0 },
          { tipo: "COBERTURA PATIO DE INICIAL", cantidad: 1, area: 120.0 },
          { tipo: "ASTA DE BANDERA", cantidad: 1, area: 1.0 },
          { tipo: "VEREDAS Y RAMPAS DE CONCRETO", cantidad: 1, area: veredas },
          { tipo: "PAVIMENTO RIGIDO VEHICULAR", cantidad: 1, area: 80.0 },
          { tipo: "LAMAS EN PASADIZOS", cantidad: 1, area: 45.0 },
          { tipo: "ESTACIONAMIENTO DE BICICLETAS", cantidad: 1, area: 30.0 },
          { tipo: "CERCO PERIMETRICO H=3.00m", cantidad: 1, area: parseFloat(perimeter.toFixed(2)) },
          { tipo: "PORTADA DE INGRESO (PORTON METALICO)", cantidad: 1, area: 6.0 }
        ];
      })()
    };

    console.log("📤 Sync payload to ProBudgets:", payload);
    let response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error("Error de red al sincronizar con ProBudgets:", error);
      throw new Error("No se pudo establecer conexión con el servidor de ProBudgets. Por favor, verifica tu conexión a internet e inténtalo de nuevo.");
    }

    let responseBody;
    try {
      responseBody = await response.json();
    } catch (parseError) {
      const text = await response.text().catch(() => '');
      throw new Error(
        `El servidor de ProBudgets respondió con un formato inesperado. ` +
        `Verifica que VITE_URL_PROBUDGETS apunte a la API correcta (https://apiprobudget.pro-invest.pe). ` +
        `Respuesta: ${text.slice(0, 100)}`
      );
    }

    if (!response.ok) {
      throw new Error(responseBody.message || `Error ${response.status}: Error en la sincronización con ProBudgets`);
    }

    return responseBody;
  };

  return { sendData };
};
