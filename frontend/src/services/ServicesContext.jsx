import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { services as fallbackServices } from "../data.js";

const ServicesContext = createContext(fallbackServices);
export function ServicesProvider({ children }) {
  const [services, setServices] = useState(fallbackServices);
  useEffect(() => { let active = true; api.services().then(({ services: rows }) => { if (active) setServices(rows.map((item) => ({ ...item, n: String(item.displayOrder || 0).padStart(2, "0") }))); }).catch(() => {}); return () => { active = false; }; }, []);
  return <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>;
}
export function useServices() { return useContext(ServicesContext); }
