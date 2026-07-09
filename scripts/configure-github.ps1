# Configure GitHub Repository Rulesets for DealFlow.AI
# Enforces strict branch protection on main, and locks all other branches.

$Code = @"
using System;
using System.Runtime.InteropServices;

public class CredentialManager {
    [DllImport("advapi32.dll", EntryPoint = "CredReadW", CharSet = CharSet.Unicode, SetLastError = true)]
    public static extern bool CredRead(string target, int type, int reserved, out IntPtr credentialPtr);

    [DllImport("advapi32.dll", EntryPoint = "CredFree", SetLastError = true)]
    public static extern void CredFree(IntPtr credentialPtr);

    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    public struct CREDENTIAL {
        public int Flags;
        public int Type;
        public string TargetName;
        public string Comment;
        public System.Runtime.InteropServices.ComTypes.FILETIME LastWritten;
        public int CredentialBlobSize;
        public IntPtr CredentialBlob;
        public int Persist;
        public int AttributeCount;
        public IntPtr Attributes;
        public string TargetAlias;
        public string UserName;
    }

    public static byte[] GetCredentialBlob(string target, out string userName) {
        IntPtr credPtr;
        userName = null;
        if (CredRead(target, 1, 0, out credPtr)) {
            CREDENTIAL cred = (CREDENTIAL)Marshal.PtrToStructure(credPtr, typeof(CREDENTIAL));
            userName = cred.UserName;
            byte[] blob = new byte[cred.CredentialBlobSize];
            Marshal.Copy(cred.CredentialBlob, blob, 0, cred.CredentialBlobSize);
            CredFree(credPtr);
            return blob;
        }
        return null;
    }
}
"@

Add-Type -TypeDefinition $Code -ErrorAction SilentlyContinue
$userName = ""
$blob = [CredentialManager]::GetCredentialBlob("git:https://github.com", [ref]$userName)
if (-not $blob) {
    Write-Error "Could not retrieve GitHub credentials from Windows Credential Manager."
    exit 1
}
$token = [System.Text.Encoding]::Unicode.GetString($blob)

$headers = @{
    "Authorization" = "token $token"
    "Accept"        = "application/vnd.github+json"
    "X-GitHub-Api-Version" = "2022-11-28"
    "User-Agent"    = "PowerShell-Agent"
}

$repoUrl = "https://api.github.com/repos/teambproject864-ai/dealsflowai"

# 1. Clean up existing rulesets (if any)
Write-Host "Fetching existing rulesets..."
try {
    $rulesets = Invoke-RestMethod -Uri "$repoUrl/rulesets" -Headers $headers -Method Get
    foreach ($r in $rulesets) {
        if ($r.name -eq "Protect Main Branch" -or $r.name -eq "Lock Non-Main Branches") {
            Write-Host "Deleting existing ruleset '$($r.name)' (ID: $($r.id))..."
            Invoke-RestMethod -Uri "$repoUrl/rulesets/$($r.id)" -Headers $headers -Method Delete
        }
    }
} catch {
    Write-Warning "Could not query or clear existing rulesets: $_"
}

# 2. Define the Main branch protection ruleset payload
$protectMainPayload = @{
    "name" = "Protect Main Branch"
    "target" = "branch"
    "enforcement" = "active"
    "conditions" = @{
        "ref_name" = @{
            "include" = @("refs/heads/main")
            "exclude" = @()
        }
    }
    "rules" = @(
        @{
            "type" = "pull_request"
            "parameters" = @{
                "required_approving_review_count" = 1
                "dismiss_stale_reviews_on_push" = $true
                "require_code_owner_review" = $false
                "require_last_push_approval" = $false
                "required_review_thread_resolution" = $true
            }
        },
        @{
            "type" = "non_fast_forward"
        },
        @{
            "type" = "deletion"
        },
        @{
            "type" = "required_status_checks"
            "parameters" = @{
                "strict_required_status_checks_policy" = $true
                "do_not_enforce_on_create" = $false
                "required_status_checks" = @(
                    @{
                        "context" = "Build and Test"
                        "integration_id" = 15368
                    }
                )
            }
        }
    )
}

# 3. Define the Non-Main branches lock ruleset payload
$lockNonMainPayload = @{
    "name" = "Lock Non-Main Branches"
    "target" = "branch"
    "enforcement" = "active"
    "conditions" = @{
        "ref_name" = @{
            "include" = @("~ALL")
            "exclude" = @("refs/heads/main")
        }
    }
    "rules" = @(
        @{
            "type" = "update"
        },
        @{
            "type" = "creation"
        },
        @{
            "type" = "deletion"
        }
    )
}

# 4. Post the Rulesets to GitHub
Write-Host "Creating Ruleset: Protect Main Branch..."
$jsonMain = $protectMainPayload | ConvertTo-Json -Depth 100
try {
    $resMain = Invoke-RestMethod -Uri "$repoUrl/rulesets" -Headers $headers -Method Post -Body $jsonMain -ContentType "application/json"
    Write-Host "Successfully created ruleset '$($resMain.name)' (ID: $($resMain.id))"
} catch {
    Write-Error "Failed to create Protect Main Branch ruleset: $_"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Error "Response details: $($reader.ReadToEnd())"
    }
}

Write-Host "Creating Ruleset: Lock Non-Main Branches..."
$jsonNonMain = $lockNonMainPayload | ConvertTo-Json -Depth 100
try {
    $resNonMain = Invoke-RestMethod -Uri "$repoUrl/rulesets" -Headers $headers -Method Post -Body $jsonNonMain -ContentType "application/json"
    Write-Host "Successfully created ruleset '$($resNonMain.name)' (ID: $($resNonMain.id))"
} catch {
    Write-Error "Failed to create Lock Non-Main Branches ruleset: $_"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Error "Response details: $($reader.ReadToEnd())"
    }
}
