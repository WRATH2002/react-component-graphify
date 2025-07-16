#!/usr/bin/env node

import { startWatching } from "../lib/analyzer.js";
import { searchComponent } from "../lib/search.js";
import { showHelp } from "../lib/help.js"; // You'll create this next

const args = process.argv.slice(2);
const command = args[0];

if (command === "search") {
  const componentName = args[1];
  const mode = args[2] || "all";

  if (!componentName) {
    console.error("# Error! Please provide a component name to search.\n");
    showHelp();
    process.exit(1);
  }

  // Run search logic
  searchComponent(componentName, mode);
} else if (command === "help" || !command) {
  showHelp();
} else {
  console.error(`# Error! Unknown command: ${command}\n`);
  showHelp();
  process.exit(1);
}
