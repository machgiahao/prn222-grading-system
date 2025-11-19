import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL + "/api/v1",
  withCredentials: false,
});

let isRefreshing = false;
let failedQueue: {
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
}[] = [];

const processQueue = (error: any, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;
    console.log("Attaching token to request:", token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Bearer " + token );
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu không phải lỗi 401 -> trả về luôn
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Nếu request đã retry thì không lặp vô hạn
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // Bắt đầu refresh token
    if (!isRefreshing) {
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          process.env.NEXT_PUBLIC_SERVER_URL + "/api/v1/auth/refresh",
          {},
          { withCredentials: true } // refreshToken trong cookie
        );

        const newAccessToken = data.accessToken;  // <=== SỬA ĐÚNG CHỖ NÀY

        // Lưu token mới
        localStorage.setItem("accessToken", newAccessToken);

        // Gắn vào axios default
        api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

        // Xử lý các request đang chờ
        processQueue(null, newAccessToken);

        // Retry request ban đầu
        return api(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Nếu đang refresh → xếp hàng đợi
    return new Promise((resolve, reject) => {
      failedQueue.push({
        resolve,
        reject,
      });
    })
      .then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      })
      .catch((err) => Promise.reject(err));
  }
);


export default api;