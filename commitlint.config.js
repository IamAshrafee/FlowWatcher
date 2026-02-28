// @see https://commitlint.js.org/reference/configuration.html
export default {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'type-enum': [
            2,
            'always',
            [
                'feat',     // New feature
                'fix',      // Bug fix
                'docs',     // Documentation
                'style',    // Formatting, no code change
                'refactor', // Code restructuring, no feature change
                'perf',     // Performance improvement
                'test',     // Adding or updating tests
                'chore',    // Maintenance, tooling, deps
                'ci',       // CI/CD changes
                'build',    // Build system changes
                'revert',   // Revert a commit
            ],
        ],
        'subject-case': [0], // Allow any case in subject
    },
};
