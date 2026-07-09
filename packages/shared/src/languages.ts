export interface LanguageConfig {
  key: string;
  name: string;
  srcName: string;
  /** Command run inside the sandbox to compile. Null = interpreted, no compile step. */
  compileCmd: string[] | null;
  /** Command run inside the sandbox to execute the compiled artifact / interpreter. */
  runCmd: string[];
  /** Multiplier applied to the problem's time limit (e.g. JVM warmup). */
  timeFactor: number;
  /** Extra KB added to the problem's memory limit to account for runtime overhead. */
  memOverheadKb: number;
  /** Extra wall-clock ms allowed for compilation. */
  compileTimeMs: number;
  /**
   * Max concurrent processes/threads (isolate --processes) allowed during RUN (not compile).
   * Must be >1 for runtimes that spawn internal threads even for trivial programs (e.g. the
   * JVM's GC/JIT threads) — 1 would make every submission in that language crash on startup.
   */
  sandboxProcessLimit: number;
}

export const LANGUAGES: Record<string, LanguageConfig> = {
  cpp17: {
    key: "cpp17",
    name: "C++17",
    srcName: "main.cpp",
    compileCmd: ["/usr/bin/g++", "-O2", "-std=c++17", "-static", "-o", "main", "main.cpp"],
    runCmd: ["./main"],
    timeFactor: 1,
    memOverheadKb: 8 * 1024,
    compileTimeMs: 10_000,
    sandboxProcessLimit: 1,
  },
  c11: {
    key: "c11",
    name: "C11",
    srcName: "main.c",
    compileCmd: ["/usr/bin/gcc", "-O2", "-std=c11", "-static", "-o", "main", "main.c", "-lm"],
    runCmd: ["./main"],
    timeFactor: 1,
    memOverheadKb: 8 * 1024,
    compileTimeMs: 10_000,
    sandboxProcessLimit: 1,
  },
  python3: {
    key: "python3",
    name: "Python 3",
    srcName: "main.py",
    compileCmd: null,
    runCmd: ["/usr/bin/python3", "main.py"],
    timeFactor: 3,
    memOverheadKb: 24 * 1024,
    compileTimeMs: 0,
    sandboxProcessLimit: 1,
  },
  java17: {
    key: "java17",
    name: "Java 17",
    srcName: "Main.java",
    compileCmd: ["/usr/bin/javac", "Main.java"],
    runCmd: ["/usr/bin/java", "-Xmx{memLimitMb}m", "Main"],
    timeFactor: 3,
    memOverheadKb: 64 * 1024,
    compileTimeMs: 20_000,
    sandboxProcessLimit: 32, // JVM spawns GC/JIT/compiler threads even for trivial programs
  },
};

export function getLanguage(key: string): LanguageConfig {
  const lang = LANGUAGES[key];
  if (!lang) throw new Error(`Unknown language key: ${key}`);
  return lang;
}
