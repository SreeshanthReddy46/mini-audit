# Mini Audit - One-click Local Startup Script (Windows PowerShell)

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "       MINI AUDIT DOCUMENT REVIEW SYSTEM - STARTUP          " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# 1. Start Backend
Write-Host "`n[1/2] Starting FastAPI Backend on http://localhost:8000..." -ForegroundColor Yellow
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd backend; .\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000"

# 2. Start Frontend
Write-Host "[2/2] Starting Next.js Frontend on http://localhost:3000..." -ForegroundColor Yellow
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "`nSystem started successfully!" -ForegroundColor Green
Write-Host "Backend API:    http://localhost:8000/docs" -ForegroundColor White
Write-Host "Frontend App:   http://localhost:3000" -ForegroundColor White
Write-Host "`nDemo Credentials:" -ForegroundColor Cyan
Write-Host "  Firm A (Staff):    rohit@abc.com  / password123"
Write-Host "  Firm A (Reviewer): aman@abc.com   / password123"
Write-Host "  Firm B (Reviewer): priya@xyz.com  / password123 (Tenant Isolation)"
Write-Host "============================================================" -ForegroundColor Cyan
