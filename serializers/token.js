const UserToken = require("../models/token");


class UserTokenSerializer {
    static async getToken(userId) {
        const userToken = await UserToken.findByUserId({ uid: userId });
        return userToken;
    }

    static async serialize(tokenData) {
        var data = {
            "token": tokenData.id,
        }
        return data;
    }

    static async serializeByUserData(userData) {
        var tokenData = await this.getToken(userData.id);
        var serializedTokenData = await this.serialize(tokenData);
        var data = {
            "user": userData,
            "token": serializedTokenData.token,
        }
        return data;
    };
}


exports.UserTokenSerializer = UserTokenSerializer;
