import { Enquiry } from "../models/Enquiry.js";
import { Service } from "../models/Service.js";
import { HttpError } from "../utils/httpError.js";

export async function createEnquiry(req, res) {
  const values = req.validatedBody;
  const service = await Service.findOne({
    slug: values.serviceSlug,
    published: true,
    archived: false,
  })
    .select("title")
    .lean();
  if (!service)
    throw new HttpError(
      400,
      "INVALID_SERVICE",
      "Choose a currently published NovaStack service.",
      { serviceSlug: "This service is unavailable." },
    );
  const enquiry = await Enquiry.create({
    ...values,
    serviceName: service.title,
    userId: req.user?._id || null,
    status: "new",
  });
  return res
    .status(201)
    .json({
      success: true,
      data: {
        confirmation: {
          serviceName: enquiry.serviceName,
          createdAt: enquiry.createdAt,
        },
        message: "Your project enquiry has been saved.",
      },
    });
}

export async function listMyEnquiries(req, res) {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(req.query.limit, 10) || 20),
  );
  const filter = { userId: req.user._id };
  const [items, total] = await Promise.all([
    Enquiry.find(filter)
      .select("-userId")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Enquiry.countDocuments(filter),
  ]);
  return res.json({
    success: true,
    data: {
      enquiries: items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    },
  });
}
