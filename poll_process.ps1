$videoId='cmlzifasc0003m03fz01hie5k'
try{
  Invoke-RestMethod -Uri 'http://localhost:5000/api/process' -Method Post -Body (ConvertTo-Json @{videoId=$videoId}) -ContentType 'application/json'
  Write-Output 'Triggered /api/process'
} catch { Write-Output "Trigger failed: $($_.Exception.Message)" }

for($i=0;$i -lt 24;$i++){
  try{
    $j=Invoke-RestMethod -Uri "http://localhost:5000/api/videos/$videoId" -UseBasicParsing
    Write-Output "[$i] status=$($j.status)"
    if($j.status -ne 'processing'){
      $j | ConvertTo-Json -Depth 5 > video_info_final.json
      Write-Output 'Saved video_info_final.json'
      exit 0
    }
  } catch { Write-Output "ERR:$($_.Exception.Message)" }
  Start-Sleep -Seconds 5
}
Write-Output 'TIMEOUT'
exit 0
