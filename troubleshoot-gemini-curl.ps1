# Gemini API Troubleshooting & Debugging Tool
# Requires PowerShell 5.1 or newer

param(
    [Parameter(Mandatory=$false)]
    [string]$ApiKey = $env:GOOGLE_API_KEY,

    [Parameter(Mandatory=$false)]
    [string]$Model = "gemini-2.0-flash",

    [Parameter(Mandatory=$false)]
    [switch]$Verbose,

    [Parameter(Mandatory=$false)]
    [switch]$TestConnection,

    [Parameter(Mandatory=$false)]
    [switch]$GenerateContent,

    [Parameter(Mandatory=$false)]
    [string]$Prompt = "Hello, how are you?"
)

$ErrorActionPreference = "Stop"

# --- Helper Functions ---
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
    Write-Host "[$timestamp] [TroubleshootGemini] [$Level] $Message"
}

function Test-ApiKey {
    param([string]$Key)
    if (-not $Key) {
        Write-Log "API Key not provided. Use -ApiKey or set GOOGLE_API_KEY environment variable." "ERROR"
        return $false
    }
    if ($Key.Length -lt 20) {
        Write-Log "API Key seems too short. Please check your key." "WARN"
    }
    Write-Log "API Key present: $($Key.Substring(0, [Math]::Min(10, $Key.Length)))..." "INFO"
    return $true
}

function Test-InternetConnection {
    try {
        $testUrl = "https://generativelanguage.googleapis.com"
        Write-Log "Testing internet connectivity to $testUrl" "INFO"
        $response = Invoke-WebRequest -Uri $testUrl -UseBasicParsing -TimeoutSec 10 -Method Head -ErrorAction Stop
        Write-Log "Successfully connected to Google Generative Language API" "INFO"
        return $true
    } catch {
        Write-Log "Connection failed: $_" "ERROR"
        return $false
    }
}

function Invoke-GeminiApi {
    param(
        [string]$Key,
        [string]$ModelName,
        [string]$PromptText,
        [switch]$Verbose
    )

    $url = "https://generativelanguage.googleapis.com/v1beta/models/$ModelName`:generateContent?key=$Key"
    $body = @{
        contents = @(
            @{
                parts = @(@{ text = $PromptText })
            }
        )
    } | ConvertTo-Json -Depth 10

    Write-Log "Calling Gemini API..." "INFO"
    Write-Log "URL: $url" "DEBUG"
    Write-Log "Body:`n$body" "DEBUG"

    try {
        $response = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/json" -TimeoutSec 30
        Write-Log "API call successful!" "INFO"
        if ($Verbose) {
            Write-Log "Full Response:`n$($response | ConvertTo-Json -Depth 20)" "DEBUG"
        }
        return $response
    } catch {
        Write-Log "API call failed!" "ERROR"
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorBody = $_.ErrorDetails.Message
        Write-Log "Status Code: $statusCode" "ERROR"
        Write-Log "Error Body: $errorBody" "ERROR"
        return $null
    }
}

# --- Main Execution ---
Write-Log "========================================" "INFO"
Write-Log "  Gemini API Troubleshooting Tool" "INFO"
Write-Log "========================================" "INFO"

# Check API Key
if (-not (Test-ApiKey -Key $ApiKey)) {
    exit 1
}

# Connection Test
if ($TestConnection) {
    if (-not (Test-InternetConnection)) {
        exit 1
    }
}

# Generate Content Test
if ($GenerateContent) {
    Write-Log "Testing content generation with prompt: '$Prompt'" "INFO"
    $response = Invoke-GeminiApi -Key $ApiKey -ModelName $Model -PromptText $Prompt -Verbose:$Verbose

    if ($response) {
        Write-Log "`n=== Generated Content ===" "INFO"
        $text = $response.candidates[0].content.parts[0].text
        Write-Host $text
        Write-Host ""
    }
}

# If no specific test flags, run all tests
if (-not $TestConnection -and -not $GenerateContent) {
    Write-Log "Running complete troubleshooting suite" "INFO"

    # 1. Connection
    Test-InternetConnection | Out-Null

    # 2. API Call
    Write-Log ""
    $response = Invoke-GeminiApi -Key $ApiKey -ModelName $Model -PromptText "Hello, test!" -Verbose:$Verbose

    if ($response) {
        Write-Log "`n✅ All tests passed!" "INFO"
    } else {
        Write-Log "`n❌ Some tests failed!" "ERROR"
        exit 1
    }
}

Write-Log "Done." "INFO"
