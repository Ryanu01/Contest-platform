import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken"
import JWT_SECRET from "./config";
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const token = req.headers["authorization"]?.split(" ")[1]

        if(!token) {
            return res.status(401).json({
                "success": false,
                "data": null,
                "error": "UNAUTHORIZED"
            })
        }

        const decode = jwt.verify(token, JWT_SECRET) as JwtPayload
        if(!decode) {
            return res.status(401).json({
                "success": false,
                "data": null,
                "error": "UNAUTHORIZED"
            })
        }

        req.userId = decode.userId
        req.role = decode.role
        next()
    } catch (error) {
        return res.status(500).json({
            error
        })
    }
}