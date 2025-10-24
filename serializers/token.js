const UserToken = require("../models/token");


class UserTokenSerializer {
    static async getToken(userId) {
        const userToken = await UserToken.findByUserId(userId);
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
        if (tokenData.data.length == 0) {
            await UserToken.insert({
                "user_id": userData.id,
            })
            tokenData = await this.getToken(userData.id);
        }
        var serializedTokenData = await this.serialize(tokenData.data[0]);
        var data = {
            "user": userData,
            "token": serializedTokenData.token,
        }
        return data;
    };
}


exports.UserTokenSerializer = UserTokenSerializer;
