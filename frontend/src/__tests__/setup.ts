// ============================================================================
// Vitest Test Runner Setup Hook
// ============================================================================
// @testing-library/jest-dom attaches massive utility methods directly 
// to `expect`, such as `.toBeInTheDocument()` or `.toHaveTextContent()`
// which strictly evaluate simulated HTML elements parsed from jsdom in memory!
import '@testing-library/jest-dom';
