declare module 'string-mask' {
  type ProcessResult = {result: string; valid: boolean};
  function process(value: string, pattern: string): ProcessResult;
  function apply(value: string, pattern: string): string;
  function validate(value: string, pattern: string): boolean;
}
