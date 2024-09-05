const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const { default: axios } = require("axios");

const {
    GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET,
    GITHUB_CALLBACK_URI,
} = require("./server-config.js");
const { User } = require("../models/Users.js");
const { CustomerDetail } = require("../models/CustomerDetails.js");

passport.use(
    new GitHubStrategy(
        {
            clientID: GITHUB_CLIENT_ID,
            clientSecret: GITHUB_CLIENT_SECRET,
            callbackURL: GITHUB_CALLBACK_URI,
        },
        async function (accessToken, refreshToken, profile, done) {
            try {
                const { data } = await axios.get(
                    "https://api.github.com/user/emails",
                    {
                        headers: {
                            Authorization: `token ${accessToken}`,
                        },
                    }
                );
                const email =
                    data.find(
                        (emailInfo) => emailInfo.primary && emailInfo.verified
                    )?.email || null;

                if (!email) {
                    return done(
                        new Error("No verified email found for this user.")
                    );
                }

                let user = await User.findOne({ email });

                // no user found with this email;
                if (!user) {
                    user = await User.create({
                        email,
                        oauthProviders: [
                            {
                                provider: "github",
                                providerId: profile.id,
                                userName: profile.username,
                                profileUrl: profile.profileUrl,
                            },
                        ],
                    });

                    // by default customer role will be assigned;
                    await CustomerDetail.create({
                        user: user.id,
                        fullName: profile.displayName,
                    });
                } else {
                    // user found with this email;
                    // github is not added as a oauthProvider for this email / user;
                    if (
                        !user.oauthProviders ||
                        !user.oauthProviders.some(
                            (providerObj) => providerObj.provider === "github"
                        )
                    ) {
                        if (!user.oauthProviders) {
                            user.oauthProviders = [];
                        }
                        user.oauthProviders.push({
                            provider: "github",
                            providerId: profile.id,
                            userName: profile.username,
                            profileUrl: profile.profileUrl,
                        });
                    }
                    await user.save();
                }
                done(null, user);
            } catch (error) {
                done(error);
            }
        }
    )
);

module.exports = passport;
