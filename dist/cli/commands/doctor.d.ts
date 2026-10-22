/**
 * Environment & toolchain diagnostics command (`andrud doctor`)
 */
export interface DoctorCheckResult {
    name: string;
    status: 'ok' | 'warn' | 'missing';
    version?: string;
    details: string;
    hint?: string;
}
export interface DoctorCommandOptions {
    json?: boolean;
}
/**
 * Run all environment & Android/KMP toolchain checks
 */
export declare function runDoctorChecks(): Promise<DoctorCheckResult[]>;
/**
 * Execute `andrud doctor` command
 */
export declare function createDoctorCommand(options?: DoctorCommandOptions): Promise<void>;
//# sourceMappingURL=doctor.d.ts.map