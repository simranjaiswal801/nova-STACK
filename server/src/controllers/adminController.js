import { Enquiry } from "../models/Enquiry.js";
import { ContactMessage } from "../models/ContactMessage.js";
import { Service } from "../models/Service.js";
import { User } from "../models/User.js";
import { serviceSlugs } from "../config/services.js";
import { HttpError } from "../utils/httpError.js";

const statuses = ["new", "contacted", "in_progress", "completed", "rejected"];
const pageArgs = (query) => ({
  page: Math.max(1, Math.min(100000, Number.parseInt(query.page, 10) || 1)),
  limit: Math.max(1, Math.min(100, Number.parseInt(query.limit, 10) || 20)),
});
function textSearch(value) {
  return String(value || "")
    .trim()
    .slice(0, 100)
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function dateFilter(query, field = "createdAt") {
  const filter = {};
  if (query.from || query.to) {
    filter[field] = {};
    if (query.from && !Number.isNaN(Date.parse(query.from)))
      filter[field].$gte = new Date(query.from);
    if (query.to && !Number.isNaN(Date.parse(query.to))) {
      const date = new Date(query.to);
      date.setHours(23, 59, 59, 999);
      filter[field].$lte = date;
    }
  }
  return filter;
}
function sortOrder(value) {
  return value === "oldest" ? { createdAt: 1 } : { createdAt: -1 };
}

export async function dashboard(_req, res) {
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - 29);
  const [
    enquiryTotal,
    enquiryStatuses,
    users,
    services,
    messages,
    daily,
    requested,
    recentEnquiries,
    recentMessages,
  ] = await Promise.all([
    Enquiry.countDocuments(),
    Enquiry.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    User.countDocuments(),
    Service.countDocuments({ published: true, archived: false }),
    ContactMessage.countDocuments(),
    Enquiry.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Enquiry.aggregate([
      {
        $group: {
          _id: { slug: "$serviceSlug", name: "$serviceName" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]),
    Enquiry.find()
      .select("fullName email serviceName serviceSlug status createdAt")
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),
    ContactMessage.find()
      .select("name email subject read createdAt")
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),
  ]);
  const counts = Object.fromEntries(
    enquiryStatuses.map(({ _id, count }) => [_id, count]),
  );
  const chartDays = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(since);
    d.setUTCDate(d.getUTCDate() + i);
    const key = d.toISOString().slice(0, 10);
    return { date: key, count: daily.find((x) => x._id === key)?.count || 0 };
  });
  res.json({
    success: true,
    data: {
      totals: {
        enquiries: enquiryTotal,
        newEnquiries: counts.new || 0,
        contacted: counts.contacted || 0,
        inProgress: counts.in_progress || 0,
        completed: counts.completed || 0,
        users,
        services,
        messages,
      },
      statuses: statuses.map((status) => ({
        status,
        count: counts[status] || 0,
      })),
      daily: chartDays,
      requestedServices: requested.map((x) => ({
        serviceSlug: x._id.slug,
        serviceName: x._id.name,
        count: x.count,
      })),
      recentEnquiries,
      recentMessages,
    },
  });
}

