# troubleshoot-gemini-curl.ps1
$API_KEY = $env:GEMINI_API_KEY
if (-not $API_KEY) {
    Write-Host "GEMINI_API_KEY environment variable is not set." -ForegroundColor Yellow
    exit 1
}

$MODEL = "gemini-flash-latest"
$URL = "https://generativelanguage.googleapis.com/v1beta/models/$($MODEL):generateContent"

$headers = @{
    "x-goog-api-key" = $API_KEY
    "Content-Type"   = "application/json"
}

$bodyObj = @{
    contents = @(
        @{
            parts = @(
                @{
                    text = "Explain how AI works in 3 concise sentences."
                }
            )
        }
    )
}
$bodyJson = $bodyObj | ConvertTo-Json -Depth 10

Write-Host "--- Verification Start ---"
Write-Host "Endpoint: $URL"
Write-Host "Method: POST"

try {
    $response = Invoke-RestMethod -Uri $URL -Method Post -Headers $headers -Body $bodyJson
    Write-Host "Success!" -ForegroundColor Green
    Write-Host ($response.candidates[0].content.parts[0].text)
} catch {
    Write-Host "Failed with status code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error Details: $errorBody" -ForegroundColor Yellow
    }
}
