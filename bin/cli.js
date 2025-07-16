#!/usr/bin/env node
import { startWatching } from "../lib/analyzer.js";

startWatching().catch(console.error);
