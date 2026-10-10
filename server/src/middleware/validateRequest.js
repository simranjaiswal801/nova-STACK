import { HttpError } from "../utils/httpError.js";

export function validateBody(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const fieldErrors = Object.fromEntries(
        result.error.issues.map(({ path, message }) => [
          path.join("."),
          message,
        ]),
      );
      return next(
        new HttpError(
          400,
          "VALIDATION_ERROR",
          "Please correct the highlighted fields.",
          fieldErrors,
        ),
      );
    }
    req.validatedBody = result.data;
    next();
  };
}

export function validateAdminQuery(kind) {
  return (req, _res, next) => {
    const query = req.query;
    const invalid = () =>
      next(
        new HttpError(400, "INVALID_QUERY", "One or more filters are invalid."),
      );
    const allowed =
      {
        enquiries: [
          "page",
          "limit",
          "q",
          "sort",
          "status",
          "serviceSlug",
          "from",
          "to",
        ],
        services: ["page", "limit", "q", "published"],
        users: ["page", "limit", "q", "sort", "active"],
        messages: ["page", "limit", "q", "sort", "read", "from", "to"],
      }[kind] || [];
    for (const key of Object.keys(query))
      if (!allowed.includes(key)) return invalid();
    for (const [key, value] of Object.entries(query))
      if (typeof value !== "string") return invalid();
    if (
      query.page !== undefined &&
      (!/^\d+$/.test(query.page) ||
        Number(query.page) < 1 ||
        Number(query.page) > 100000)
    )
      return invalid();
    if (
      query.limit !== undefined &&
      (!/^\d+$/.test(query.limit) ||
        Number(query.limit) < 1 ||
        Number(query.limit) > 100)
    )
      return invalid();
    if (query.q !== undefined && query.q.length > 100) return invalid();
    if (query.sort !== undefined && !["newest", "oldest"].includes(query.sort))
      return invalid();
    if (kind === "enquiries") {
      if (
        query.status &&
        !["new", "contacted", "in_progress", "completed", "rejected"].includes(
          query.status,
        )
      )
        return invalid();
      if (
        query.serviceSlug &&
        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(query.serviceSlug)
      )
        return invalid();
      if (query.from && Number.isNaN(Date.parse(query.from))) return invalid();
      if (query.to && Number.isNaN(Date.parse(query.to))) return invalid();
      if (
        query.from &&
        query.to &&
        Date.parse(query.from) > Date.parse(query.to)
      )
        return invalid();
    }
    if (
      kind === "services" &&
      query.published !== undefined &&
      !["true", "false"].includes(query.published)
    )
      return invalid();
    if (
      kind === "users" &&
      query.active !== undefined &&
      !["true", "false"].includes(query.active)
    )
      return invalid();
    if (
      kind === "messages" &&
      query.read !== undefined &&
      !["true", "false"].includes(query.read)
    )
      return invalid();
    next();
  };
}
