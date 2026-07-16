import { UserModel } from "../../DB/index.js"
import { ConflictException, NotFoundException } from "../../common/enums/utils/response/error.response.js"
import { generateEncryption , generateDecryption } from "../../common/enums/utils/security/encryption.security.js";
import { generateHash, compareHash } from "../../common/enums/utils/security/hash.security.js"; 

export const signup = async (inputs) => {
    const {username, firstName, lastName, email, password, phone } = inputs;


    const checkUserExist = await UserModel.findOne({ email });
    if (checkUserExist) {
        throw ConflictException({ message: 'Email exist' });
    }

  
    const hashedPassword = await generateHash(password);
    const encryptedPhone = await generateEncryption(phone);

    console.log("DEBUG SIGNUP DATA:", { firstName, lastName, username });

  const user = await UserModel.create({
    firstName, 
    lastName, 
    email,
    password: hashedPassword,
    phone: encryptedPhone
});

    const userObj = user.toObject();
    delete userObj.password;

    return userObj;
}

export const login = async (inputs) => {
    const { email, password } = inputs;

    
    const user = await UserModel.findOne({ email });
    if (!user) {
        throw NotFoundException({ message: 'Invalid credentials' });
    }

    
    const isPasswordMatch = await compareHash(password, user.password);
    if (!isPasswordMatch) {
        throw BadRequestException({ message: 'Invalid credentials' });
    }


    const userObj = user.toObject();
    delete userObj.password; 

    if (userObj.phone) {
        userObj.phone = await generateDecryption(userObj.phone); 
    }

    return userObj;
}