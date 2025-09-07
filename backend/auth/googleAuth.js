const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const Users = require('../Models/users');
const jwt = require('jsonwebtoken');
const RefreshTokens = require('../Models/refreshTokens');

// Google OAuth login route
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account'
}));

// Google OAuth callback route
router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/auth/google/failure' }),
    async (req, res) => {
        try {
            // req.user contains the user data and token from Passport strategy
            const {refreshToken, id} = req.user;
            
            // Redirect to frontend with success and token
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            const redirectUrl = `${frontendUrl}/auth/google/callback?success=true`;
            // //create refresh token for that device
            // await RefreshTokens.create({
            //     token: refreshToken,
            //     userId: id,
            //     userAgent: req.headers['user-agent'],
            //     expiresAt: new Date(Date.now() + process.env.JWT_REFRESH_SECRET_EXPIRES_IN * 24 * 60 * 60 * 1000)
            // });
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                signed: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
            res.redirect(redirectUrl);
        } catch (error) {
            console.error('Google callback error:', error);
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            res.redirect(`${frontendUrl}/auth/google/callback?error=authentication_failed`);
        }
    }
);

// Google OAuth failure route
router.get('/google/failure', (req, res) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/google/callback?error=google_oauth_failed`);
});

// Get current user info 
router.get('/me', async (req, res) => {
    const refreshToken=req.signedCookies.refreshToken
    const decoded=jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
    const user=await Users.findByPk(decoded.id)

    if (user) {
        const token= jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_SECRET_EXPIRES_IN || '15m' }
        );
        res.json({ user: user,
            token: token,
         });
    } else {
        res.status(401).json({ message: 'Not authenticated' });
    }
});

module.exports = router;