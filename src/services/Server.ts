import { debugApi } from "@/log";
import { RouterToLogout } from "@/router";
import URL, { ApiBaseUrl } from "@/services/urls";
import useAppStore from "@/store/app";
import { NotificationType } from "@/TickApi";
import axios, { AxiosError, CreateAxiosDefaults } from "axios";

//console.log("env", process.env);
const config: CreateAxiosDefaults = {
  baseURL: ApiBaseUrl(),
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Credentials': 'true'
  }
};

const HTTP = axios.create(config);

const Post = HTTP.post;
const Get = HTTP.get;
const Delete = HTTP.delete;
const Put = HTTP.put;

const noNetworkStatusCode = 0;
const subscriptionErrorStatusCode = 402;
const unAuthorizedStatusCode = 401;

// Request interceptors for API calls
HTTP.interceptors.request.use(
  config => {
    config.headers['token'] = useAppStore().token || "";
    config.headers['Access-Control-Allow-Origin'] = '*';
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
HTTP.interceptors.response.use(function (response) {
  // Any status code that lie within the range of 2xx cause this function to trigger
  // Do something with response data
  return response;
}, function (error: AxiosError) {

  if (!error) {
    return Promise.reject();
  }

  // Any status codes that falls outside the range of 2xx cause this function to trigger
  // Do something with response error
  debugApi(`[API:${error?.response?.status}] ${error.message || ""}`);

  const allowedPath = URL.login;
  const isFromAllowedPath = (error.request.responseURL as string).endsWith(allowedPath);

  if (!isFromAllowedPath && error?.response?.status == unAuthorizedStatusCode) {
    useAppStore().token = null;
    // useAppStore().logout();

    RouterToLogout();

    return Promise.reject(error);
  }


  // no network
  if (error?.response?.status == noNetworkStatusCode) {
    useAppStore().notify(NotificationType.Error, "No connection", "Connection problem");
    return Promise.reject(error);
  }

  // special treatment
  if (error?.response?.status == subscriptionErrorStatusCode) {
    useAppStore().notify(NotificationType.Subscription, "Oops", (error.response.data as { message: string }).message);
  } else {
    useAppStore().notify(NotificationType.Error, "Oops", (error?.response?.data as { message: string }).message || "Something went wrong, sorry..");
  }


  return Promise.reject(error);
});

// export function watchToken() {
//   // console.log("watch token" + useAppStore().token);
//   // if (useAppStore().token) {
//   //   console.log("Token set");
//   //   HTTP.defaults.headers.common['Token'] = useAppStore().token ?? '';

//   // }

//   // useAppStore().$subscribe((mutation, { token }) => {
//   //   console.log("Token updated" + useAppStore().token);
//   //   HTTP.defaults.headers.common['Token'] = token ?? '';
//   // });

// }

export { Delete, Get, Post, Put };

