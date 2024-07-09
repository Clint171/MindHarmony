const { User } = require("./db/schema.js");
const axios = require("axios");

module.exports = (req , res , next)=>{
    if(!req.headers.authorization) return res.status(401).send("Unauthorized by chat server");
    var token = req.headers.authorization.split(" ")[1];
    if(!token) return res.status(401);
    try {
        console.log(token)
        axios.get(`${process.env.AUTH_URL}/user/user-details`, {
            headers: {
                Authorization: `Token ${token}`
            }
        }).then(async (response)=>{
            let user = await User.findOne({id : response.data.user.id});
            if(!user || user == null){
                user = new User({
                    username : response.data.user.username,
                    id : response.data.user.id,
                    profileImg : response.data.profile_picture,
                    lastOnline : Date.now(),
                    groups : [],
                    chats : []
                });
                await user.save();
            }
            req.user = user;
            next();
        }).catch((err)=>{return res.status(401).send("Unauthorized by auth server")});
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
}