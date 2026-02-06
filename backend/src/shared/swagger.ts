import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Authentication API",
      version: "1.0.0",
      description:
        "API for user authentication and authorization",
      contact: {
        name: "API Support",
        email: "support@mernholidays.com",
      },
    },
    servers: [
      {
        url: "http://localhost:7002",
        description: "Development server",
      },
      {
        url: "https://your-production-domain.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "jwt",
        },
      },
    },
    security: [
      {
        cookieAuth: [],
      },
    ],
  },
  apis: ["./src/express/routes/*.ts"], // Path to the Express API routes
};

export const specs = swaggerJsdoc(options);
