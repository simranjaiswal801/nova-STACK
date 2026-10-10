// Reuse Phase 1's canonical catalogue. The server derives the allowlist and
// service names from the same records used by the frontend cards and routes.
import { services } from "../../../frontend/src/data.js";

export const serviceBySlug = new Map(services.map((service) => [service.slug, service]));
export const serviceSlugs = [...serviceBySlug.keys()];
