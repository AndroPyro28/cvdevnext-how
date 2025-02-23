import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import qs from "query-string";

const controller = new AbortController();

  // Default to localhost if no environment variable is set



export const apiClient = axios.create({
  baseURL: `${process.env.NEXT_BACKEND_URL}/api`,
  headers: {
    "Content-type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  },
});

// type queryFnProps = {
//   url: string;
//   queryParams?: Record<string, any> | null;
//   headers?: any | {};
// };

export const queryFn = async ({ url, queryParams = {}, headers = {} }) => {
  const newUrl = qs.stringifyUrl({
    url,
    query: {
      ...queryParams,
    },
  });

  const { data } = await apiClient.get(newUrl, {
    headers: {
      ...headers,
    },
    signal: controller.signal,
  });
  return data;
};

// type useQueryProcessorProps = {
//   url: string;
//   queryParams?: Record<string, any>;
//   key: any[];
//   options?: Record<string, any>;
//   headers?: Record<string, any>;
// };

export const useQueryProcessor = ({
  url,
  queryParams = {},
  key = [],
  options = {},
  headers = {},
}) => {
  return useQuery({
    queryKey: key,
    queryFn: () => queryFn({ url, queryParams, headers }),
    ...options,
  });
};

// export type HttpMutationMethod = "DELETE" | "POST" | "PUT" | "PATCH";

// type mutationFnProps = {
//   url: string;
//   queryParams?: Record<string, any> | null;
//   headers?: any | {};
//   method: HttpMutationMethod;
//   value: T;
// };
export const mutationFn = async ({
  url,
  queryParams = {},
  method,
  value,
  headers = {},
}) => {
  const newUrl = qs.stringifyUrl({
    url,
    query: { ...queryParams },
  });

  switch (method) {
    case "DELETE": {
      const { data } = await apiClient.delete(newUrl, {
        headers: {
          ...headers,
        },
        signal: controller.signal,
      });
      return data;
    }

    case "PATCH": {
      const { data } = await apiClient.patch(newUrl, value, {
        headers: {
          ...headers,
        },
        signal: controller.signal,
      });
      return data;
    }
    case "POST": {
      const { data } = await apiClient.post(newUrl, value, {
        headers: {
          ...headers,
        },
        signal: controller.signal,
      });
      return data;
    }
    case "PUT": {
      const { data } = await apiClient.put(newUrl, value, {
        headers: {
          ...headers,
        },
        signal: controller.signal,
      });
      return data;
    }
    default:
      throw new Error("Invalid mutation method");
  }
};

// type useMutationProcessorProps = {
//   url: string;
//   queryParams?: Record<string, any>;
//   method: HttpMutationMethod;
//   key: any[];
//   options?: Record<string, any>;
//   headers?: Record<string, any>;
// };

export const useMutateProcessor = ({
  url,
  queryParams = {},
  method,
  key = [],
  options = {},
  headers = {},
}) => {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: async (value) =>
      mutationFn({ url, queryParams, method, value, headers }),
    onMutate: (data) => {
      const previousData = queryClient.getQueryData(key);
      const isArray = Array.isArray(previousData);
      //checking if the previous data is an array type if yes then update the array data
      if (isArray) {
        queryClient.setQueryData(key, (old) => {
          if (method === "DELETE") {
            // if delete method we assume it's an id to delete
            return old.filter((value) => value?.id != data);
          }
          if (method === "POST") {
            // else its an object of new data
            if (Array.isArray(data)) {
              return [...old, ...data];
            } else {
              return [...old, data];
            }
          }
        });
      }
      return { previousData };
    },
    onError: (err, newTodo, context) => {
      if (axios.isAxiosError(err)) {
        // err.response?.data.message if nestjs backend
        // err.response?.data if nextjs backend
        console.error(err.response?.data);
        // toast.error(err.response?.data)
      } else {
        console.error(err);
      }
      queryClient.setQueryData(key, context?.previousData);
      console.log(context);
      console.log(" 🚀 error mutate processor 🚀");
    },
    onSuccess(data, variables, context) {
      console.log(" 🚀 success mutate processor 🚀");
    },
    onSettled: async (data) => {
      console.log(" 🚀 settled mutate processor 🚀");
      return await queryClient.invalidateQueries({
        queryKey: key,
      });
    },
  });
};
