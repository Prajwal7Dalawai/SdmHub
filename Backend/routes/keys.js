const express = require('express');
const router = express.Router();
const Device = require('../models/device');
const Prekey = require('../models/prekey');

router.post('/register',async (req,res)=>{
    try{
    const {userId, deviceId, identityKeyPublic, signedPreKey, preKeys} = req.body;

    //save device docs
    await Device.findOneAndUpdate({deviceId},{
        userId,deviceId,identityKeyPublic,
        signedPreKeyId: signedPreKey.keyId,
        signedPreKeyPublic: signedPreKey.publicKey,
        signedPreKeySignature: signedPreKey.signature,
        lastSeen: new Date()
    },
        {upsert:true,new:true});

        const preKeyDocs = preKeys.map(pk=>({
            deviceId,
            prekeyId: pk.keyId,
            preKeyPublic: pk.publicKey
        }));

        await Prekey.insertMany(preKeyDocs);
        res.json({success:true})
    }catch(err){
            console.log(err);
            res.status(500).json({error: 'Failed to register keys'});
    }
});

router.get('/bundle/:userId', async (req,res)=>{
    try{
        const {userId} = req.params;
        const device = await Device.findOne({userId});
        if(!device) return res.status(404).json({error: 'No device found'});

        const prekey = await Prekey.findOneAndUpdate(
            {deviceId: device.deviceId, used:false},
            {$set: {used:true}},
            {new:true}
        );

        if(!prekey) return res.status(404).json({error: 'No prekeys found'});
        res.json({
            identityKeyPublic: device.identityKeyPublic,
            signedPreKey: {
                id: device.signedPreKeyId,
                publicKey: device.signedPreKeyPublic,
                signature: device.signedPreKeySignature
            },
            oneTimeKey:{
                id: prekey.prekeyId,
                publicKey: prekey.preKeyPublic
            }
        });
    }
    catch(err){
        console.error(err);
        res.status(500).json({error: 'Failed to fetch module'});
    }
});

module.exports = router;


