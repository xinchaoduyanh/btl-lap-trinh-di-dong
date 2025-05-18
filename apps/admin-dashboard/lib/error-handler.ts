export function getApiErrorMessage(error: any): string {
  // Axios error
  if (error?.response?.data) {
    if (error.response.data.error && error.response.data.message) {
      return `${error.response.data.error}: ${error.response.data.message}`
    }
    if (error.response.data.message) {
      return error.response.data.message
    }
  }
  // Fetch error
  if (error?.message) {
    return error.message
  }
  // Fallback
  return 'Đã có lỗi xảy ra, vui lòng thử lại!'
}
