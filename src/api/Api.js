import axios from 'axios'

const apiUrl = "https://polarissfintech-cegee7efcuenffhq.japaneast-01.azurewebsites.net/v2/"
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
    if (responseType) {
      headers['responseType'] = responseType;
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
}
