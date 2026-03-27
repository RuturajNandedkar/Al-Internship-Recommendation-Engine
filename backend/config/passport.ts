import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import User from '../models/User';

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID as string,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
  callbackURL: process.env.GOOGLE_CALLBACK_URL as string
}, async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = await User.create({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails?.[0]?.value,
        avatar: profile.photos?.[0]?.value,
        password: 'google-oauth-no-password'
      });
    }
    return done(null, user);
  } catch(err) {
    return done(err as Error);
  }
}));

export default passport;
