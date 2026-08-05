# Verifies that the Personal Website is embedded in Coaster and serves the REAL
# jonwhitmer.com site locally. Written BEFORE the coaster.yaml exists, so every
# assertion below must fail first for the right reason.
#
# Run:  powershell -NoProfile -ExecutionPolicy Bypass -File verify-personal-website.ps1

$ErrorActionPreference = 'Continue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$script:Pass = 0
$script:Fail = 0

function Assert($name, $condition, $detail) {
    if ($condition) {
        Write-Host "  PASS  $name" -ForegroundColor Green
        $script:Pass++
    } else {
        Write-Host "  FAIL  $name" -ForegroundColor Red
        Write-Host "        -> $detail" -ForegroundColor DarkYellow
        $script:Fail++
    }
}

$CoasterApi = 'http://127.0.0.1:4173'
$SiteUrl    = 'http://127.0.0.1:5173/'
$AppId      = 'personal-website'
$BaselineIds = @(
    'clerkwork','clipper','coaster','docket','email-platform','fillwise',
    'ig-cleaner','lectern','loadkeep','mylearning','plexus','plumbline',
    'rigwatch','spreadsapplication','stacklens','stepup','tradepredict','vesper'
)

Write-Host "`n=== 1. Coaster registers the app ===" -ForegroundColor Cyan

$apps = $null
try { $apps = Invoke-RestMethod "$CoasterApi/api/apps" -TimeoutSec 10 } catch { }
Assert 'Coaster backend on 4173 is reachable' ($null -ne $apps) `
    'GET /api/apps failed - Coaster is not running'

$ids = @($apps | Select-Object -ExpandProperty id -ErrorAction SilentlyContinue)
Assert "Coaster lists an app with id '$AppId'" ($ids -contains $AppId) `
    "app ids seen: $($ids -join ', ')"

$app = $apps | Where-Object { $_.id -eq $AppId } | Select-Object -First 1
Assert "App is named 'Personal Website'" ($app.name -eq 'Personal Website') `
    "got name: '$($app.name)'"

Write-Host "`n=== 2. Regression: no existing app was dropped ===" -ForegroundColor Cyan

$missing = @($BaselineIds | Where-Object { $ids -notcontains $_ })
Assert 'All 18 pre-existing Coaster apps still present' ($missing.Count -eq 0) `
    "missing: $($missing -join ', ')"

Write-Host "`n=== 3. The site actually serves on 5173 ===" -ForegroundColor Cyan

# Must send a BROWSER-shaped Accept header. Vite's dev server only falls back to
# index.html for requests that accept text/html; a bare GET gets 404. Powershell's
# Invoke-WebRequest does not send one, so it is not a valid stand-in for Jon's
# browser here. curl with an explicit Accept is.
$BrowserAccept = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
$html   = & curl.exe -s --http1.1 -H "Accept: $BrowserAccept" --max-time 20 $SiteUrl
$status = & curl.exe -s -o NUL -w '%{http_code}' --http1.1 -H "Accept: $BrowserAccept" --max-time 20 $SiteUrl

Assert 'A browser GET of http://127.0.0.1:5173/ returns HTTP 200' ($status -eq '200') `
    "got status: '$status' - nothing is serving the site on 5173"

Write-Host "`n=== 4. It is the REAL jonwhitmer.com site, not a placeholder ===" -ForegroundColor Cyan

Assert 'Page title is "Jon Whitmer"' ($html -match '<title>\s*Jon Whitmer\s*</title>') `
    'title tag did not match - this is a different site (e.g. "Vite + React + TS")'

Assert 'Favicon is /images/jdub.png' ($html -match '/images/jdub\.png') `
    'jdub.png favicon absent - wrong copy of the portfolio'

Assert 'og:title meta is "Jon Whitmer"' ($html -match 'og:title"\s+content="Jon Whitmer"') `
    'og:title missing - head does not match production'

Assert 'Mounts the React app from /src/main.jsx' ($html -match 'src/main\.jsx') `
    'entry script missing or is main.tsx (that is the abandoned TS rewrite)'

Write-Host "`n=== 5. Coaster's own health probe succeeds ===" -ForegroundColor Cyan

# Coaster probes with java.net.http, which sends NO Accept header. This is the
# exact regression that killed the first attempt: "/" answered 404 to Coaster
# while answering 200 to a browser, so Coaster killed a perfectly healthy site
# after its 90s startup deadline. These two assertions pin that behaviour down.
$bareRoot  = & curl.exe -s -o NUL -w '%{http_code}' --http1.1 -H 'Accept:' --max-time 10 'http://127.0.0.1:5173/'
$bareIndex = & curl.exe -s -o NUL -w '%{http_code}' --http1.1 -H 'Accept:' --max-time 10 'http://127.0.0.1:5173/index.html'

Assert 'Health URL /index.html answers 200 to a bare GET (no Accept header)' ($bareIndex -eq '200') `
    "got '$bareIndex' - Coaster's health check would fail and it would kill the app"

Assert 'Documented quirk still holds: bare GET of "/" is 404, which is why healthUrl is /index.html' ($bareRoot -eq '404') `
    "got '$bareRoot' - Vite changed its HTML-fallback behaviour; re-check the healthUrl comment in coaster.yaml"

$proc = $null
try { $proc = @(Invoke-RestMethod "$CoasterApi/api/processes" -TimeoutSec 10 | Where-Object { $_.app -eq $AppId })[0] } catch { }
Assert 'Coaster reports the service as running' ($proc.state -eq 'running') `
    "state: '$($proc.state)'"
Assert 'Coaster health check is green' ($proc.runs | Where-Object { $_.mode -eq 'start' } | Select-Object -First 1).health.ok `
    "last health result: $(($proc.runs | Where-Object { $_.mode -eq 'start' } | Select-Object -First 1).health.lastResult)"

Assert 'Exactly one launch profile for this app (no partial-running duplicate)' `
    ((@(Invoke-RestMethod "$CoasterApi/api/processes" -TimeoutSec 10 | Where-Object { $_.app -eq $AppId })).Count -eq 1) `
    'more than one profile would show the app as "Partially running"'

Write-Host "`n=== 6. Served by Coaster, not a stray terminal ===" -ForegroundColor Cyan

$owner = $null
try {
    $conn = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction Stop | Select-Object -First 1
    $owner = (Get-Process -Id $conn.OwningProcess -ErrorAction Stop)
} catch { }
Assert 'A process owns port 5173' ($null -ne $owner) `
    'no listener on 5173'
if ($owner) { Write-Host "        listener: $($owner.ProcessName) (pid $($owner.Id))" -ForegroundColor DarkGray }

Write-Host "`n----------------------------------------" -ForegroundColor Cyan
Write-Host " PASSED: $script:Pass   FAILED: $script:Fail" -ForegroundColor Cyan
Write-Host "----------------------------------------`n" -ForegroundColor Cyan
if ($script:Fail -gt 0) { exit 1 } else { exit 0 }
