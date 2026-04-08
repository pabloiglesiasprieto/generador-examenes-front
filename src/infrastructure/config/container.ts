import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from './types';

// Repositories
import { AuthRepository } from '../../data/repositories/AuthRepository';
import { ExamenRepository } from '../../data/repositories/ExamenRepository';
import { PreguntaRepository } from '../../data/repositories/PreguntaRepository';
import { UsuarioRepository } from '../../data/repositories/UsuarioRepository';
import { IncidenciaRepository } from '../../data/repositories/IncidenciaRepository';

// Interfaces - Repositories
import { IAuthRepository } from '../../domain/interfaces/repositories/IAuthRepository';
import { IExamenRepository } from '../../domain/interfaces/repositories/IExamenRepository';
import { IPreguntaRepository } from '../../domain/interfaces/repositories/IPreguntaRepository';
import { IUsuarioRepository } from '../../domain/interfaces/repositories/IUsuarioRepository';
import { IIncidenciaRepository } from '../../domain/interfaces/repositories/IIncidenciaRepository';

// UseCases - Auth
import { LoginUseCase } from '../../domain/useCases/auth/LoginUseCase';
import { RegisterUseCase } from '../../domain/useCases/auth/RegisterUseCase';
import { ILoginUseCase } from '../../domain/interfaces/useCases/auth/ILoginUseCase';
import { IRegisterUseCase } from '../../domain/interfaces/useCases/auth/IRegisterUseCase';

// UseCases - Examenes
import {
  GetExamenesUseCase,
  GetExamenByIdUseCase,
  CreateExamenUseCase,
  IniciarExamenUseCase,
  DeleteExamenUseCase,
  EvaluarExamenUseCase,
  GetResultadosExamenUseCase,
  GetResultadosAlumnoUseCase,
  ExportExamenesUseCase,
  GetEstadisticasExamenesUseCase,
  GetRankingAlumnosUseCase,
  GetEstadisticasPreguntasUseCase,
} from '../../domain/useCases/examenes/GetExamenesUseCase';
import {
  IGetExamenesUseCase,
  IGetExamenByIdUseCase,
  ICreateExamenUseCase,
  IIniciarExamenUseCase,
  IDeleteExamenUseCase,
  IEvaluarExamenUseCase,
  IGetResultadosExamenUseCase,
  IGetResultadosAlumnoUseCase,
  IExportExamenesUseCase,
  IGetEstadisticasExamenesUseCase,
  IGetRankingAlumnosUseCase,
  IGetEstadisticasPreguntasUseCase,
} from '../../domain/interfaces/useCases/examenes/IExamenUseCase';

// UseCases - Preguntas
import {
  GetAllPreguntasUseCase,
  GetPreguntaByIdUseCase,
  CreatePreguntaUseCase,
  UpdatePreguntaUseCase,
  DeletePreguntaUseCase,
} from '../../domain/useCases/preguntas/PreguntaUseCases';
import {
  IGetAllPreguntasUseCase,
  IGetPreguntaByIdUseCase,
  ICreatePreguntaUseCase,
  IUpdatePreguntaUseCase,
  IDeletePreguntaUseCase,
} from '../../domain/interfaces/useCases/preguntas/IPreguntaUseCase';

// UseCases - Usuarios
import {
  GetAllRolesUseCase,
  GetAllUsuariosUseCase,
  GetUsuarioByIdUseCase,
  GetRolesByUsuarioUseCase,
  UpdateUsuarioUseCase,
  DeleteUsuarioUseCase,
  AsignarRolUseCase,
  BorrarRolUseCase,
} from '../../domain/useCases/usuarios/UsuarioUseCases';
import {
  IGetAllRolesUseCase,
  IGetAllUsuariosUseCase,
  IGetUsuarioByIdUseCase,
  IGetRolesByUsuarioUseCase,
  IUpdateUsuarioUseCase,
  IDeleteUsuarioUseCase,
  IAsignarRolUseCase,
  IBorrarRolUseCase,
} from '../../domain/interfaces/useCases/usuarios/IUsuarioUseCase';

// UseCases - Incidencias
import {
  GetAllIncidenciasUseCase,
  GetIncidenciaByIdUseCase,
  GetIncidenciasByClaseUseCase,
  CrearIncidenciaUseCase,
} from '../../domain/useCases/incidencias/IncidenciaUseCases';
import {
  IGetAllIncidenciasUseCase,
  IGetIncidenciaByIdUseCase,
  IGetIncidenciasByClaseUseCase,
  ICrearIncidenciaUseCase,
} from '../../domain/interfaces/useCases/incidencias/IIncidenciaUseCase';

const container = new Container();

