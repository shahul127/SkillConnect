import { Wrench, Activity, Hammer } from "lucide-react";
import { SERVICE_TA } from "../data/serviceTranslations.js";

export function serviceText(service, language, field = "name") {
  if (language !== "ta" || !service) return service?.[field] || "";
  const values = SERVICE_TA[service.service_id];
  if (!values) return service?.[field] || "";
  return field === "name" ? values[0] : field === "description" ? values[1] : field === "problem_options" ? values[2] : service?.[field] || "";
}

export const categoryIcon = { plumber: Wrench, electrician: Activity, "ac-mechanic": Activity, carpenter: Hammer };


export function categoryLabel(categoryId, t = {}) {
  const labels = {
    plumber: t.plumber || "Plumber",
    electrician: t.electrician || "Electrician",
    "ac-mechanic": t.ac || "AC mechanic",
    carpenter: t.carpenter || "Carpenter"
  };
  return labels[categoryId] || categoryId || "Service";
}
