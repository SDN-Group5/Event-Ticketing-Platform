export interface SagaStep<T = any> {
  name: string;
  execute(context: T): Promise<T>;
  compensate(context: T): Promise<void>;
}

export interface SagaStepLog {
  name: string;
  status: 'executed' | 'compensated' | 'failed' | 'skipped';
  timestamp: Date;
  error?: string;
}

export interface SagaResult<T = any> {
  success: boolean;
  context: T;
  error?: string;
  failedStep?: string;
  stepLogs: SagaStepLog[];
}

export class SagaOrchestrator<T = any> {
  private steps: SagaStep<T>[];
  private sagaName: string;

  constructor(sagaName: string, steps: SagaStep<T>[]) {
    this.sagaName = sagaName;
    this.steps = steps;
  }

  async execute(initialContext: T): Promise<SagaResult<T>> {
    const executedSteps: number[] = [];
    const stepLogs: SagaStepLog[] = [];
    let context = { ...initialContext };

    console.log(`[Saga:${this.sagaName}] Bat dau (${this.steps.length} buoc)`);

    for (let i = 0; i < this.steps.length; i++) {
      const step = this.steps[i];
      try {
        context = await step.execute(context);
        executedSteps.push(i);
        stepLogs.push({
          name: step.name,
          status: 'executed',
          timestamp: new Date(),
        });
        console.log(`[Saga:${this.sagaName}] Step ${i + 1}/${this.steps.length} OK: ${step.name}`);
      } catch (err: any) {
        const errorMsg = err?.message || String(err);
        console.error(`[Saga:${this.sagaName}] Step ${i + 1} LOI: ${step.name} - ${errorMsg}`);
        stepLogs.push({
          name: step.name,
          status: 'failed',
          timestamp: new Date(),
          error: errorMsg,
        });

        await this.compensate(executedSteps, context, stepLogs);

        return {
          success: false,
          context,
          error: errorMsg,
          failedStep: step.name,
          stepLogs,
        };
      }
    }

    console.log(`[Saga:${this.sagaName}] Hoan thanh thanh cong`);
    return { success: true, context, stepLogs };
  }

  private async compensate(
    executedSteps: number[],
    context: T,
    stepLogs: SagaStepLog[],
  ): Promise<void> {
    console.log(`[Saga:${this.sagaName}] Bat dau compensate ${executedSteps.length} buoc...`);

    for (let i = executedSteps.length - 1; i >= 0; i--) {
      const stepIndex = executedSteps[i];
      const step = this.steps[stepIndex];
      try {
        await step.compensate(context);
        stepLogs.push({
          name: `compensate:${step.name}`,
          status: 'compensated',
          timestamp: new Date(),
        });
        console.log(`[Saga:${this.sagaName}] Compensated: ${step.name}`);
      } catch (compErr: any) {
        const errMsg = compErr?.message || String(compErr);
        stepLogs.push({
          name: `compensate:${step.name}`,
          status: 'failed',
          timestamp: new Date(),
          error: errMsg,
        });
        console.error(`[Saga:${this.sagaName}] Compensate FAILED: ${step.name} - ${errMsg}`);
      }
    }

    console.log(`[Saga:${this.sagaName}] Compensate hoan tat`);
  }
}
