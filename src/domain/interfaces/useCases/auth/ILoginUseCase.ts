import { LoginRequest, LoginResponse } from '../../../entities/Auth';

export interface ILoginUseCase {
  execute(data: LoginRequest): Promise<LoginResponse>;
}
