import React, { createContext, useState, useContext, useEffect } from 'react';
import { useParams } from "react-router-dom";
import axios from "axios";

const RenderContext = createContext();

export const RenderProvider = ({ children }) => {
  const [renderSeleccionado, setRenderSeleccionado] = useState(0);
  const [loading, setLoading] = useState(true);

  const cambiarRender = (id) => {
    setRenderSeleccionado(id);
    setLoading(false);
  };

  // FETCH DATA PROJECT
  const params = useParams();
  const [dataProject, setdataProject] = useState({})

  const BASE_URL_CALC = import.meta.env.VITE_API_BASE_URL_CALCULATE;
  async function fetchDataProject() {
    console.log("params", params);
    const id_project = params.id;

    try {
      const response = await axios.get(`${BASE_URL_CALC}/api/v3/project/${id_project}`);
      setLoading(false);
      if (response.status === 200) {
        const projectData = response.data.data;
        console.log(projectData);
        setdataProject(projectData);

        const status_job = projectData.status_job;
        const job_id = projectData.job_id;

        // Si el proyecto no está terminado, empezamos el polling del Job
        if (status_job !== "finished" && job_id) {
          checkStatusJob(job_id);
        } 
      }
    } catch (error) {
      console.error("Error fetching project:", error);
      setLoading(false);
    }
  }

  // Sacamos esta función afuera o la mantenemos limpia para que reciba el job_id explícitamente
  async function checkStatusJob(job_id) {
    try {
      const response = await axios.get(`${BASE_URL_CALC}/api/v3/jobs/${job_id}`);

      if (response.status === 200) {
        const currentStatus = response.data.status;
        console.log(`Job status: ${currentStatus}`);

        if (currentStatus === "finished") {
          fetchDataProject();
          console.log("Terminó el proyecto")
          setLoading(true);
        } 
        else if(currentStatus === "failed"){
          console.log("failed Job Reintentar");
        }
        else {
          setTimeout(() => {
            console.log("Revisando status del job...");
            checkStatusJob(job_id);
          }, 2000);
        }
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Error checking job status:", error);
      setLoading(false);
    }
  }


  useEffect(() => {
    fetchDataProject();
  }, [params.id]);

  return (
    <RenderContext.Provider value={{ renderSeleccionado, setRenderSeleccionado, cambiarRender, loading, setLoading, dataProject }}>
      {children}
    </RenderContext.Provider>
  );
};

// 3. Custom hook para usar el contexto fácilmente
export const useRender = () => {
  const context = useContext(RenderContext);
  if (!context) {
    throw new Error('useRender debe usarse dentro de un RenderProvider');
  }
  return context;
};