/**
 * Uniform success envelope so the frontend `apiRequest` client can
 * always destructure `{ status, message, data }`.
 */
export function ok(res, data, message = "OK", statusCode = 200) {
    return res.status(statusCode).json({
        status: "success",
        message,
        data,
    });
}
//# sourceMappingURL=respond.js.map