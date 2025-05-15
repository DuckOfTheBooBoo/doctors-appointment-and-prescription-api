import type { SwaggerOptions } from "swagger-ui-express";
import path from "path";
import swaggerJSDoc from "swagger-jsdoc";

const swaggerConfig: SwaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Doctors Appointment and Prescription API",
            version: "1.0.0",
            description: "API documentation for the application.",
        },
        servers: [
            {
                url: "http://localhost:3000", // URL of the server
                description: "Development server", // Description of the server
            },
        ],
        // paths: {}, // Paths will be populated dynamically
        components: {
            schemas: {
                Token : {
                    type: "object",
                    properties: {
                        token: { type: "string" },
                    },
                },
                // Define your schemas here
                LoginResponse: {
                    type: "object",
                    properties: {
                        message: { type: "string" },
                        data: { $ref: "#/components/schemas/Token" },
                    },
                },
                BadResponse: {
                    type: "object",
                    properties: {
                        message: { type: "string" },
                        errors: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    field: { type: "string" },
                                    error: { type: "string" },
                                },
                            },
                        },
                    },
                },
                InvalidCredentials: {
                    type: "object",
                    properties: {
                        message: { type: "string", example: "Invalid credentials" },
                    },
                },
                SuccessResponse: {
                    type: "object",
                    properties: {
                        message: { type: "string" }
                    }
                },
                NotFoundResponse: {
                    type: "object",
                    properties: {
                        message: { type: "string", example: "Resource not found" }
                    }
                },
                InternalErrorResponse: {
                    type: "object",
                    properties: {
                        message: { type: "string", example: "Something went wrong" }
                    }
                }
            },
            securitySchemes: {
                JWTAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
                AdminAuth: {
                    type: "apiKey",
                    in: "header",
                    name: "ADMIN_KEY"
                },
            }
        },
    },
    apis: [path.resolve(__dirname, "../**/*.ts")], // Path to the API docs
};

export default swaggerJSDoc(swaggerConfig);