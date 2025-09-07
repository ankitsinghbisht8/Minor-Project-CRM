const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Users = require('../Models/users');
const RefreshTokens = require('../Models/refreshTokens');
const jwt = require('jsonwebtoken');

// Configure Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log('Google OAuth Profile:', profile);
        
        // Extract user information from Google profile
        const { id: googleId, displayName: name, emails, photos } = profile;
        const email = emails[0].value;
        const profilePicture = photos[0].value;

        // Check if user already exists with this Google ID
        let user = await Users.findOne({ where: { googleSub: googleId } });

        
        //Create Refresh Token
        const refreshToken = jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                role: user.role 
            },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: process.env.JWT_REFRESH_SECRET_EXPIRES_IN || '7d' }
        );
        
        if (user) {
            // Update existing user
            user = await user.update({
                name: name || user.name,
                email: email || user.email,
                profilePicture: profilePicture || user.profilePicture,
                lastLogin: new Date(),
                isActive: true,
            });
            
            console.log('Updated existing Google user:', user.email);
        } else {
            // Check if user exists with same email
            const existingUser = await Users.findOne({ where: { email: email } });
            
            if (existingUser) {
                // Link Google account to existing user
                user = await existingUser.update({
                    googleSub: googleId,
                    profilePicture: profilePicture || existingUser.profilePicture,
                    lastLogin: new Date(),
                    isActive: true,
                });
               
                console.log('Linked Google account to existing user:', user.email);
            } else {
                // Create new user
                user = await Users.create({
                    name: name,
                    email: email,
                    googleSub: googleId,
                    profilePicture: profilePicture,
                    isActive: true,
                    lastLogin: new Date(),
                    role: 'user',
                
                });
               
                console.log('Created new Google user:', user.email);
            }
        }

        // Return user data with token
        return done(null, {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture            },
            refreshToken: refreshToken
        });

    } catch (error) {
        console.error('Google OAuth error:', error);
        return done(error, null);
    }
}));

// Serialize user for session (if using sessions)
passport.serializeUser((user, done) => {
    done(null, user);
});

// Deserialize user from session (if using sessions)
passport.deserializeUser((user, done) => {
    done(null, user);
});

module.exports = passport;
