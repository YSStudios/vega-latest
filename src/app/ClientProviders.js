"use client";

import { Provider } from "react-redux";
import { ThemeProvider } from "next-themes";
import store from "../store";

export default function ClientProviders({ children }) {
  return <Provider store={store}>{children}</Provider>;
}
