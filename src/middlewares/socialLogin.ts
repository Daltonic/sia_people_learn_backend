// import passport from "passport";
// import google from "passport-google-oauth20";
// import github from "passport-github2";
// import facebook, { Profile } from "passport-facebook";
// import User, { IUser } from "@/resources/user/user.model";
// import { log } from "../utils";

// // passport.use(
// //   new google.Strategy(
// //     {
// //       clientID: process.env.GOOGLE_CLIENT_ID!,
// //       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
// //       callbackURL: "/auth/google/callback",
// //     },
// //     function (accessToken, refreshToken, profile, done) {
// //       done(null, profile);
// //     }
// //   )
// // );

// // passport.use(
// //   new github.Strategy(
// //     {
// //       clientID: process.env.GITHUB_CLIENT_ID!,
// //       clientSecret: process.env.GITHUB_CLIENT_SECRET!,
// //       callbackURL: "/auth/github/callback",
// //     },
// //     function (accessToken, refreshToken, profile, done) {
// //       done(null, profile);
// //     }
// //   )
// // );

// passport.use(
//   new facebook.Strategy(
//     {
//       clientID: process.env.GITHUB_CLIENT_ID!,
//       clientSecret: process.env.GITHUB_CLIENT_SECRET!,
//       callbackURL: "/auth/facebook/callback",
//     },
//     function verify(
//       accessToken: string,
//       refreshToken: string,
//       profile: Profile,
//       cb
//     ) {
//       User.findOne({ username: profile?.username }),
//         function (err: any, user: IUser) {
//           if (err) {
//             log.error(err.message);
//             return cb(err);
//           }
//           if (!user) {
//             User.create({
//               firstName: profile.name?.givenName,
//               lastName: profile.name?.familyName,
//               username: profile.username,
//               imgUrl: profile.photos ? profile.photos[0].value : null,
//               email: profile.emails ? profile.emails[0].value : null,
//             }),
//               function (err: any, user: IUser) {
//                 if (err) {
//                   log.error(err.message);
//                   return cb(err);
//                 }
//                 return cb(null, user);
//               };
//           } else {
//             return cb(null, user);
//           }
//         };
//     }
//   )
// );

// passport.serializeUser((user, done) => {
//   done(null, user);
// });

// passport.deserializeUser((user: IUser, done) => {
//   done(null, user);
// });
