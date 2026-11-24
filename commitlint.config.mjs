export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "header-max-length": [2, "always", 100],
    "subject-case": [0],
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "refactor",
        "perf",
        "test",
        "docs",
        "build",
        "ci",
        "chore",
        "revert",
        "builddevios",
        "builddevandroid",
        "buildprodios",
        "buildprodandroid",
      ],
    ],
  },
};
