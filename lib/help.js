export function showHelp() {
  console.log(`


────────────────────────────────────────────────────────────────
                React Component Graphify CLI
────────────────────────────────────────────────────────────────

# Usage
    • graphify search <ComponentName> <mode>

# Description
    • Analyze your React component structure and behavior using various modes.

# Available Modes

    • a | all     → Full Overview (all insights)
    • i | imp     → Import Usage (files where component is imported)
    • d | dead    → Dead Component Check (is it unused?)
    • s | size    → Component Size & LOC (lines, size, comments)
    • e | exp     → Export Type (default / named)
    • p | props   → Props Used (props used inside the component)
    • f | file    → File Information (extension & location)

# Examples

    • graphify search Header all
    • graphify search NavBar imp
    • graphify search Footer props

Need Help?
    + Run this anytime with
    • graphify help

────────────────────────────────────────────────────────────────


`);
}
