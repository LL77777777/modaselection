param(
  [int]$Port = 8787
)

$root = (Get-Location).Path
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
$listener.Start()

function Get-MimeType([string]$Path) {
  switch ([System.IO.Path]::GetExtension($Path).ToLowerInvariant()) {
    ".html" { return "text/html; charset=utf-8" }
    ".css" { return "text/css; charset=utf-8" }
    ".js" { return "application/javascript; charset=utf-8" }
    ".json" { return "application/json; charset=utf-8" }
    ".xml" { return "application/xml; charset=utf-8" }
    ".txt" { return "text/plain; charset=utf-8" }
    ".png" { return "image/png" }
    ".jpg" { return "image/jpeg" }
    ".jpeg" { return "image/jpeg" }
    ".webp" { return "image/webp" }
    default { return "application/octet-stream" }
  }
}

function Send-Response($Stream, [int]$StatusCode, [string]$StatusText, [string]$ContentType, [byte[]]$Body) {
  $header = "HTTP/1.1 $StatusCode $StatusText`r`nContent-Type: $ContentType`r`nContent-Length: $($Body.Length)`r`nConnection: close`r`n`r`n"
  $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($header)
  $Stream.Write($headerBytes, 0, $headerBytes.Length)
  $Stream.Write($Body, 0, $Body.Length)
}

Write-Host "Moda Selection preview running at http://localhost:$Port/"
Write-Host "Press Ctrl+C to stop."

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()
    $stream = $client.GetStream()

    try {
      $buffer = New-Object byte[] 4096
      $read = $stream.Read($buffer, 0, $buffer.Length)
      $request = [System.Text.Encoding]::ASCII.GetString($buffer, 0, $read)
      $requestLine = ($request -split "`r`n")[0]
      $parts = $requestLine -split " "
      $urlPath = if ($parts.Length -gt 1) { $parts[1] } else { "/" }
      $pathOnly = [System.Uri]::UnescapeDataString(($urlPath -split "\?")[0])
      $relative = $pathOnly.TrimStart("/")

      if ([string]::IsNullOrWhiteSpace($relative)) {
        $relative = "index.html"
      }

      $filePath = Join-Path $root $relative
      $fullPath = [System.IO.Path]::GetFullPath($filePath)
      $rootFull = [System.IO.Path]::GetFullPath($root)

      if (-not $fullPath.StartsWith($rootFull, [System.StringComparison]::OrdinalIgnoreCase)) {
        $body = [System.Text.Encoding]::UTF8.GetBytes("Forbidden")
        Send-Response $stream 403 "Forbidden" "text/plain; charset=utf-8" $body
        continue
      }

      if (-not [System.IO.File]::Exists($fullPath) -and $relative -notmatch "/" -and $relative -notmatch "\.") {
        $fullPath = Join-Path $root "redirect.html"
      }

      if ([System.IO.File]::Exists($fullPath)) {
        $body = [System.IO.File]::ReadAllBytes($fullPath)
        Send-Response $stream 200 "OK" (Get-MimeType $fullPath) $body
      } else {
        $body = [System.Text.Encoding]::UTF8.GetBytes("Not found")
        Send-Response $stream 404 "Not Found" "text/plain; charset=utf-8" $body
      }
    } finally {
      $stream.Close()
      $client.Close()
    }
  }
} finally {
  $listener.Stop()
}
