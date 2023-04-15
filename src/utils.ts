import axios, { AxiosRequestConfig } from 'axios';

export type PostReponse = {
  status: number;
  data: any;
};

export const Utility = {
  getRequest: async function (uri: string, headers?: Map<string, string | number | boolean>): Promise<any> {
    try {
      const config = {
        headers: {},
      } as AxiosRequestConfig;
      if (headers) {
        headers.forEach((v, k) => {
          config.headers[k] = v;
        });
      }
      const res = await axios.get(uri, config);
      return res.status === 200 ? res.data : {};
    } catch (error) {
      throw error;
    }
  },

  deleteRequest: async function (
    uri: string,
    payload: any,
    headers?: Map<string, string | number | boolean>,
  ): Promise<PostReponse> {
    try {
      const config = {
        headers: {},
      } as AxiosRequestConfig;
      if (headers) {
        headers.forEach((v, k) => {
          config.headers[k] = v;
        });
      }
      config.data = payload;
      const res = await axios.delete(uri, config);
      return { status: res.status, data: res.data } as PostReponse;
    } catch (error) {
      throw error;
    }
  },

  postRequest: async function (
    uri: string,
    payload: any,
    headers?: Map<string, string | number | boolean>,
  ): Promise<PostReponse> {
    try {
      const config = {
        headers: {},
      } as AxiosRequestConfig;
      if (headers) {
        headers.forEach((v, k) => {
          config.headers[k] = v;
        });
      }
      const res = await axios.post(uri, payload, config);
      return { status: res.status, data: res.data } as PostReponse;
    } catch (error) {
      throw error;
    }
  },
};
