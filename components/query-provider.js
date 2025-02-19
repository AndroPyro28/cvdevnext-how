import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React from "react";

function QueryProvider({ children }) {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 0,
        retry: 2, // you can true, false, or number
      },
    },
  });

  return (
    <QueryClientProvider client={client}>
      <ReactQueryDevtools />
      {children}
    </QueryClientProvider>
  );
}

export default QueryProvider;