import { injectable, inject } from 'inversify';
import { TYPES } from '../../../infrastructure/config/types';
import { IAuthRepository } from '../../interfaces/repositories/IAuthRepository';
import { ILoginUseCase } from '../../interfaces/useCases/auth/ILoginUseCase';
import { LoginRequest, LoginResponse } from '../../entities/Auth';

@injectable()
export class LoginUseCase implements ILoginUseCase {
  constructor(@inject(TYPES.IAuthRepository) private authRepository: IAuthRepository) {}

  execute(data: LoginRequest): Promise<LoginResponse> {
    return this.authRepository.login(data);
  }
}
