Param()
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ProjectRoot = Resolve-Path "$ScriptDir\.."

Write-Host "Project root: $ProjectRoot"

Write-Host "1) Starting Docker services (Redpanda + console)..."
docker-compose -f "$ProjectRoot\docker-compose.yml" up -d

Start-Sleep -Seconds 5

function Run-NodeService($svcPath) {
    if (Test-Path $svcPath) {
        Write-Host "-> Found service at $svcPath"
        Push-Location $svcPath
        if (Test-Path package.json) {
            npm install --silent
            $pkg = Get-Content package.json -Raw
            if ($pkg -match '"dev"\s*:') {
                Start-Process -NoNewWindow -FilePath npm -ArgumentList 'run','dev'
            } elseif ($pkg -match '"start"\s*:') {
                Start-Process -NoNewWindow -FilePath npm -ArgumentList 'start'
            } elseif (Test-Path dist\index.js) {
                Start-Process -NoNewWindow -FilePath node -ArgumentList 'dist\index.js'
            } elseif (Test-Path index.js) {
                Start-Process -NoNewWindow -FilePath node -ArgumentList 'index.js'
            }
        } elseif (Test-Path Cargo.toml) {
            Write-Host "Note: rsi_processor appears to be Rust. Run: cd $svcPath; cargo run"
        }
        Pop-Location
    }
}

Run-NodeService "$ProjectRoot\ingestion"
Run-NodeService "$ProjectRoot\rsi_processor"
Run-NodeService "$ProjectRoot\frontend-dashboard"

Write-Host "Done. To stream docker logs: docker-compose -f `"$ProjectRoot\docker-compose.yml`" logs -f"
