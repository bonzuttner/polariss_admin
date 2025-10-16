import axios from 'axios'

const apiUrl = import.meta.env.VITE_API_URL 
export default class Api {
  static ApiURL = apiUrl

  static call = async (requestBody, path, method, header) => {
    let url = path ? `${this.ApiURL}${path}` : this.ApiURL

    let headers = {
      'Content-Type': 'application/json',
      auth: header
        ? header
        : localStorage.getItem('userId')
        ? localStorage.getItem('userId')
        : '',
    }

    try {
      const response = await axios[method](
        url,
        method === 'get'
          ? {
              headers: headers,
              timeout: 1200000,
            }
          : method === 'delete'
          ? {
              headers: headers,
              data: requestBody,

                }
          : requestBody,
        {
          headers: headers,
          timeout: 1200000,
        }
        // , {crossDomain: true}
      )
      return response
    } catch (e) {
      if (e.response) {
        return e.response
      } else return e
    }
  }


  // ✅ FormData version for file uploads
  static callFormData = async (formData, path, method = "post", header) => {
    const url = path ? `${this.ApiURL}${path}` : this.ApiURL;

    const headers = {
      auth:
          header ??
          localStorage.getItem("userId") ??
          "",
      // ❗ No 'Content-Type': axios handles FormData automatically
    };

    try {
      const response = await axios({
        method,
        url,
        data: formData,
        headers,
        timeout: 1200000,
      });

      return response;
    } catch (e) {
      return e.response || e;
    }
  };
}
