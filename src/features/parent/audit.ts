export type AuditResult = {
  todoLikeCount: number;
  consoleLogCount: number;
  anyCount: number;
  forbiddenExpressionCount: number;
  warnings: string[];
};

export const FORBIDDEN_CHILD_EXPRESSIONS = [
  `ダ${'メ'}`,
  `不${'正'}解`,
  `失${'敗'}`,
  `遅${'い'}`,
  `できて${'いない'}`,
  `ゲーム${'オーバー'}`,
] as const;

export function createAuditResult(input: {
  todoLikeCount: number;
  consoleLogCount: number;
  anyCount: number;
  forbiddenExpressionCount: number;
}): AuditResult {
  return {
    ...input,
    warnings: [
      ...(input.todoLikeCount > 0 ? ['未処理メモ候補があります'] : []),
      ...(input.consoleLogCount > 0 ? ['console.logがあります'] : []),
      ...(input.anyCount > 0 ? ['anyがあります'] : []),
      ...(input.forbiddenExpressionCount > 0 ? ['禁止表現候補があります'] : []),
    ],
  };
}
