# ==========================================
# Script: Seed Ramadhan Holiday to Production
# ==========================================
# This script will create the Ramadhan 1447 H holiday period
# in your production database via the API endpoint.

# ⚠️ IMPORTANT: Ganti URL ini dengan URL production Vercel Anda!
$PRODUCTION_URL = "https://jadwal-kajian-app.vercel.app"

# ==========================================

Write-Host "🌙 Seeding Ramadhan 1447 H Holiday Period to Production..." -ForegroundColor Cyan
Write-Host ""

# Holiday data
$holidayData = @{
    name        = "Ramadhan - Syawal 1447 H"
    start_date  = "2026-02-18"
    end_date    = "2026-04-04"
    description = "Libur kajian rutin selama Ramadhan hingga pertengahan Syawal 1447 H"
}

# Convert to JSON
$body = $holidayData | ConvertTo-Json

Write-Host "📊 Data yang akan di-insert:" -ForegroundColor Yellow
Write-Host "   Name: $($holidayData.name)"
Write-Host "   Start: $($holidayData.start_date) (1 Ramadhan 1447 H)"
Write-Host "   End: $($holidayData.end_date) (15 Syawal 1447 H)"
Write-Host ""

# API endpoint
$apiUrl = "$PRODUCTION_URL/api/holiday-periods"

Write-Host "🔗 Target URL: $apiUrl" -ForegroundColor Gray
Write-Host ""

try {
    # Make POST request
    Write-Host "⏳ Sending request..." -ForegroundColor Yellow
    
    $response = Invoke-WebRequest `
        -Uri $apiUrl `
        -Method POST `
        -Body $body `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    # Parse response
    $result = $response.Content | ConvertFrom-Json
    
    # Success
    Write-Host ""
    Write-Host "✅ SUCCESS! Holiday period created!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Cyan
    Write-Host ($response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10)
    Write-Host ""
    
    # Verify by getting all periods
    Write-Host "🔍 Verifying... Getting all holiday periods:" -ForegroundColor Yellow
    $verifyResponse = Invoke-WebRequest -Uri $apiUrl -Method GET
    $periods = ($verifyResponse.Content | ConvertFrom-Json).periods
    
    Write-Host ""
    Write-Host "📋 Total holiday periods in production: $($periods.Count)" -ForegroundColor Green
    foreach ($period in $periods) {
        Write-Host "   - $($period.name) ($($period.start_date) to $($period.end_date))" -ForegroundColor White
    }
    Write-Host ""
    Write-Host "🎉 Done! Kajian rutin akan skip tanggal Ramadhan - Syawal 1447 H" -ForegroundColor Green
    
}
catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    
    if ($statusCode -eq 400) {
        Write-Host ""
        Write-Host "⚠️  Bad Request (400)" -ForegroundColor Yellow
        Write-Host "   Kemungkinan holiday period sudah ada di database." -ForegroundColor Yellow
        Write-Host ""
        
        # Try to get existing periods
        try {
            $existingResponse = Invoke-WebRequest -Uri $apiUrl -Method GET
            $existingPeriods = ($existingResponse.Content | ConvertFrom-Json).periods
            
            Write-Host "📋 Holiday periods yang sudah ada:" -ForegroundColor Cyan
            foreach ($period in $existingPeriods) {
                Write-Host "   - $($period.name) ($($period.start_date) to $($period.end_date))" -ForegroundColor White
            }
        }
        catch {
            Write-Host "   Tidak bisa verify existing periods." -ForegroundColor Red
        }
        
    }
    elseif ($null -eq $statusCode) {
        Write-Host ""
        Write-Host "❌ Connection Error!" -ForegroundColor Red
        Write-Host "   Periksa apakah URL production sudah benar:" -ForegroundColor Yellow
        Write-Host "   $PRODUCTION_URL" -ForegroundColor White
        Write-Host ""
        Write-Host "   Atau cek apakah deployment Vercel sudah selesai." -ForegroundColor Yellow
        
    }
    else {
        Write-Host ""
        Write-Host "❌ Error! Status Code: $statusCode" -ForegroundColor Red
        Write-Host ""
        Write-Host "Error details:" -ForegroundColor Yellow
        Write-Host $_.Exception.Message
    }
    
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "✨ Script selesai!" -ForegroundColor Green
Write-Host ""
