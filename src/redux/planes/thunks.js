import { getShowPlanUserById, updatePersonalData } from "../../providers";
import { updatePerfil } from "../auth";
import { getPlanes } from "./planSlice";

export const getPlanUserById = () => {

    return async(dispatch, getState) => {
        
       const {uid} = getState().auth;
       //const id = 1;

      const resp = await getShowPlanUserById(uid)
      const {data } = resp.data
      dispatch(getPlanes(data))
    
 }



}


export const startSavePerfil = (flag, password = '', formState = {}) => {

    return async(dispatch, getState) => {
        const auth = getState().auth;
        const uid = auth.uid;
        const name = formState.name !== undefined ? formState.name : auth.name;
        const lastname = formState.lastname !== undefined ? formState.lastname : auth.lastname;
        const email = formState.email !== undefined ? formState.email : auth.email;

       const {data} = await updatePersonalData({ uid, name, lastname, email, password, flag })
       const user = data.data

       dispatch(updatePerfil({
        uid: user.id,
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        successMessage: data.msg
    }))

  }

    
}