export async function listEnquiries(req, res) {
  const { page, limit } = pageArgs(req.query);
  const filter = { ...dateFilter(req.query) };
  if (req.query.status && statuses.includes(req.query.status))
    filter.status = req.query.status;
  if (req.query.serviceSlug)
    filter.serviceSlug = String(req.query.serviceSlug).slice(0, 80);
  const q = textSearch(req.query.q);
  if (q)
    filter.$or = [
      { fullName: new RegExp(q, "i") },
      { email: new RegExp(q, "i") },
    ];
  const [items, total] = await Promise.all([
    Enquiry.find(filter)
      .select("-userId -internalNotes -activity")
      .sort(sortOrder(req.query.sort))
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Enquiry.countDocuments(filter),
  ]);
  res.json({
    success: true,
    data: {
      enquiries: items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    },
  });
}
export async function getEnquiry(req, res) {
  const item = await Enquiry.findById(req.params.id).select("-userId").lean();
  if (!item)
    throw new HttpError(404, "NOT_FOUND", "The enquiry was not found.");
  res.json({ success: true, data: { enquiry: item } });
}
export async function updateEnquiry(req, res) {
  const item = await Enquiry.findById(req.params.id);
  if (!item)
    throw new HttpError(404, "NOT_FOUND", "The enquiry was not found.");
  const { status, internalNotes, note } = req.validatedBody;
  if (status && status !== item.status)
    item.activity.push({
      action: "status_changed",
      from: item.status,
      to: status,
      note: note || "",
      actorId: req.user._id,
    });
  if (internalNotes !== undefined && internalNotes !== item.internalNotes)
    item.activity.push({
      action: "internal_notes_updated",
      note: note || "",
      actorId: req.user._id,
    });
  if (status) item.status = status;
  if (internalNotes !== undefined) item.internalNotes = internalNotes;
  await item.save();
  res.json({ success: true, data: { enquiry: item } });
}
export async function deleteEnquiry(req, res) {
  const item = await Enquiry.findByIdAndDelete(req.params.id);
  if (!item)
    throw new HttpError(404, "NOT_FOUND", "The enquiry was not found.");
  res.json({ success: true, data: { deleted: true } });
}

