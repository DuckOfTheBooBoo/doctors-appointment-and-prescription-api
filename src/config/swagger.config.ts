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
        Token: {
          type: "object",
          properties: {
            token: { type: "string" },
          },
        },
        // Define your schemas here
        login_response: {
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
            message: { type: "string" },
          },
        },
        NotFoundResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
        UnauthorizedResponse: {
            type: "object",
            properties: {
                message: { type: "string", example: "You're not authrorized to make this request." }
            }
        },
        InternalErrorResponse: {
          type: "object",
          properties: {
            message: { type: "string", example: "Something went wrong" },
          },
        },
        Consultation: {
          type: "object",
          properties: {
            id: { type: "integer" },
            userId: { type: "integer" },
            scheduleId: { type: "integer" },
            bookedAt: { type: "string", format: "date-time" },
            note: { type: "string", nullable: true },
            done: { type: "boolean" },
          },
        },
        MedicalProfessional: {
          type: "object",
          properties: {},
        },
        User: {
          type: "object",
          properties: {
            id: { type: "integer", nullable: true },
            prefix: { type: "string", nullable: true },
            suffix: { type: "string", nullable: true },
            first_name: { type: "string" },
            last_name: { type: "string", nullable: true },
            date_of_birth: { type: "string", format: "date" },
            gender: { type: "string", enum: ["M", "F"] },
            phone: { type: "string" },
            email: { type: "string", nullable: true },
            password: { type: "string", nullable: true },
            address: { type: "string" },
            is_ative: { type: "integer" },
          },
          required: [
            "first_name",
            "date_of_birth",
            "gender",
            "phone",
            "email",
            "password",
            "address",
          ],
        },
        License: {
          type: "object",
          properties: {
            id: { type: "integer", example: 5 },
            number: { type: "string", example: "ABE13221" },
            issuing_authority: {
              type: "string",
              example: "Ministry of Health Republic Indonesia",
            },
            issue_date: {
              type: "string",
              format: "date-time",
              example: "2020-09-08T17:00:00.000Z",
            },
            expiry_date: {
              type: "string",
              format: "date-time",
              example: "2027-09-08T17:00:00.000Z",
            },
            specialty: { type: "string", nullable: true, example: null },
          },
        },
        UserWithLicense: {
          type: "object",
          properties: {
            id: { type: "integer", example: 10 },
            prefix: { type: "string", nullable: true, example: null },
            suffix: { type: "string", nullable: true, example: null },
            email: { type: "string", example: "alamazchicken@gmail.com" },
            password: { type: "string", nullable: true, example: null },
            first_name: { type: "string", example: "Alamaz" },
            last_name: { type: "string", nullable: true, example: "Al-Farouq" },
            date_of_birth: {
              type: "string",
              format: "date-time",
              example: "2005-12-08T17:00:00.000Z",
            },
            gender: { type: "string", enum: ["M", "F"], example: "M" },
            phone: { type: "string", example: "6281211614212" },
            address: {
              type: "string",
              example: "Rangkapan Jaya Baru, Pancoran Mas, Depok",
            },
            is_active: { type: "integer", example: 0 },
            created_at: {
              type: "string",
              format: "date-time",
              example: "2025-05-15T02:15:24.000Z",
            },
            updated_at: {
              type: "string",
              format: "date-time",
              example: "2025-05-15T02:15:24.000Z",
            },
            specialization: { type: "string", nullable: true, example: null },
            role: { type: "string", example: "pharmacist" },
            license: { $ref: "#/components/schemas/License" },
          },
        },
        Medicine: {
            type: "object",
            properties: {
              id: { type: "integer", example: 1 },
              name: { type: "string", example: "Paracetamol 500mg Tablet" },
              stock: { type: "integer", example: 150 }
            },
            required: ["id", "name", "stock"]
          },
          GetAllMedicinesResponse: {
            type: "object",
            properties: {
              message: { type: "string", example: "Medicines retrieved successfully" },
              data: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/Medicine"
                },
                example: [
                  { id: 1, name: "Amoxicillin 250mg Capsule", stock: 100 },
                  { id: 2, name: "Ibuprofen 400mg Tablet", stock: 75 }
                ]
              }
            },
            required: ["message", "data"]
          },
        UserInvitation: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "User invitation approved successfully",
            },
            data: {
              type: "object",
              properties: {
                user_id: { type: "integer", example: 10 },
                token: { type: "string", example: "abcdefg123456" },
                endpoint: {
                  type: "string",
                  example: "/auth/set-password?token=abcdefg123456",
                },
              },
            },
          },
        },
        Schedule: {
            type: "object",
            properties: {
                id: { type: "integer" },
                doctorId: { type: "integer" },
                date: { type: "string", format: "date" },
                startHour: { type: "integer" },
                endHour: { type: "integer" },
            },
            required: ["id", "doctorId", "date", "startHour", "endHour"],
        },
        ConflictResponse: {
          type: "object",
          properties: {
            message: { type: "string" }
          }
        },
        SimpleDoctor: {
            type: "object",
            properties: {
                id: { type: "integer", example: 6 },
                full_name: { type: "string", example: "Dr. Arajdian Altaf" },
                email: { type: "string", example: "adudu.adad@gmail.com" },
                specialization: { type: "string", example: "Obgyn" },
                schedules: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            id: { type: "integer", example: 5 },
                            date: { type: "string", format: "date-time", example: "2025-06-14T17:00:00.000Z" },
                            start_hour: { type: "integer", example: 11 },
                            end_hour: { type: "integer", example: 15 },
                        },
                    },
                },
            },
            required: ["id", "full_name", "email", "specialization", "schedules"]
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
          name: "ADMIN_KEY",
        },
      },
    },
  },
  apis: [path.resolve(__dirname, "../**/*.ts")], // Path to the API docs
};

export default swaggerJSDoc(swaggerConfig);
