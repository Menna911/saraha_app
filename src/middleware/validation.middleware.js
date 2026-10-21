
import { BadRequestException } from "../common/utils/response/error.response.js";

export const validation = (schema) => {
    return (req, res, next) => {
        if (!schema) {
            throw new Error("Validation schema is missing");
        }

        const errors = [];

        for (const key of Object.keys(schema)) {
            const data = key === "file" ? req.file : req[key];

            const result = schema[key].validate(data, {
                abortEarly: false
            });

            if (result.error) {
                errors.push({
                    key,
                    details: result.error.details.map((ele) => ({
                        path: ele.path,
                        message: ele.message
                    }))
                });
            }
        }

        if (errors.length) {
            throw BadRequestException({
                message: "validation error",
                extra: errors
            });
        }

        next();
    };
};
