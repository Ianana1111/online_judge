/** Per-language compile/run commands for the local (Vercel Sandbox) judge. Mirrors the four
 * languages the site actually offers (apps/web/components/SubmissionPanel.tsx's LANGUAGES) — add
 * here and there together if a language is ever added. */
export interface LanguageSpec {
  sourceFileName: string;
  compile: { cmd: string; args: string[] } | null;
  /** Run command; `{memKb}` is only meaningful for languages that size their own heap (Java) —
   * others rely purely on the shell-level `ulimit -v` wrapper in judge.ts. */
  runCmd: (opts: { memKb: number }) => { cmd: string; args: string[] };
  /** UVa and most judges give slower languages (chiefly JVM startup) extra wall-clock budget
   * rather than penalizing every submission with a blanket time limit sized for C++. */
  timeMultiplier: number;
  /** Whether the shell-level `ulimit -v` wrapper should apply. Off for Java: the JVM reserves a
   * large virtual address range on startup that has nothing to do with actual heap usage, so
   * ulimit -v would reject the JVM itself before the submitted code ever runs. Java's memory limit
   * is enforced via -Xmx instead (see runCmd above). */
  ulimitMemory: boolean;
}

export const LANGUAGES: Record<string, LanguageSpec> = {
  cpp17: {
    sourceFileName: "main.cpp",
    compile: { cmd: "g++", args: ["-O2", "-std=c++17", "-o", "main", "main.cpp"] },
    runCmd: () => ({ cmd: "./main", args: [] }),
    timeMultiplier: 1,
    ulimitMemory: true,
  },
  c11: {
    sourceFileName: "main.c",
    compile: { cmd: "gcc", args: ["-O2", "-std=c11", "-o", "main", "main.c"] },
    runCmd: () => ({ cmd: "./main", args: [] }),
    timeMultiplier: 1,
    ulimitMemory: true,
  },
  python3: {
    sourceFileName: "main.py",
    compile: null,
    runCmd: () => ({ cmd: "python3", args: ["main.py"] }),
    timeMultiplier: 3,
    ulimitMemory: true,
  },
  java17: {
    // Class name must be `Main` — matches the site's own default template
    // (apps/web/components/SubmissionPanel.tsx's STUB.java17).
    sourceFileName: "Main.java",
    compile: { cmd: "javac", args: ["Main.java"] },
    runCmd: ({ memKb }) => ({ cmd: "java", args: [`-Xmx${Math.max(16, Math.floor(memKb / 1024))}m`, "Main"] }),
    timeMultiplier: 3,
    ulimitMemory: false,
  },
};
