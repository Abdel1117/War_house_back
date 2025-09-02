const jwt = require('jsonwebtoken');
require('dotenv').config();


export const signAccessToken = (userId) => {
    jwt.sign({id: userId, v : user.tokenVersion }, process.env.JWT_SECRET, { expiresIn: '1h' })
}

export const signRefreshToken = (userId) => {
    jwt.sign({id: userId, v : user.tokenVersion }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

export const setRefreshCookie = (req, res, next) =>{ 
    res.cookie("refreshToken", token , {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path : "/",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })
} 