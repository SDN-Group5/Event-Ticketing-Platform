// ============================================================
// SAGA ORCHESTRATOR — "Nhạc trưởng" điều phối chuỗi bước xử lý
//
// Pattern Saga: chạy từng bước tuần tự.
// Nếu một bước lỗi → tự động rollback (compensate) ngược lại
// tất cả các bước đã chạy thành công trước đó.
// ============================================================

// Khuôn mẫu cho mỗi bước trong Saga.
// Mọi bước (step) đều phải có đủ 3 thứ:
//   - name:        tên bước (để log và debug)
//   - execute():   logic chính — làm gì khi bước chạy
//   - compensate(): logic rollback — hoàn tác nếu bước sau bị lỗi
export interface SagaStep<T = any> {
  name: string;
  execute(context: T): Promise<T>;
  compensate(context: T): Promise<void>;
}

// Cấu trúc log của từng bước — ghi lại trạng thái sau mỗi lần chạy/rollback.
// Được lưu vào mảng sagaLog trong MongoDB (Order document).
export interface SagaStepLog {
  name: string;
  // executed   = bước chạy thành công
  // compensated = bước đã được rollback thành công
  // failed     = bước bị lỗi (hoặc rollback bị lỗi)
  // skipped    = bước bị bỏ qua
  status: 'executed' | 'compensated' | 'failed' | 'skipped';
  timestamp: Date;
  error?: string; // có giá trị khi status = 'failed'
}

// Kết quả trả về sau khi toàn bộ Saga chạy xong (hoặc thất bại).
export interface SagaResult<T = any> {
  success: boolean;     // true = tất cả bước OK | false = có bước lỗi
  context: T;           // túi dữ liệu sau khi saga kết thúc
  error?: string;       // thông báo lỗi của bước thất bại
  failedStep?: string;  // tên bước bị lỗi
  stepLogs: SagaStepLog[]; // toàn bộ log từng bước (để lưu vào DB)
}

// Class chính — nhận danh sách bước và chạy chúng theo thứ tự.
// T = kiểu dữ liệu của Context (vd: BookingContext, PaymentCompleteContext)
export class SagaOrchestrator<T = any> {
  private steps: SagaStep<T>[];   // danh sách bước cần chạy
  private sagaName: string;       // tên saga (để log)

  constructor(sagaName: string, steps: SagaStep<T>[]) {
    this.sagaName = sagaName;
    this.steps = steps;
  }

  // Hàm chính — chạy tuần tự từng bước từ đầu đến cuối.
  async execute(initialContext: T): Promise<SagaResult<T>> {
    // Lưu index các bước đã chạy thành công (để biết cần rollback bước nào)
    const executedSteps: number[] = [];
    const stepLogs: SagaStepLog[] = [];

    // Sao chép context để không làm thay đổi object gốc bên ngoài
    let context = { ...initialContext };

    console.log(`[Saga:${this.sagaName}] Bat dau (${this.steps.length} buoc)`);

    for (let i = 0; i < this.steps.length; i++) {
      const step = this.steps[i];
      try {
        // Chạy bước — context mới (có thể có thêm dữ liệu) được trả về
        context = await step.execute(context);

        // Ghi lại index bước đã thành công (dùng khi cần rollback)
        executedSteps.push(i);
        stepLogs.push({
          name: step.name,
          status: 'executed',
          timestamp: new Date(),
        });
        console.log(`[Saga:${this.sagaName}] Step ${i + 1}/${this.steps.length} OK: ${step.name}`);
      } catch (err: any) {
        // Bước hiện tại bị lỗi → log lỗi
        const errorMsg = err?.message || String(err);
        console.error(`[Saga:${this.sagaName}] Step ${i + 1} LOI: ${step.name} - ${errorMsg}`);
        stepLogs.push({
          name: step.name,
          status: 'failed',
          timestamp: new Date(),
          error: errorMsg,
        });

        // Tự động rollback ngược lại tất cả bước đã thành công trước đó
        await this.compensate(executedSteps, context, stepLogs);

        // Trả về kết quả thất bại
        return {
          success: false,
          context,
          error: errorMsg,
          failedStep: step.name,
          stepLogs,
        };
      }
    }

    // Tất cả bước chạy xong không lỗi
    console.log(`[Saga:${this.sagaName}] Hoan thanh thanh cong`);
    return { success: true, context, stepLogs };
  }

  // Hàm rollback — chạy ngược từ bước cuối về bước đầu.
  // Ví dụ: bước 1, 2, 3 đã chạy → bước 4 lỗi → rollback 3 → 2 → 1
  private async compensate(
    executedSteps: number[], // danh sách index các bước đã thành công
    context: T,
    stepLogs: SagaStepLog[],
  ): Promise<void> {
    console.log(`[Saga:${this.sagaName}] Bat dau compensate ${executedSteps.length} buoc...`);

    // Duyệt ngược từ bước cuối cùng đã thành công
    for (let i = executedSteps.length - 1; i >= 0; i--) {
      const stepIndex = executedSteps[i];
      const step = this.steps[stepIndex];
      try {
        // Gọi hàm compensate của từng bước để hoàn tác
        await step.compensate(context);
        stepLogs.push({
          name: `compensate:${step.name}`,
          status: 'compensated',
          timestamp: new Date(),
        });
        console.log(`[Saga:${this.sagaName}] Compensated: ${step.name}`);
      } catch (compErr: any) {
        // Rollback chính nó cũng lỗi → chỉ log, không throw (tránh crash)
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
