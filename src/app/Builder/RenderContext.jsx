import React, { createContext, useState, useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const RenderContext = createContext();

export const RenderProvider = ({ children }) => {
  const [renderSeleccionado, setRenderSeleccionado] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const params = useParams();
  const [dataProject, setdataProject] = useState({});

  const BASE_URL_CALC = import.meta.env.VITE_API_BASE_URL_CALCULATE;

  // ============================================
  // OBTENER DATOS DEL PROYECTO
  // ============================================
  async function fetchDataProject() {
    const id_project = params.id;
    if (!id_project) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${BASE_URL_CALC}/api/v3/project/${id_project}`);

      if (response.status === 200) {
        const projectData = response.data.data;
        setdataProject(projectData);

        const status_job = projectData.status_job;
        const job_id = projectData.job_id;

        if (status_job === "finished") {
          setLoading(false);
        } else if (status_job !== "finished" && job_id) {
          checkStatusJob(job_id);
        } else {
          setLoading(false);
        }
      }
    } catch (err) {
      console.error("Error fetching project:", err);
      setError("Error al cargar el proyecto");
      setLoading(false);
    }
  }

  // ============================================
  // ENCOLAR JOB DE GENERACIÓN
  // ============================================
  async function generarPlano() {
    const id_project = params.id;
    if (!id_project) return;

    setLoading(true);
    setError(null);

    try {
      console.log("🚀 Obteniendo datos del proyecto para generar:", id_project);

      const projectResponse = await axios.get(`${BASE_URL_CALC}/api/v3/project/${id_project}`);

      if (projectResponse.status !== 200) {
        throw new Error("No se pudieron obtener los datos del proyecto");
      }

      const projectData = projectResponse.data.data;

      // ============================================================
      // 🛠️ FIX: Mapear nombres de columnas de la DB a los campos
      //     que espera el modelo ProjectRequest de FastAPI
      // ============================================================
      // DB guarda como "manager" → FastAPI espera "responsable"
      // DB guarda como "client"   → FastAPI espera "cliente"
      // DB guarda como "ubication" → FastAPI espera "departamento"
      // DB guarda como "vertices_terreno_utm" → FastAPI espera "vertices"
      // ============================================================
      // --- INICIO DEL PAYLOAD A PRUEBA DE BALAS ---
      let verticesParaEnviar = projectData.vertices || projectData.vertices_terreno_utm || [];

      // PUNTO 2 DE ANTIGRAVITY: Parsear vertices si vienen como String JSON de la BD
      if (typeof verticesParaEnviar === 'string') {
        try {
          verticesParaEnviar = JSON.parse(verticesParaEnviar);
        } catch (e) {
          console.error("Error parseando vértices:", e);
          verticesParaEnviar = [];
        }
      }
      if (!Array.isArray(verticesParaEnviar)) {
        verticesParaEnviar = [];
      }

      let aforoParaEnviar = projectData.aforo || [];
      // PUNTO 3 DE ANTIGRAVITY: Parsear aforo si viene como String JSON de la BD
      if (typeof aforoParaEnviar === 'string') {
        try {
          aforoParaEnviar = JSON.parse(aforoParaEnviar);
        } catch (e) {
          console.warn("⚠️ No se pudo parsear aforo, enviando array vacío", e);
          aforoParaEnviar = [];
        }
      }
      if (!Array.isArray(aforoParaEnviar)) {
        aforoParaEnviar = [];
      }

      // [DOCUMENTACIÓN] Se extrae y parsea el campo ambientes para ser enviado a la geometry API
      let ambientesParaEnviar = projectData.ambientes || [];
      if (typeof ambientesParaEnviar === 'string') {
        try {
          ambientesParaEnviar = JSON.parse(ambientesParaEnviar);
        } catch (e) {
          console.warn("⚠️ No se pudo parsear ambientes, enviando array vacío", e);
          ambientesParaEnviar = [];
        }
      }
      if (!Array.isArray(ambientesParaEnviar)) {
        ambientesParaEnviar = [];
      }

      const payload = {
        // PUNTO 1 DE ANTIGRAVITY: Evitar el error min_length=2 de Pydantic
        name: projectData.name?.trim() || "Sin Nombre", 
        
        tipologia: projectData.tipologia || "Educación", // PUNTO 4: Evitar string vacío
        zone: projectData.zone || "Urbano",             // PUNTO 4: Evitar string vacío
        tipo: projectData.tipo || "UNIDOCENTE",          // PUNTO 4: Evitar string vacío

        departamento: projectData.departamento || projectData.ubication || "",
        provincia: projectData.provincia || "",
        distrito: projectData.distrito || "",
        responsable: projectData.responsable || projectData.manager || "",
        cliente: projectData.cliente || projectData.client || "",
        
        // PUNTO 2 Y 3: Enviar el array ya parseado
        vertices: verticesParaEnviar, 
        
        // PUNTO 3: Asegurar que aforo sea un array limpio
        aforo: aforoParaEnviar,       
        
        id_version: projectData.id_version,

        // [DOCUMENTACIÓN] Se agregan number_floors y ambientes al payload de generarPlano
        number_floors: parseInt(projectData.number_floors || 1, 10),
        ambientes: ambientesParaEnviar
      };
      // --- FIN DEL PAYLOAD ---

      console.log("📤 Enviando solicitud de generación... con payload:", payload);
      const generateResponse = await axios.post(
        `${BASE_URL_CALC}/api/v3/generate-project`,
        payload
      );

      if (generateResponse.status === 200) {
        const { job_id, project_id } = generateResponse.data;
        console.log(`✅ Job encolado - Job ID: ${job_id}, Project ID: ${project_id}`);
        setTimeout(() => {
          fetchDataProject();
        }, 3000);
      }
    } catch (err) {
      console.error("❌ Error al encolar el job:", err.response?.data || err.message);
      setError("Error al iniciar la generación. Intenta de nuevo.");
      setLoading(false);
    }
  }

  // ============================================
  // CONSULTAR ESTADO DEL JOB CON TIMEOUT
  // ============================================
  async function checkStatusJob(job_id) {
    let intentos = 0;
    const MAX_INTENTOS = 60; // 60 * 3 seg = 3 minutos máximo
    setJobStatus("generating");

    async function consultar() {
      intentos++;

      if (intentos > MAX_INTENTOS) {
        setError("La generación tardó demasiado. Intenta de nuevo.");
        setLoading(false);
        setJobStatus(null);
        return;
      }

      try {
        const response = await axios.get(`${BASE_URL_CALC}/api/v3/jobs/${job_id}`);

        if (response.status === 200) {
          const currentStatus = response.data.status;
          console.log(`⏳ Intento ${intentos} - Job status: ${currentStatus}`);

          if (currentStatus === "finished") {
            console.log("✅ Plano generado exitosamente");
            setJobStatus("finished");
            fetchDataProject();
          } else if (currentStatus === "failed") {
            // [DOCUMENTACIÓN] Se eliminó la llamada automática a generarPlano() que causaba un bucle infinito en caso de fallos persistentes del worker.
            console.log("❌ Job falló");
            setJobStatus("failed");
            setError("La generación del plano falló. Por favor, haz clic en Reintentar.");
            setLoading(false);
          } else {
            setTimeout(consultar, 3000);
          }
        } else {
          setError("Error al verificar el estado del trabajo");
          setLoading(false);
          setJobStatus(null);
        }
      } catch (err) {
        console.error("Error consultando job:", err);

        // ==========================================
        // ✅ EL FIX DEL ERROR 404 ESTÁ AQUÍ
        // ==========================================
        if (err.response && err.response.status === 404) {
          console.log("El Job ya no existe en memoria. Se necesita generar uno nuevo.");
          setError("El proceso anterior se perdió. Haz clic en reintentar.");
          setLoading(false);
          setJobStatus(null);
          return; // Esto detiene el bucle infinito de la consola
        }
        // Si es otro error de red, sigue intentando
        setTimeout(consultar, 3000);
      }
    }

    consultar();
  }

  // ============================================
  // CAMBIAR RENDER (Acción de los botones)
  // ============================================
  const cambiarRender = (index) => {
    setLoading(true);
    setRenderSeleccionado(index);
    setJobStatus(null);

    if (index === 2) {
      if (!dataProject.status_job ||
        dataProject.status_job === "failed" ||
        dataProject.status_job === "processing" ||
        dataProject.status_job === "queued" ||
        dataProject.status_job === "started") {
        generarPlano();
      }
    }
  };

  const retryJob = () => {
    generarPlano();
  };

  useEffect(() => {
    fetchDataProject();
  }, [params.id]);

  return (
    <RenderContext.Provider value={{
      renderSeleccionado,
      setRenderSeleccionado,
      cambiarRender,
      loading,
      setLoading,
      dataProject,
      error,
      setError,
      jobStatus,
      setJobStatus,
      retryJob,
      generarPlano
    }}>
      {children}
    </RenderContext.Provider>
  );
};

export const useRender = () => {
  const context = useContext(RenderContext);
  if (!context) throw new Error("useContext must be used within a Provider");
  return context;
};