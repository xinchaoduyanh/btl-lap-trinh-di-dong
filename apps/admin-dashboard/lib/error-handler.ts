export function getApiErrorMessage(error: any): string {
  // Axios error
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  // Fetch error (nếu dùng fetch)
  if (error?.message) {
    return error.message;
  }
  // Fallback
  return "Đã có lỗi xảy ra, vui lòng thử lại!";
}
