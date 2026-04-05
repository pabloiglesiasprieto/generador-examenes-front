import { injectable, inject } from 'inversify';
import { TYPES } from '../../../infrastructure/config/types';
import { IAuthRepository } from '../../interfaces/repositories/IAuthRepository';
import { IRegisterUseCase } from '../../interfaces/useCases/auth/IRegisterUseCase';
import { RegisterRequest } from '../../entities/Auth';
import { UsuarioDTO } from '../../entities/Usuario';

@injectable()
export class RegisterUseCase implements IRegisterUseCase {
  constructor(@inject(TYPES.IAuthRepository) private authRepository: IAuthRepository) {}

  execute(data: RegisterRequest): Promise<UsuarioDTO> {
    return this.authRepository.register(data);
  }
}
