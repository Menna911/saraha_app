import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName:  {
        type: String , 
        required:true , 
        minLength: [2, 'firstName cannot be less than 2 char but you have entered a {VALUE}`'] ,
        maxLength:25 , 
        trim: true
    },
     LastName:  {
        type: String , 
        required:true , 
        minLength: [2, 'firstName cannot be less than 2 char but you have entered a {VALUE}`'] ,
        maxLength:25 , 
        trim: true
    },
    email: {
        type: String ,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    phone: {
        type: String,
        trim: true
    },
    gender: {
        type: String,
        enum: ['male', 'female'],
        default: 'male'
    },
    isConfirmed: { 
        type: Boolean,
        default: false
    },
    changeCredentialTime: {
        type: Date
    },
    provider: {
        type: String,
        enum: ['system', 'Signup-google'],
        default: 'system'
    },
    coverPic: [{ 
        type: String
    }],
    address: {
        type: String,
        trim: true
    }
}, {
    collection: "Route_Users",
    timestamps: true ,
    strict: true,
    strictQuery: true,
    optimisticConcurrency: true,
    autoIndex: true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});

userSchema.virtual("username").set(function(value)
{
    const [firstName , LastName] = value?.split('') || [];
    this.set({firstName , LastName})
}).get(function(){
    return this.firstName + " " + this.LastName;
})

export const UserModel = mongoose.model.User || mongoose.model("User" , userSchema);
