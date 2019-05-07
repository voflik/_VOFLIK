# ==============================================================================================
#
# Organisation   :           Swisscom AG
# AUTHOR                    :           Swen Hiu
# DATE                         :           19.06.2017
# UPDATE                      G.Klifov 28.06.2018
# COMMENT                  :           Get CSV import empty Line --> Export File to sharefolder
#
# History                       :           New Version
#         
# Return
# [Success] create file on Sharefolder: $($outputfile)
# [Error] Cannot connect to Sharefolder: $($outputfile)
# ==============================================================================================
 
 
PARAM
(
            [parameter(Mandatory=$true)]
            [String]$Inputname,
            [parameter(Mandatory=$true)]
            [String]$Outputname,
            [parameter(Mandatory=$true)]
            [String]$Locationname
)
 
# Variables
 
#$Test = 1  #With doublequote
$Test = 2  #Without doublequote
 
#$Inputname = "slas_export_for_sam.csv"
#$Outputname = "SLA_WithoutDoublequote.csv"
#$Locationname = "c:\Temp"
$Sharename = "\\SG005302\transft\conga\billing"
 
# Start Script
 
$Inputfile = "$($Locationname)\$($Inputname)"
 
$date = get-date
 
$sharefolder = "$($Sharename)\$($date.Year)\$($date.Month)"
$outputfile = "$($sharefolder)\$($Outputname)"



 
try{
 
            $a = Import-Csv $Inputfile -Header "Equipment ID","SLA-Relevante DLZ-Paketierung","Buchungstext","Leistung erbracht am","Interne ID","Typ","Target_AT","Target_%","In Time","Kundenbezeichnung","Zeit ODP","Zeit ODP in Abklärung","Total ODP inkl in Abklärung","Zeit Approval II","Zeit Approval III","Zeit Approval II OnHold","Total Zeit Approval","Total Zeit Approval inkl OnHold","Zeit in Paketierung","Zeit in Deployment","Zeit Test Staging","Zeit in QS","Total Zeit AIS","Zeit OnHold Paketierung","Zeit OnHold Deployment","Zeit OnHold QS","Total OnHold AIS","Total Zeit AIS inkl OnHold","Zeit Testing","Zeit OnHold Testing","Total Testing inkl OnHold","Zeit LMG Export","Zeit Integration Staging","Zeit Integration Testing","Zeit Integration Testing OnHold" -Encoding Default | select -skip 1
 
 
            if (test-path $sharefolder){}else{$Create = New-Item -ItemType directory -Path $sharefolder}
 
            if ($Test -eq 1){
                                               # Without Replace ""
                                               $a | Export-Csv $outputfile -NoTypeInformation -Delimiter ";" -Encoding:UTF8
                                      
            }else{
                                               # Replace ""
                                               $a | ConvertTo-Csv -NoTypeInformation -Delimiter ";" | % {$_.Replace('"','')} | out-file $outputfile -Encoding:UTF8
 
            }
            Write-output "[Success] create file on Sharefolder: $($outputfile)"
}catch{Write-output "[Error] Cannot connect to Sharefolder: $($outputfile)"}