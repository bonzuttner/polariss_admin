import axios from 'axios'

// const apiUrl = "https://polarissfintech-cegee7efcuenffhq.japaneast-01.azurewebsites.net/v2/"
const apiUrl = import.meta.env.VITE_API_URL
// const apiUrl = "http://localhost:5000/v2/"
export default class Api {
  static ApiURL = apiUrl

  static call = async (requestBody, path, method, header,responseType) => {
    let url = path ? `${this.ApiURL}${path}` : this.ApiURL

    let headers = {
      'Content-Type': 'application/json',
      auth: header
        ? header
        : localStorage.getItem('userId')
        ? localStorage.getItem('userId')
        : '',
    }
    let axiosConfig = {
      headers,
      timeout: 1200000,
    };
    if (responseType) {
      axiosConfig.responseType = responseType;
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
          ? { ...axiosConfig, data: requestBody }
          : requestBody,
          axiosConfig
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
