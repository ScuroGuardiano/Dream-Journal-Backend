import { User } from '../models';
import * as bcrypt from 'bcrypt';
import { IUserInstance } from '../models/user';
import RegisterError, { RegisterErrorCodes } from '../errors/register-error';
import LoginError, { LoginErrorCodes } from '../errors/login-error';


export default class UserService {
    public async registerUser(email: string, password: string): Promise<IUserInstance> {
        email = email.toLowerCase();
        if(!this.validateEmail(email))
            throw new RegisterError("Invalid email adress", RegisterErrorCodes.INVALID_EMAIL_ADRESS);
        if(password.length < 8)
            throw new RegisterError("Password is too short", RegisterErrorCodes.PASSWORD_TOO_SHORT);
        if(await this.isEmailAlreadyTaken(email))
            throw new RegisterError("Email adress already taken", RegisterErrorCodes.EMAIL_ALREADY_USED);
        
        let hashedPassword = await bcrypt.hash(password, 12);
        let user = await User.create({
            email: email,
            password: hashedPassword
        });
        return user;
    }
    public async authenticateUser(email: string, password: string): Promise<IUserInstance> {
        email = email.toLowerCase();
        let user = await User.find({where: { email: email }});
        if(!user)
            throw new LoginError("User not found", LoginErrorCodes.USER_DOESNT_EXIST);
        let validPassword = await bcrypt.compare(password, user.password);
        if(!validPassword)
            throw new LoginError("Wrong password", LoginErrorCodes.WRONG_PASSWORD);
        return user;
    }
    public async checkSession(userId: string) {
        let user = await User.findById(userId);
        if(user)
            return true;
        return false;
    }

    private validateEmail(email: string) {
        const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
    private async isEmailAlreadyTaken(email: string) {
        let countUsers = await User.count({
            where: { email: email }
        });
        if(countUsers != 0)
            return true;
        return false;
    }
}