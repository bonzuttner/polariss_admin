// Api.call() swallows request errors internally: on a normal API error it
// returns the axios response (response.data.message is set by the server),
// but on a total network failure (no response at all) it returns the raw
// error object instead, which has no `.data`. This normalizes both cases.
export function getApiErrorMessage(response, fallback = 'エラーが発生しました。もう一度お試しください。') {
  if (response?.data && typeof response.data === 'object') {
    return response.data.message || fallback;
  }
  return fallback;
}

export function isApiSuccess(response) {
  return Boolean(response?.data?.code === 200);
}
