"use client";
import React from "react";
import { SessionProvider } from "next-auth/react";
import QueryProvider from "@/components/query-provider";

const Provider = ({ children }) => {
  return (
    <>
      <SessionProvider>
        <QueryProvider>{children}</QueryProvider>
      </SessionProvider>
    </>
  );
};

export default Provider;
