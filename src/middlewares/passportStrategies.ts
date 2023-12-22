import User from "@/resources/user/user.model";
import passport, { DoneCallback } from "passport";
import {
  Strategy as GoogleStrategy,
  Profile as GoogleProfile,
} from "passport-google-oauth20";
import {
  Strategy as FacebookStrategy,
  Profile as FacebookProfile,
} from "passport-facebook";
import {
  Strategy as GithubStrategy,
  Profile as GithubProfile,
} from "passport-github2";
import {
  Strategy as TwitterStrategy,
  Profile as TwitterProfile,
} from "passport-twitter";
import { createAccessToken, generateAlphanumeric, log } from "@/utils/index";

export const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: `${process.env.ORIGIN}/api/v1/auth/google/callback`,
  },
  async (accessToken, refreshToken, profile: GoogleProfile, done) => {
    try {
      // Get the relevant objects from the profile
      const {
        _json: { email, given_name, family_name, picture },
      } = profile;

      if (!email) {
        throw new Error("User not found");
      }

      // Check if the user already exist in the database
      const user = await User.findOne({ email });
      if (user) {
        // Sign accessToken
        const accessToken = createAccessToken(user);

        return done(null, { user, accessToken });
      } else {
        // Create the user
        const stripedEmail = email.split("@");
        const username = `${stripedEmail[0]}_${generateAlphanumeric(6)}`;
        const user = await User.create({
          email,
          username,
          firstName: given_name,
          lastName: family_name,
          imgUrl: picture || null,
          verified: true,
        });

        // Create the user token
        const accessToken = createAccessToken(user);
        done(null, { user, accessToken });
      }
    } catch (e: any) {
      log.error(e.message);
      return done(e);
    }
  }
);

const facebookStrategy = new FacebookStrategy(
  {
    clientID: process.env.FACEBOOK_CLIENT_ID!,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    callbackURL: `${process.env.ORIGIN}/api/v1/auth/facebook/callback`,
    profileFields: [
      "id",
      "displayName",
      "email",
      "first_name",
      "middle_name",
      "last_name",
    ],
  },
  async (
    accessToken: string,
    refreshToken: string,
    profile: FacebookProfile,
    done: DoneCallback
  ) => {
    try {
      // Get the relevant data from the user profile
      const { name, emails, photos, displayName } = profile;
      // console.log(name, emails, photos, displayName);
      console.log(profile);

      if (!emails) {
        throw new Error("Emails do not exist");
      }

      // Check if the user already exist in the database
      const user = await User.findOne({ email: emails[0].value });
      if (user) {
        // Sign accessToken
        const accessToken = createAccessToken(user);

        return done(null, accessToken);
      } else {
        // Create the user
        const user = await User.create({
          email: emails[0].value,
          firstName: name ? name.givenName : displayName,
          lastName: name ? name.familyName : displayName,
          imgUrl: photos ? photos[0].value : null,
        });

        // Create the user token
        const accessToken = createAccessToken(user);
        done(null, accessToken);
      }
    } catch (e: any) {
      log.error(e.message);
      return done(e);
    }
  }
);

const githubStrategy = new GithubStrategy(
  {
    clientID: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    scope: ["user:email"],
    callbackURL: `${process.env.ORIGIN}/api/v1/auth/github/callback`,
  },
  async (
    accessToken: string,
    refreshToken: string,
    profile: GithubProfile,
    done: DoneCallback
  ) => {
    try {
      // Get the relevant data from the user profile
      const { emails, photos, displayName } = profile;

      if (!emails) {
        throw new Error("Emails do not exist");
      }

      // Check if the user already exist in the database
      const user = await User.findOne({ email: emails[0].value });
      if (user) {
        // Sign accessToken
        const accessToken = createAccessToken(user);

        return done(null, { user, accessToken });
      } else {
        // CreateUser
        const stripedEmail = emails[0].value.split("@");
        const username = `${stripedEmail[0]}_${generateAlphanumeric(6)}`;
        const [firstName, lastName] = displayName.split(" ");
        const user = await User.create({
          email: emails[0].value,
          username,
          firstName,
          lastName,
          imgUrl: photos ? photos[0].value : null,
          verified: true,
        });

        // Create the user token
        const accessToken = createAccessToken(user);
        return done(null, { user, accessToken });
      }
    } catch (e: any) {
      log.error(e.message);
      return done(e);
    }
  }
);

const twitterStrategy = new TwitterStrategy(
  {
    consumerKey: process.env.TWITTER_CONSUMER_KEY!,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET!,
    callbackURL: `${process.env.ORIGIN}/api/v1/auth/twitter/callback`,
  },
  async (
    accessToken: string,
    refreshToken: string,
    profile: TwitterProfile,
    done: DoneCallback
  ) => {
    try {
      // Get the relevant data from the user profile
      const { emails, photos, displayName } = profile;
      console.log(profile);

      if (!emails) {
        throw new Error("Emails do not exist");
      }

      // Check if the user already exist in the database
      const user = await User.findOne({ email: emails[0].value });
      if (user) {
        // Sign accessToken
        const accessToken = createAccessToken(user);

        return done(null, { user, accessToken });
      } else {
        // CreateUser
        const stripedEmail = emails[0].value.split("@");
        const username = `${stripedEmail[0]}_${generateAlphanumeric(6)}`;
        const [firstName, lastName] = displayName.split(" ");
        const user = await User.create({
          email: emails[0].value,
          username,
          firstName,
          lastName,
          imgUrl: photos ? photos[0].value : null,
          verified: true,
        });

        // Create the user token
        const accessToken = createAccessToken(user);
        return done(null, { user, accessToken });
      }
    } catch (e: any) {
      log.error(e.message);
      return done(e);
    }
  }
);

passport.use(googleStrategy);
passport.use(facebookStrategy);
passport.use(githubStrategy);
passport.use(twitterStrategy);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});
