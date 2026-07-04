// [DOCUMENTACIÓN] Custom Hook useApi para la sincronización del proyecto con ProBudgets.
// Mapea la información técnica del proyecto (áreas, cimentaciones, ambientes) y realiza la petición POST.

export const useApi = () => {
  const sendData = async (projectData) => {
    const baseUrl = import.meta.env.VITE_URL_PROBUDGETS || "https://probudget.pro-invest.pe";
    const endpoint = `${baseUrl}/v1/integracion/sync`;
    const token = import.meta.env.VITE_PROBUDGETS_TOKEN || localStorage.getItem('token') || "TU_TOKEN_BEARER_AQUI";

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
      ambientes = parsedAmbientes.map(amb => ({
        tipo: amb.tipo || amb.ambiente || "Aula",
        cantidad: parseInt(amb.cantidad || amb.count || 1),
        area: parseFloat(parseFloat(amb.area || amb.superficie || 50.0).toFixed(2))
      }));
    } else if (projectData.aforo) {
      let aforoData = [];
      try {
        aforoData = typeof projectData.aforo === 'string'
          ? JSON.parse(projectData.aforo)
          : projectData.aforo;
      } catch (e) {}
      if (Array.isArray(aforoData)) {
        aforoData.forEach(item => {
          if (item.cantidad_aulas > 0) {
            ambientes.push({
              tipo: `Aula ${item.grado || 'General'}`,
              cantidad: parseInt(item.cantidad_aulas),
              area: 50.0
            });
          }
        });
      }
    }

    if (ambientes.length === 0) {
      ambientes.push({
        tipo: "Aula General",
        cantidad: 1,
        area: areaTechada || 50.0
      });
    }

    // 5. Build payload
    const payload = {
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
      exteriores: (projectData.exteriores || [
        {
          tipo: "Patio",
          cantidad: 1,
          area: 40.0
        }
      ]).map(ext => ({
        tipo: ext.tipo || "Patio",
        cantidad: parseInt(ext.cantidad || ext.count || 1),
        area: parseFloat(parseFloat(ext.area || 40.0).toFixed(2))
      }))
    };

    console.log("📤 Sync payload to ProBudgets:", payload);

    let response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