export async function listServices(req, res) {
  const { page, limit } = pageArgs(req.query);
  const filter = { archived: false };
  if (req.query.published === "true") filter.published = true;
  if (req.query.published === "false") filter.published = false;
  const q = textSearch(req.query.q);
  if (q)
    filter.$or = [{ title: new RegExp(q, "i") }, { slug: new RegExp(q, "i") }];
  const [items, total] = await Promise.all([
    Service.find(filter)
      .sort({ displayOrder: 1, title: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Service.countDocuments(filter),
  ]);
  res.json({
    success: true,
    data: {
      services: items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    },
  });
}
const allowedServiceFields = [
  "slug",
  "title",
  "icon",
  "group",
  "text",
  "description",
  "overview",
  "deliverables",
  "tags",
  "benefits",
  "process",
  "faqs",
  "enquiryService",
  "displayOrder",
  "published",
];
export async function createService(req, res) {
  const data = Object.fromEntries(
    Object.entries(req.validatedBody).filter(([k]) =>
      allowedServiceFields.includes(k),
    ),
  );
  const service = await Service.create(data);
  res.status(201).json({ success: true, data: { service } });
}
export async function updateService(req, res) {
  const current = await Service.findById(req.params.id);
  if (!current)
    throw new HttpError(404, "NOT_FOUND", "The service was not found.");
  if (
    req.validatedBody.slug &&
    req.validatedBody.slug !== current.slug &&
    serviceSlugs.includes(current.slug)
  )
    throw new HttpError(
      400,
      "CANONICAL_SLUG_LOCKED",
      "The original 12 service slugs are stable and cannot be changed.",
      { slug: "This primary service URL is fixed." },
    );
  for (const key of allowedServiceFields)
    if (Object.hasOwn(req.validatedBody, key))
      current[key] = req.validatedBody[key];
  await current.save();
  res.json({ success: true, data: { service: current } });
}
export async function deleteService(req, res) {
  const service = await Service.findById(req.params.id);
  if (!service)
    throw new HttpError(404, "NOT_FOUND", "The service was not found.");
  if (await Enquiry.exists({ serviceSlug: service.slug })) {
    service.published = false;
    service.archived = true;
    await service.save();
    return res.json({
      success: true,
      data: { deleted: false, archived: true },
    });
  }
  await service.deleteOne();
  res.json({ success: true, data: { deleted: true } });
}
export async function publicServices(_req, res) {
  const services = await Service.find({ published: true, archived: false })
    .sort({ displayOrder: 1, title: 1 })
    .lean();
  res.json({ success: true, data: { services } });
}
export async function publicService(req, res) {
  const service = await Service.findOne({
    slug: req.params.slug,
    published: true,
    archived: false,
  }).lean();
  if (!service)
    throw new HttpError(404, "NOT_FOUND", "The service was not found.");
  res.json({ success: true, data: { service } });
}

export async function listUsers(req, res) {
  const { page, limit } = pageArgs(req.query);
  const filter = {};
  if (req.query.active === "true") filter.active = true;
  if (req.query.active === "false") filter.active = false;
  const q = textSearch(req.query.q);
  if (q)
    filter.$or = [{ name: new RegExp(q, "i") }, { email: new RegExp(q, "i") }];
  const [users, total] = await Promise.all([
    User.find(filter)
      .select("name email role active createdAt updatedAt")
      .sort(sortOrder(req.query.sort))
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);
  const ids = users.map((u) => u._id);
  const counts = await Enquiry.aggregate([
    { $match: { userId: { $in: ids } } },
    { $group: { _id: "$userId", count: { $sum: 1 } } },
  ]);
  const byId = new Map(counts.map((x) => [String(x._id), x.count]));
  res.json({
    success: true,
    data: {
      users: users.map((u) => ({
        ...u,
        enquiryCount: byId.get(String(u._id)) || 0,
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    },
  });
}
export async function getUser(req, res) {
  const user = await User.findById(req.params.id)
    .select("name email role active createdAt updatedAt")
    .lean();
  if (!user) throw new HttpError(404, "NOT_FOUND", "The user was not found.");
  const enquiries = await Enquiry.find({ userId: user._id })
    .select("serviceSlug serviceName status createdAt")
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();
  res.json({ success: true, data: { user, enquiries } });
}
export async function setUserStatus(req, res) {
  const user = await User.findById(req.params.id).select(
    "name email role active",
  );
  if (!user) throw new HttpError(404, "NOT_FOUND", "The user was not found.");
  if (String(user._id) === String(req.user._id))
    throw new HttpError(
      400,
      "SELF_STATUS_CHANGE",
      "You cannot deactivate your own account here.",
    );
  if (user.role === "admin" && req.validatedBody.active === false) {
    const admins = await User.countDocuments({ role: "admin", active: true });
    if (admins <= 1)
      throw new HttpError(
        400,
        "LAST_ADMIN",
        "The last active admin cannot be deactivated.",
      );
  }
  user.active = req.validatedBody.active;
  await user.save();
  if (!user.active)
    await User.updateOne({ _id: user._id }, { $inc: { sessionVersion: 1 } });
  res.json({
    success: true,
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        active: user.active,
      },
    },
  });
}

export async function listMessages(req, res) {
  const { page, limit } = pageArgs(req.query);
  const filter = { ...dateFilter(req.query) };
  if (req.query.read === "true") filter.read = true;
  if (req.query.read === "false")
    filter.$or = [{ read: false }, { read: { $exists: false } }];
  const q = textSearch(req.query.q);
  if (q)
    filter.$and = [
      {
        $or: [
          { name: new RegExp(q, "i") },
          { email: new RegExp(q, "i") },
          { subject: new RegExp(q, "i") },
        ],
      },
    ];
  const [messages, total] = await Promise.all([
    ContactMessage.find(filter)
      .sort(sortOrder(req.query.sort))
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    ContactMessage.countDocuments(filter),
  ]);
  res.json({
    success: true,
    data: {
      messages,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    },
  });
}
export async function updateMessageRead(req, res) {
  const message = await ContactMessage.findByIdAndUpdate(
    req.params.id,
    { $set: { read: req.validatedBody.read } },
    { new: true, runValidators: true },
  );
  if (!message)
    throw new HttpError(404, "NOT_FOUND", "The message was not found.");
  res.json({ success: true, data: { message } });
}
export async function deleteMessage(req, res) {
  const message = await ContactMessage.findByIdAndDelete(req.params.id);
  if (!message)
    throw new HttpError(404, "NOT_FOUND", "The message was not found.");
  res.json({ success: true, data: { deleted: true } });
}
