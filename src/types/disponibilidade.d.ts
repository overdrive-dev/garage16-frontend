export type Horario = string;

export type DataUnicaHorarios = {
  [dateStr: string]: Horario[];
};

export type DiaSemana = 'dom' | 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab';

export type ConfiguracaoDiaSemana = {
  ativo: boolean;
  horarios: Horario[];
};

export type SemanalHorarios = {
  [key in DiaSemana]: ConfiguracaoDiaSemana;
};

export type PeriodoRange = {
  from: Date | null;
  to: Date | null;
};

export type DisponibilidadeConfig = {
  tipo: 'unica' | 'semanal' | 'periodo';
  dataUnica: DataUnicaHorarios;
  semanal: SemanalHorarios;
  periodo: {
    range: PeriodoRange;
    horarios: DataUnicaHorarios;
  };
}; 