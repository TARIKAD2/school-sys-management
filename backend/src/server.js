const http = require("http");
const app = require("./app");
const { connectToDatabase } = require("./utils/db");
const { env } = require("./utils/env");
const { seedAdmin } = require("./utils/seedAdmin");

async function start() {
  await connectToDatabase(env.MONGO_URI);
  await seedAdmin({
    email: env.SEED_ADMIN_EMAIL,
    password: env.SEED_ADMIN_PASSWORD,
    name: env.SEED_ADMIN_NAME,
  });

  const server = http.createServer(app);
  
  const io = require("socket.io")(server, {
    cors: {
      origin: env.CORS_ORIGIN ? env.CORS_ORIGIN.split(",") : true,
      methods: ["GET", "POST"],
      credentials: true,
    }
  });

  const socketAuthMiddleware = (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication error"));
    
    // Require jwt from global or file scope. Let's require locally here for simplicity.
    const jwt = require("jsonwebtoken");
    jwt.verify(token, env.JWT_SECRET, (err, decoded) => {
      if (err) return next(new Error("Authentication error"));
      // Attach verified user ID payload to socket wrapper
      socket.user = decoded;
      next();
    });
  };

  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    // Automatically join the exact verified user ID room 
    const secureUserId = socket.user.id || socket.user._id;
    socket.join(secureUserId.toString());
    
    console.log(`Socket securely connected & locked to room: ${secureUserId}`);

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${secureUserId}`);
    });
  });

  // Make io accessible to routes
  app.set("io", io);

  server.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on port ${env.PORT}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server:", err);
  process.exit(1);
});

