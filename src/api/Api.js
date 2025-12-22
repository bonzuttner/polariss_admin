import axios from 'axios'

// const apiUrl = "https://polarissfintech-cegee7efcuenffhq.japaneast-01.azurewebsites.net/v2/"
const apiUrl = import.meta.env.VITE_API_URL
// const apiUrl = "http://localhost:5000/v2/"
export default class Api {
  static ApiURL = apiUrl

  static call = async (requestBody, path, method, header, responseType) => {
    const url = path ? `${this.ApiURL}${path}` : this.ApiURL;

    const headers = {
      'Content-Type': 'application/json',
      auth: header ?? localStorage.getItem('userId') ?? '',
    };

    const axiosConfig = {
      headers,
      timeout: 1200000,
    };

    if (responseType) {
      axiosConfig.responseType = responseType;
    }

    try {
      if (method === 'get') {
        return await axios.get(url, axiosConfig);
      }
      if (method === 'delete') {
        return await axios.delete(url, { ...axiosConfig, data: requestBody });
      }
      return await axios[method](url, requestBody, axiosConfig);
    } catch (e) {
      return e.response || e;
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