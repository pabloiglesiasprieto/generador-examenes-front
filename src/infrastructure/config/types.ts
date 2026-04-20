export const TYPES = {
  // Repositories
  IAuthRepository: Symbol.for('IAuthRepository'),
  IExamenRepository: Symbol.for('IExamenRepository'),
  IPreguntaRepository: Symbol.for('IPreguntaRepository'),
  IUsuarioRepository: Symbol.for('IUsuarioRepository'),
  IIncidenciaRepository: Symbol.for('IIncidenciaRepository'),

  // UseCases - Auth
  ILoginUseCase: Symbol.for('ILoginUseCase'),
  IRegisterUseCase: Symbol.for('IRegisterUseCase'),

  // UseCases - Examenes
  IGetExamenesUseCase: Symbol.for('IGetExamenesUseCase'),
  IGetExamenByIdUseCase: Symbol.for('IGetExamenByIdUseCase'),
  ICreateExamenUseCase: Symbol.for('ICreateExamenUseCase'),
  IDeleteExamenUseCase: Symbol.for('IDeleteExamenUseCase'),
  IEvaluarExamenUseCase: Symbol.for('IEvaluarExamenUseCase'),
  IGetResultadosExamenUseCase: Symbol.for('IGetResultadosExamenUseCase'),
  IGetResultadosAlumnoUseCase: Symbol.for('IGetResultadosAlumnoUseCase'),
  IExportExamenesUseCase: Symbol.for('IExportExamenesUseCase'),
  IIniciarExamenUseCase: Symbol.for('IIniciarExamenUseCase'),
  IGetEstadisticasExamenesUseCase: Symbol.for('IGetEstadisticasExamenesUseCase'),
  IGetRankingAlumnosUseCase: Symbol.for('IGetRankingAlumnosUseCase'),
  IGetEstadisticasPreguntasUseCase: Symbol.for('IGetEstadisticasPreguntasUseCase'),
  IGetCategoriasUseCase: Symbol.for('IGetCategoriasUseCase'),

  // UseCases - Preguntas
  IGetAllPreguntasUseCase: Symbol.for('IGetAllPreguntasUseCase'),
  IGetPreguntaByIdUseCase: Symbol.for('IGetPreguntaByIdUseCase'),
  ICreatePreguntaUseCase: Symbol.for('ICreatePreguntaUseCase'),
  IUpdatePreguntaUseCase: Symbol.for('IUpdatePreguntaUseCase'),
  IDeletePreguntaUseCase: Symbol.for('IDeletePreguntaUseCase'),
  IImportarCsvPreguntasUseCase: Symbol.for('IImportarCsvPreguntasUseCase'),

  // UseCases - Usuarios
  IGetAllRolesUseCase: Symbol.for('IGetAllRolesUseCase'),
  IGetAllUsuariosUseCase: Symbol.for('IGetAllUsuariosUseCase'),
  IGetUsuarioByIdUseCase: Symbol.for('IGetUsuarioByIdUseCase'),
  IGetRolesByUsuarioUseCase: Symbol.for('IGetRolesByUsuarioUseCase'),
  IUpdateUsuarioUseCase: Symbol.for('IUpdateUsuarioUseCase'),
  IDeleteUsuarioUseCase: Symbol.for('IDeleteUsuarioUseCase'),
  IAsignarRolUseCase: Symbol.for('IAsignarRolUseCase'),
  IBorrarRolUseCase: Symbol.for('IBorrarRolUseCase'),

  // UseCases - Incidencias
  IGetAllIncidenciasUseCase: Symbol.for('IGetAllIncidenciasUseCase'),
  IGetIncidenciaByIdUseCase: Symbol.for('IGetIncidenciaByIdUseCase'),
  IGetIncidenciasByClaseUseCase: Symbol.for('IGetIncidenciasByClaseUseCase'),
  ICrearIncidenciaUseCase: Symbol.for('ICrearIncidenciaUseCase'),
};
