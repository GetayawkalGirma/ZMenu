import { createSwaggerSpec } from "next-swagger-doc";

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: "pages/api", // Using pages router for your project
    definition: {
      openapi: "3.0.0",
      info: {
        title: "ZDish API",
        version: "1.0",
        description: "Restaurant menu management API",
      },
      components: {
        securitySchemes: {
          BearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      security: [],
    },
  });
  return spec;
};