// Bind repositories
container.bind<IAuthRepository>(TYPES.IAuthRepository).to(AuthRepository);
container.bind<IExamenRepository>(TYPES.IExamenRepository).to(ExamenRepository);
container.bind<IPreguntaRepository>(TYPES.IPreguntaRepository).to(PreguntaRepository);
container.bind<IUsuarioRepository>(TYPES.IUsuarioRepository).to(UsuarioRepository);
container.bind<IIncidenciaRepository>(TYPES.IIncidenciaRepository).to(IncidenciaRepository);

// Bind use cases - Auth
container.bind<ILoginUseCase>(TYPES.ILoginUseCase).to(LoginUseCase);
container.bind<IRegisterUseCase>(TYPES.IRegisterUseCase).to(RegisterUseCase);

// Bind use cases - Examenes
container.bind<IGetExamenesUseCase>(TYPES.IGetExamenesUseCase).to(GetExamenesUseCase);
container.bind<IGetExamenByIdUseCase>(TYPES.IGetExamenByIdUseCase).to(GetExamenByIdUseCase);
container.bind<ICreateExamenUseCase>(TYPES.ICreateExamenUseCase).to(CreateExamenUseCase);
container.bind<IDeleteExamenUseCase>(TYPES.IDeleteExamenUseCase).to(DeleteExamenUseCase);
container.bind<IEvaluarExamenUseCase>(TYPES.IEvaluarExamenUseCase).to(EvaluarExamenUseCase);
container.bind<IGetResultadosExamenUseCase>(TYPES.IGetResultadosExamenUseCase).to(GetResultadosExamenUseCase);
container.bind<IGetResultadosAlumnoUseCase>(TYPES.IGetResultadosAlumnoUseCase).to(GetResultadosAlumnoUseCase);
container.bind<IExportExamenesUseCase>(TYPES.IExportExamenesUseCase).to(ExportExamenesUseCase);
container.bind<IIniciarExamenUseCase>(TYPES.IIniciarExamenUseCase).to(IniciarExamenUseCase);
container.bind<IGetEstadisticasExamenesUseCase>(TYPES.IGetEstadisticasExamenesUseCase).to(GetEstadisticasExamenesUseCase);
container.bind<IGetRankingAlumnosUseCase>(TYPES.IGetRankingAlumnosUseCase).to(GetRankingAlumnosUseCase);
container.bind<IGetEstadisticasPreguntasUseCase>(TYPES.IGetEstadisticasPreguntasUseCase).to(GetEstadisticasPreguntasUseCase);

// Bind use cases - Preguntas
container.bind<IGetAllPreguntasUseCase>(TYPES.IGetAllPreguntasUseCase).to(GetAllPreguntasUseCase);
container.bind<IGetPreguntaByIdUseCase>(TYPES.IGetPreguntaByIdUseCase).to(GetPreguntaByIdUseCase);
container.bind<ICreatePreguntaUseCase>(TYPES.ICreatePreguntaUseCase).to(CreatePreguntaUseCase);
container.bind<IUpdatePreguntaUseCase>(TYPES.IUpdatePreguntaUseCase).to(UpdatePreguntaUseCase);
container.bind<IDeletePreguntaUseCase>(TYPES.IDeletePreguntaUseCase).to(DeletePreguntaUseCase);

// Bind use cases - Usuarios
container.bind<IGetAllRolesUseCase>(TYPES.IGetAllRolesUseCase).to(GetAllRolesUseCase);
container.bind<IGetAllUsuariosUseCase>(TYPES.IGetAllUsuariosUseCase).to(GetAllUsuariosUseCase);
container.bind<IGetUsuarioByIdUseCase>(TYPES.IGetUsuarioByIdUseCase).to(GetUsuarioByIdUseCase);
container.bind<IGetRolesByUsuarioUseCase>(TYPES.IGetRolesByUsuarioUseCase).to(GetRolesByUsuarioUseCase);
container.bind<IUpdateUsuarioUseCase>(TYPES.IUpdateUsuarioUseCase).to(UpdateUsuarioUseCase);
container.bind<IDeleteUsuarioUseCase>(TYPES.IDeleteUsuarioUseCase).to(DeleteUsuarioUseCase);
container.bind<IAsignarRolUseCase>(TYPES.IAsignarRolUseCase).to(AsignarRolUseCase);
container.bind<IBorrarRolUseCase>(TYPES.IBorrarRolUseCase).to(BorrarRolUseCase);

// Bind use cases - Incidencias
container.bind<IGetAllIncidenciasUseCase>(TYPES.IGetAllIncidenciasUseCase).to(GetAllIncidenciasUseCase);
container.bind<IGetIncidenciaByIdUseCase>(TYPES.IGetIncidenciaByIdUseCase).to(GetIncidenciaByIdUseCase);
container.bind<IGetIncidenciasByClaseUseCase>(TYPES.IGetIncidenciasByClaseUseCase).to(GetIncidenciasByClaseUseCase);
container.bind<ICrearIncidenciaUseCase>(TYPES.ICrearIncidenciaUseCase).to(CrearIncidenciaUseCase);

export { container };
