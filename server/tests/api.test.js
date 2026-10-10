import {
  beforeAll,
  afterAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import request from "supertest";

process.env.NODE_ENV = "test";
process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/novastack_phase2_test";
process.env.JWT_SECRET = "test-secret-that-is-long-enough-for-hs256-tests";
process.env.FRONTEND_URL = "http://localhost:5173";
process.env.ADMIN_SETUP_KEY =
  "test-only-admin-setup-key-that-is-over-32-characters";

const [
  { createApp },
  { connectDatabase, disconnectDatabase },
  { User },
  { Enquiry },
  { ContactMessage },
  { Service },
  { services },
  { requireRole },
] = await Promise.all([
  import("../src/app.js"),
  import("../src/config/database.js"),
  import("../src/models/User.js"),
  import("../src/models/Enquiry.js"),
  import("../src/models/ContactMessage.js"),
  import("../src/models/Service.js"),
  import("../../frontend/src/data.js"),
  import("../src/middleware/authenticate.js"),
]);
const { authLimiter, registrationLimiter, publicFormLimiter, adminLimiter } =
  await import("../src/middleware/rateLimiter.js");
const app = createApp();
const origin = { Origin: process.env.FRONTEND_URL };
const validPassword = "NovaStack-Test-Password-42";

beforeAll(async () => {
  await connectDatabase();
  await Promise.all([
    User.init(),
    Enquiry.init(),
    ContactMessage.init(),
    Service.init(),
  ]);
});
beforeEach(async () => {
  for (const limiter of [
    authLimiter,
    registrationLimiter,
    publicFormLimiter,
    adminLimiter,
  ])
    for (const key of ["::ffff:127.0.0.1", "127.0.0.1"])
      await limiter.resetKey(key);
  await Promise.all([
    User.deleteMany({}),
    Enquiry.deleteMany({}),
    ContactMessage.deleteMany({}),
    Service.deleteMany({}),
  ]);
  await (await import("mongoose")).default.connection
    .collection("admin_setup")
    .deleteMany({});
  await Service.insertMany(
    services.map((service) => ({
      ...service,
      displayOrder: Number(service.n),
      published: true,
    })),
  );
});
afterAll(async () => {
  const mongoose = await import("mongoose");
  await mongoose.default.connection.dropDatabase();
  await disconnectDatabase();
});

describe("NovaStack API integration", () => {
  async function adminAgent(
    name = "Dashboard Admin",
    email = "admin@example.com",
  ) {
    await new User({
      name,
      email,
      passwordHash: validPassword,
      role: "admin",
    }).save();
    const agent = request.agent(app);
    await agent
      .post("/api/auth/login")
      .set(origin)
      .send({ email, password: validPassword })
      .expect(200);
    return agent;
  }
  it("reports database readiness and applies security/CORS headers", async () => {
    const response = await request(app)
      .get("/api/health")
      .set(origin)
      .expect(200);
    expect(response.body.data).toEqual({
      status: "ready",
      database: "connected",
    });
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["access-control-allow-origin"]).toBe(
      process.env.FRONTEND_URL,
    );
    const adminPreflight = await request(app)
      .options("/api/admin/messages/example/read-status")
      .set(origin)
      .set("Access-Control-Request-Method", "PATCH")
      .set("Access-Control-Request-Headers", "content-type")
      .expect(204);
    expect(adminPreflight.headers["access-control-allow-methods"]).toContain("PATCH");
    expect(adminPreflight.headers["access-control-allow-methods"]).toContain("DELETE");
    await request(app)
      .get("/api/health")
      .set("Origin", "https://not-trusted.example")
      .expect(403);
  });

  it("returns 403 when an authenticated user lacks a required role", async () => {
    const error = await new Promise((resolve) =>
      requireRole("admin")({ user: { role: "user" } }, {}, resolve),
    );
    expect(error.status).toBe(403);
    expect(error.code).toBe("FORBIDDEN");
  });

  it("fails closed for admin APIs and rejects normal-user access", async () => {
    await request(app).get("/api/admin/dashboard").expect(401);
    const user = request.agent(app);
    await user
      .post("/api/auth/register")
      .set(origin)
      .send({
        name: "Regular User",
        email: "ordinary@example.com",
        password: validPassword,
      })
      .expect(201);
    await user.get("/api/admin/dashboard").expect(403);
    await user.post("/api/admin/services").set(origin).send({}).expect(403);
  });

  it("serves real dashboard totals, recent records, enquiry filters and audited status updates", async () => {
    const admin = await adminAgent();
    const user = await User.create({
      name: "Project User",
      email: "project@example.com",
      passwordHash: validPassword,
    });
    await Enquiry.create({
      fullName: "Jordan Client",
      email: "jordan@example.com",
      serviceSlug: services[0].slug,
      serviceName: services[0].title,
      projectDescription:
        "A real database-backed admin enquiry for analytics testing.",
      userId: user._id,
    });
    await ContactMessage.create({
      name: "Jordan Client",
      email: "jordan@example.com",
      subject: "Real contact",
      message: "A real persisted message used for the admin dashboard test.",
    });
    const result = await admin.get("/api/admin/dashboard").expect(200);
    expect(result.body.data.totals).toMatchObject({
      enquiries: 1,
      newEnquiries: 1,
      users: 2,
      messages: 1,
    });
    expect(result.body.data.recentEnquiries[0].fullName).toBe("Jordan Client");
    expect(
      result.body.data.daily.reduce((sum, item) => sum + item.count, 0),
    ).toBe(1);
    const row = await admin
      .get("/api/admin/enquiries?q=Jordan&status=new&page=1&limit=10")
      .expect(200);
    expect(row.body.data.enquiries).toHaveLength(1);
    const id = row.body.data.enquiries[0]._id;
    await admin
      .patch(`/api/admin/enquiries/${id}`)
      .set(origin)
      .send({ status: "in_progress", note: "Scope review started." })
      .expect(200);
    expect((await Enquiry.findById(id)).activity[0].to).toBe("in_progress");
    await admin.get(`/api/admin/enquiries/not-an-object-id`).expect(400);
    await admin
      .patch(`/api/admin/enquiries/${id}`)
      .set(origin)
      .send({ status: "surprise" })
      .expect(400);
  });

  it("supports protected service CRUD, public published catalogue, and preserves enquiries on delete", async () => {
    const admin = await adminAgent();
    const publicList = await request(app).get("/api/services").expect(200);
    expect(publicList.body.data.services).toHaveLength(12);
    expect(
      (await request(app).get(`/api/services/${services[0].slug}`)).body.data
        .service.title,
    ).toBe(services[0].title);
    const savedEnquiry = await Enquiry.create({
      fullName: "Client",
      email: "client@example.com",
      serviceSlug: services[0].slug,
      serviceName: services[0].title,
      projectDescription: "Keep this enquiry when the service is archived.",
    });
    const target = await Service.findOne({ slug: services[0].slug });
    await admin
      .patch(`/api/admin/services/${target._id}`)
      .set(origin)
      .send({ published: false })
      .expect(200);
    await request(app).get(`/api/services/${services[0].slug}`).expect(404);
    await admin
      .delete(`/api/admin/services/${target._id}`)
      .set(origin)
      .send({})
      .expect(200);
    expect((await Enquiry.findById(savedEnquiry._id)).serviceName).toBe(
      services[0].title,
    );
    expect(
      await Service.exists({ _id: target._id, archived: true }),
    ).toBeTruthy();
  });

  it("creates, validates, publishes and removes a new service through admin CRUD", async () => {
    const admin = await adminAgent();
    const created = await admin
      .post("/api/admin/services")
      .set(origin)
      .send({
        slug: "admin-created-service",
        title: "Admin Created Service",
        icon: "layers",
        group: "Engineering & Infrastructure",
        text: "A concise service summary with enough detail.",
        description: "A complete description for the managed service page.",
        overview: "An overview explaining the use and goals of this service.",
        deliverables: ["Plan", "Build"],
        tags: ["React"],
        benefits: ["Clearer workflows"],
        process: ["Discover", "Deliver"],
        faqs: [["What is included?", "The agreed delivery scope."]],
        enquiryService: "Admin Created Service",
        displayOrder: 99,
        published: true,
      })
      .expect(201);
    const id = created.body.data.service._id;
    expect(
      (await request(app).get("/api/services/admin-created-service")).body.data
        .service.title,
    ).toBe("Admin Created Service");
    await admin
      .post("/api/admin/services")
      .set(origin)
      .send({ ...created.body.data.service, _id: undefined })
      .expect(409);
    await admin
      .patch(`/api/admin/services/${id}`)
      .set(origin)
      .send({ published: false })
      .expect(200);
    await request(app).get("/api/services/admin-created-service").expect(404);
    await admin
      .delete(`/api/admin/services/${id}`)
      .set(origin)
      .send({})
      .expect(200);
    expect(await Service.exists({ _id: id })).toBeFalsy();
    await admin
      .post("/api/admin/services")
      .set(origin)
      .send({ slug: "bad slug", title: "Bad" })
      .expect(400);
  });

  it("keeps user list safe, prevents self-disable, and persists contact read status", async () => {
    const admin = await adminAgent();
    const list = await admin.get("/api/admin/users").expect(200);
    expect(list.body.data.users[0].passwordHash).toBeUndefined();
    const adminId = list.body.data.users[0]._id;
    await admin
      .patch(`/api/admin/users/${adminId}/status`)
      .set(origin)
      .send({ active: false })
      .expect(400);
    const msg = await ContactMessage.create({
      name: "Message Author",
      email: "message@example.com",
      subject: "Admin review",
      message: "A persisted contact message for read status testing.",
    });
    await admin
      .patch(`/api/admin/messages/${msg._id}/read-status`)
      .set(origin)
      .send({ read: true })
      .expect(200);
    expect((await ContactMessage.findById(msg._id)).read).toBe(true);
    await admin
      .delete(`/api/admin/messages/${msg._id}`)
      .set(origin)
      .send({})
      .expect(200);
  });

  it("revokes a deactivated user's existing cookie session", async () => {
    const account = request.agent(app);
    const registered = await account
      .post("/api/auth/register")
      .set(origin)
      .send({
        name: "Deactivate Me",
        email: "deactivate@example.com",
        password: validPassword,
      })
      .expect(201);
    const admin = await adminAgent();
    await admin
      .patch(`/api/admin/users/${registered.body.data.user._id}/status`)
      .set(origin)
      .send({ active: false })
      .expect(200);
    await account.get("/api/auth/me").expect(401);
    await request(app)
      .post("/api/auth/login")
      .set(origin)
      .send({ email: "deactivate@example.com", password: validPassword })
      .expect(401);
  });

  it("changes the admin password only after verifying the current password and revokes that session", async () => {
    const admin = await adminAgent();
    const changed = "NovaStack-New-Password-73";
    await admin
      .post("/api/auth/password")
      .set(origin)
      .send({ currentPassword: "wrong-password", newPassword: changed })
      .expect(400);
    await admin
      .post("/api/auth/password")
      .set(origin)
      .send({ currentPassword: validPassword, newPassword: changed })
      .expect(200);
    await admin.get("/api/auth/me").expect(401);
    await request(app)
      .post("/api/auth/login")
      .set(origin)
      .send({ email: "admin@example.com", password: validPassword })
      .expect(401);
    await request(app)
      .post("/api/auth/login")
      .set(origin)
      .send({ email: "admin@example.com", password: changed })
      .expect(200);
  });

  it("registers users safely, rejects invalid/duplicate/admin registration, and hashes passwords", async () => {
    const agent = request.agent(app);
    const valid = await agent
      .post("/api/auth/register")
      .set(origin)
      .send({
        name: "Asha Rao",
        email: "ASHA@example.com",
        password: validPassword,
      })
      .expect(201);
    expect(valid.body.data.user).toMatchObject({
      name: "Asha Rao",
      email: "asha@example.com",
      role: "user",
    });
    expect(valid.body.data.user.passwordHash).toBeUndefined();
    expect(valid.headers["set-cookie"][0]).toContain("HttpOnly");
    const saved = await User.findOne({ email: "asha@example.com" }).select(
      "+passwordHash",
    );
    expect(saved.passwordHash).not.toBe(validPassword);
    expect(await saved.verifyPassword(validPassword)).toBe(true);
    await agent
      .post("/api/auth/register")
      .set(origin)
      .send({
        name: "Asha Rao",
        email: "asha@example.com",
        password: validPassword,
      })
      .expect(409);
    await request(app)
      .post("/api/auth/register")
      .set(origin)
      .send({ name: "Asha Rao", email: "invalid", password: validPassword })
      .expect(400);
    await request(app)
      .post("/api/auth/register")
      .set(origin)
      .send({ name: "Asha Rao", email: "weak@example.com", password: "weak" })
      .expect(400);
    await request(app)
      .post("/api/auth/register")
      .set(origin)
      .send({
        name: "Asha Rao",
        email: "long-bytes@example.com",
        password: `Aa1${"😀".repeat(18)}`,
      })
      .expect(400);
    await request(app)
      .post("/api/auth/register")
      .set(origin)
      .send({
        name: "Role Test",
        email: "role@example.com",
        password: validPassword,
        role: "admin",
      })
      .expect(400);
  });

  it("allows one setup-key-protected initial admin registration, then closes it", async () => {
    const agent = request.agent(app);
    await agent
      .post("/api/auth/admin/register")
      .set(origin)
      .send({
        name: "First Admin",
        email: "first-admin@example.com",
        password: validPassword,
        setupKey: "wrong",
      })
      .expect(403);
    const created = await agent
      .post("/api/auth/admin/register")
      .set(origin)
      .send({
        name: "First Admin",
        email: "FIRST-ADMIN@example.com",
        password: validPassword,
        setupKey: process.env.ADMIN_SETUP_KEY,
      })
      .expect(201);
    expect(created.body.data.user).toMatchObject({
      email: "first-admin@example.com",
      role: "admin",
    });
    expect(created.body.data.user.passwordHash).toBeUndefined();
    await agent.get("/api/auth/me").expect(200);
    await request(app)
      .post("/api/auth/admin/register")
      .set(origin)
      .send({
        name: "Second Admin",
        email: "second-admin@example.com",
        password: validPassword,
        setupKey: process.env.ADMIN_SETUP_KEY,
      })
      .expect(403);
  });

  it("logs in, restores the current user, clears logout cookies, and protects private routes", async () => {
    const agent = request.agent(app);
    await request(app).get("/api/enquiries/mine").expect(401);
    const registration = await agent
      .post("/api/auth/register")
      .set(origin)
      .send({
        name: "Logged User",
        email: "login@example.com",
        password: validPassword,
      })
      .expect(201);
    const oldSession = registration.headers["set-cookie"][0].split(";")[0];
    const current = await agent.get("/api/auth/me").expect(200);
    expect(current.body.data.user.email).toBe("login@example.com");
    await agent.post("/api/auth/logout").set(origin).send({}).expect(200);
    await agent.get("/api/auth/me").expect(401);
    await request(app)
      .get("/api/auth/me")
      .set("Cookie", oldSession)
      .expect(401);
    await request(app)
      .post("/api/auth/login")
      .set(origin)
      .send({ email: "login@example.com", password: "Wrong-Password-42" })
      .expect(401);
    await agent
      .post("/api/auth/login")
      .set(origin)
      .send({ email: "login@example.com", password: validPassword })
      .expect(200);
    await agent.get("/api/auth/me").expect(200);
  });

  it("persists enquiries for all 12 services and validates slugs and required data", async () => {
    for (const service of services) {
      const response = await request(app)
        .post("/api/enquiries")
        .set(origin)
        .send({
          fullName: "Guest Customer",
          email: "GUEST@example.com",
          serviceSlug: service.slug,
          projectDescription: `Please help us plan ${service.title} for our organization.`,
          budgetRange: "Flexible",
          preferredTimeline: "This quarter",
        })
        .expect(201);
      expect(response.body.data.confirmation.serviceName).toBe(service.title);
    }
    await request(app)
      .post("/api/enquiries")
      .set(origin)
      .send({
        fullName: "Guest Customer",
        email: "guest@example.com",
        serviceSlug: "fake-service",
        projectDescription: "This should be rejected by validation.",
      })
      .expect(400);
    await request(app)
      .post("/api/enquiries")
      .set(origin)
      .send({
        fullName: "Guest Customer",
        email: "guest@example.com",
        serviceSlug: services[0].slug,
      })
      .expect(400);
    expect(await Enquiry.countDocuments()).toBe(12);
    expect(await Enquiry.countDocuments({ status: "new" })).toBe(12);
    expect(
      (await Enquiry.findOne({ serviceSlug: services[0].slug })).email,
    ).toBe("guest@example.com");
  });

  it("associates signed-in enquiries with verified accounts and isolates enquiry history", async () => {
    const one = request.agent(app);
    const two = request.agent(app);
    await one
      .post("/api/auth/register")
      .set(origin)
      .send({
        name: "First Person",
        email: "first@example.com",
        password: validPassword,
      })
      .expect(201);
    await two
      .post("/api/auth/register")
      .set(origin)
      .send({
        name: "Second Person",
        email: "second@example.com",
        password: validPassword,
      })
      .expect(201);
    const submit = (agent, name) =>
      agent
        .post("/api/enquiries")
        .set(origin)
        .send({
          fullName: name,
          email: `${name.toLowerCase()}@example.com`,
          serviceSlug: services[0].slug,
          projectDescription:
            "A private project enquiry for testing ownership.",
        });
    await submit(one, "First").expect(201);
    await submit(two, "Second").expect(201);
    const mine = await one.get("/api/enquiries/mine").expect(200);
    expect(mine.body.data.enquiries).toHaveLength(1);
    expect(mine.body.data.enquiries[0].fullName).toBe("First");
    expect(mine.body.data.enquiries[0].userId).toBeUndefined();
    expect(
      (await two.get("/api/enquiries/mine").expect(200)).body.data.enquiries[0]
        .fullName,
    ).toBe("Second");
  });

  it("persists contact messages and rejects invalid and malformed request bodies", async () => {
    const response = await request(app)
      .post("/api/contact")
      .set(origin)
      .send({
        name: "Contact Person",
        email: "CONTACT@example.com",
        subject: "Project planning",
        message: "Please contact me about a new web project.",
        serviceSlug: services[0].slug,
        budgetRange: "Flexible",
        preferredTimeline: "This quarter",
      })
      .expect(201);
    expect(response.body.data.message).toMatch(/saved/i);
    const saved = await ContactMessage.findOne({
      email: "contact@example.com",
    });
    expect(saved.subject).toBe("Project planning");
    expect(saved.budgetRange).toBe("Flexible");
    await request(app)
      .post("/api/contact")
      .set(origin)
      .send({ name: "A", email: "no", subject: "", message: "" })
      .expect(400);
    await request(app)
      .post("/api/contact")
      .set(origin)
      .set("Content-Type", "application/json")
      .send("{bad json")
      .expect(400);
    expect(await ContactMessage.countDocuments()).toBe(1);
  });

  it("returns a database error instead of false success when persistence fails", async () => {
    const failure = new Error("simulated database unavailable");
    failure.name = "MongoNetworkError";
    const create = vi.spyOn(Enquiry, "create").mockRejectedValue(failure);
    try {
      const response = await request(app)
        .post("/api/enquiries")
        .set(origin)
        .send({
          fullName: "Guest Customer",
          email: "guest@example.com",
          serviceSlug: services[0].slug,
          projectDescription:
            "Please do not report success if the database is down.",
        })
        .expect(503);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("DATABASE_UNAVAILABLE");
    } finally {
      create.mockRestore();
    }
  });
});
