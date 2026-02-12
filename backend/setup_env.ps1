# setup_env.ps1
# Script to synchronize environment variables from backend root to services

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$BackendRoot = $ScriptDir
$SourceEnv = "$BackendRoot\.env"

Write-Host "Reading configuration from: $SourceEnv"

if (-not (Test-Path $SourceEnv)) {
    Write-Error "Error: $SourceEnv not found!"
    exit 1
}

# Read variables that we want to sync
$EnvContent = Get-Content $SourceEnv
$Variables = @{}

foreach ($Line in $EnvContent) {
    if ($Line -match "^\s*([^#=]+)=(.*)$") {
        $Key = $Matches[1].Trim()
        $Value = $Matches[2].Trim()
        $Variables[$Key] = $Value
    }
}

# Define target directories
$Targets = @(
    "$BackendRoot\docker",
    "$BackendRoot\services\auth-service",
    "$BackendRoot\services\layout-service",
    "$BackendRoot\services\api-gateway"
)

# Key mappings (Source Key -> Target Key, or $null for same name)
$Mappings = @{
    "MONGODB_CONNECTION_STRING" = "MONGODB_URI";   # Authenticated/Atlas URI
    "JWT_SECRET_KEY" = $null;
    "PORT" = $null;
    "NODE_ENV" = $null;
    "FRONTEND_URL" = $null;
    "PAYOS_CLIENT_ID" = $null;
    "PAYOS_API_KEY" = $null;
    "PAYOS_CHECKSUM_KEY" = $null;
    "CLOUDINARY_CLOUD_NAME" = $null;
    "CLOUDINARY_API_KEY" = $null;
    "CLOUDINARY_API_SECRET" = $null
}

foreach ($TargetDir in $Targets) {
    $TargetFile = "$TargetDir\.env"
    Write-Host "Updating: $TargetFile"
    
    # Start with existing content or empty if typical overwrite is desired.
    # For this script, we'll create a fresh file with synced vars + specific overrides.
    
    $NewContent = @("# Auto-generated from backend/.env")
    
    # Specific port overrides based on service name (convention)
    if ($TargetDir -match "auth-service") { $Variables["PORT"] = "4001" }
    if ($TargetDir -match "layout-service") { $Variables["PORT"] = "4002" }
    if ($TargetDir -match "api-gateway") { $Variables["PORT"] = "4000" }
    
    # Docker .env needs specific names for compose interpolation
    if ($TargetDir -match "docker") {
         # Map MONGODB_CONNECTION_STRING to MONGODB_ATLAS_URI for docker-compose
         if ($Variables.ContainsKey("MONGODB_CONNECTION_STRING")) {
             $NewContent += "MONGODB_ATLAS_URI=$($Variables['MONGODB_CONNECTION_STRING'])"
         }
         if ($Variables.ContainsKey("JWT_SECRET_KEY")) {
             $NewContent += "JWT_SECRET_KEY=$($Variables['JWT_SECRET_KEY'])"
         }
    } else {
        # Regular services
        foreach ($Key in $Mappings.Keys) {
            $SourceKey = $Key
            $TargetKey = if ($Mappings[$Key]) { $Mappings[$Key] } else { $Key }
            
            if ($Variables.ContainsKey($SourceKey)) {
                $NewContent += "$TargetKey=$($Variables[$SourceKey])"
            }
        }
    }

    $NewContent | Set-Content $TargetFile -Encoding utf8
}

Write-Host "Environment setup complete!"
Write-Host "You can now run 'docker compose up -d' in backend/docker"
