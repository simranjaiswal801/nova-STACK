import { ContactMessage } from "../models/ContactMessage.js";
import { Service } from "../models/Service.js";
import { HttpError } from "../utils/httpError.js";

export async function createContactMessage(req, res) {
  const values = req.validatedBody;
  if (values.serviceSlug) {
    const available = await Service.exists({
      slug: values.serviceSlug,
      published: true,
      archived: false,
    });
    if (!available)
      throw new HttpError(
        400,
        "INVALID_SERVICE",
        "Choose a currently published NovaStack service.",
        { serviceSlug: "This service is unavailable." },
      );
  }
  await ContactMessage.create({
    ...values,
    serviceSlug: values.serviceSlug || undefined,
  });
  return res
    .status(201)
    .json({
      success: true,
      data: { message: "Your contact message has been saved." },
    });
}
