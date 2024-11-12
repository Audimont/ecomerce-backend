import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthPayloadDto } from './dto/auth-payload.dto';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

    constructor(
        private readonly userService: UsersService,
        private readonly jwtService: JwtService
    ) {}

    async validateUser(authPayloadDto: AuthPayloadDto) {
        const users = await this.userService.findAll();
        const { email, password } = authPayloadDto;
        const user = await this.userService.findOneByEmail(email);
        console.log("User", user);
        if (!user || user.password !== password) {
            throw new UnauthorizedException("Invalid credentials");
        }
        return this.jwtService.sign({ email: user.email });
    }
}
