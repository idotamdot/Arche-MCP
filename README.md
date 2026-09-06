# Arche-MCP


How to add it to your projects:


Set-Content -Path .gitignore -Value @"
node_modules/
.pnpm-store/
dist/
build/
*.tsbuildinfo
logs
*.log
.env
.env.local
.vscode/
.idea/
.DS_Store
Thumbs.db
"@


