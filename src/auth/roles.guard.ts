import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) {
            return true;
        }
        const { user } = context.switchToHttp().getRequest();
        const userRole = user?.role?.toString()?.toLowerCase();
        
        const hasRole = requiredRoles.some(role => role.toLowerCase() === userRole);
        console.log(`RolesGuard processing: Required: ${requiredRoles}, Current: ${userRole}, HasRole: ${hasRole}`);
        
        if (!hasRole) {
            throw new UnauthorizedException(`Yetersiz yetki. Gerekli rol: ${requiredRoles.join(', ')}. Mevcut rol: ${userRole}`);
        }
        return true;
    }
}
