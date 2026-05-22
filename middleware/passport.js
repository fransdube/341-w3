const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/User');

// JWT Strategy
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
};

passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
        const user = await User.findById(payload.id).select('-password');
        if (user && user.isActive) {
            return done(null, user);
        }
        return done(null, false);
    } catch (error) {
        return done(error, false);
    }
}));

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback',
    passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
    try {
        console.log('Google profile received:', profile.id, profile.emails[0].value);
        
        // Check if user exists with Google ID
        let user = await User.findOne({ googleId: profile.id });
        
        if (!user) {
            // Check if user exists with same email
            user = await User.findOne({ email: profile.emails[0].value });
            
            if (user) {
                // Link Google account to existing user
                user.googleId = profile.id;
                if (profile.photos && profile.photos[0]) {
                    user.profilePicture = profile.photos[0].value;
                }
                await user.save();
                console.log('Linked Google account to existing user:', user.email);
            } else {
                // Create new user
                const username = profile.displayName
                    .toLowerCase()
                    .replace(/\s/g, '_') + '_' + Date.now();
                
                user = await User.create({
                    username: username,
                    email: profile.emails[0].value,
                    googleId: profile.id,
                    profilePicture: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
                    isActive: true,
                    emailVerified: true
                });
                console.log('Created new user via Google:', user.email);
            }
        }
        
        // Update last login
        user.lastLogin = Date.now();
        await user.save();
        
        return done(null, user);
    } catch (error) {
        console.error('Google OAuth error:', error);
        return done(error, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id).select('-password -refreshToken');
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;