import axios from 'axios'
import * as https from 'https'

const apiUrl = process.env.API_URL

export default class AxiosApi {
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
          httpsAgent: httpsAgent,
        }
        // , {crossDomain: true}
      )
      return getResponseData(response)
    } catch (e) {
      if (e.response) {
        return getResponseData(e.response)
      } else return e
    }
  }
}
