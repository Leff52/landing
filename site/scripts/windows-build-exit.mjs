// Vinext's forced successful exit can abort native async-handle cleanup on
// Windows (UV_HANDLE_CLOSING). Let a successful build drain its event loop.
// Failed exits retain their original behavior and nonzero status.
if (process.platform === 'win32') {
  const originalExit = process.exit.bind(process);
  process.exit = (code = process.exitCode ?? 0) => {
    if (Number(code) !== 0) return originalExit(code);
    process.exitCode = 0;
  };
}
