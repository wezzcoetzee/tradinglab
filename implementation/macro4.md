Sub Macro4()
'
' Macro4 Macro
'

'
    Range("B5").Select
    Selection.End(xlDown).Select
    Range("C204:D204").Select
    Range(Selection, Selection.End(xlUp)).Select
    Range("C5:D204").Select
    Range("C204").Activate
    Selection.ClearContents
    Range("N8:N10").Select
    Selection.ClearContents
    Range("N10").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "=R[-1]C"
    Range("N9").Select
    ActiveCell.FormulaR1C1 = "1"
    Range("N10").Select
    ActiveWindow.SmallScroll Down:=-15
    Range("R12:S12").Select
    Selection.Copy
    Range("C5").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "2"
    Range("R12:S12").Select
    Selection.Copy
    Range("C6").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "3"
    Range("R12:S12").Select
    Selection.Copy
    Range("C7").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "4"
    Range("R12:S12").Select
    Selection.Copy
    Range("C8").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "5"
    Range("R12:S12").Select
    Selection.Copy
    Range("C9").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "6"
    Range("R12:S12").Select
    Selection.Copy
    Range("C10").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "7"
    Range("R12:S12").Select
    Selection.Copy
    Range("C11").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "8"
    Range("R12:S12").Select
    Selection.Copy
    Range("C12").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "9"
    Range("R12:S12").Select
    Selection.Copy
    Range("C13").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "sa"
    Range("R12:S12").Select
    Selection.Copy
    Range("C13").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "10"
    Range("R12:S12").Select
    Selection.Copy
    Range("C14").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "11"
    Range("R12:S12").Select
    Selection.Copy
    Range("C15").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "12"
    Range("R12:S12").Select
    Selection.Copy
    Range("C16").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "13"
    Range("R12:S12").Select
    Selection.Copy
    Range("C17").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "14"
    Range("R12:S12").Select
    Selection.Copy
    Range("C18").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "15"
    Range("R12:S12").Select
    Selection.Copy
    Range("C19").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "16"
    Range("R12:S12").Select
    Selection.Copy
    Range("C20").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "17"
    Range("R12:S12").Select
    Selection.Copy
    Range("C21").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "18"
    Range("R12:S12").Select
    Selection.Copy
    Range("C22").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "19"
    Range("R12:S12").Select
    Selection.Copy
    Range("C23").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "20"
    Range("R12:S12").Select
    Selection.Copy
    Range("C24").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "21"
    Range("R12:S12").Select
    Selection.Copy
    Range("C25").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "22"
    Range("R12:S12").Select
    Selection.Copy
    Range("C26").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "23"
    Range("R12:S12").Select
    Selection.Copy
    Range("C27").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "24"
    Range("R12:S12").Select
    Selection.Copy
    Range("C28").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "25"
    Range("R12:S12").Select
    Selection.Copy
    Range("C29").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "26"
    Range("R12:S12").Select
    Selection.Copy
    ActiveWindow.SmallScroll Down:=-139
    Range("C30").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "27"
    Range("R12:S12").Select
    Selection.Copy
    Range("C31").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "28"
    Range("R12:S12").Select
    Selection.Copy
    Range("C32").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "29"
    Range("R12:S12").Select
    Selection.Copy
    Range("C33").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "30"
    Range("R12:S12").Select
    Selection.Copy
    Range("C34").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "31"
    Range("R12:S12").Select
    Selection.Copy
    Range("C35").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "32"
    Range("R12:S12").Select
    Selection.Copy
    Range("C36").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "33"
    Range("R12:S12").Select
    Selection.Copy
    Range("C37").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "34"
    Range("R12:S12").Select
    Selection.Copy
    Range("C38").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "35"
    Range("R12:S12").Select
    Selection.Copy
    Range("C39").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "36"
    Range("R12:S12").Select
    Selection.Copy
    Range("C40").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "37"
    Range("R12:S12").Select
    Selection.Copy
    Range("C41").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "38"
    Range("R12:S12").Select
    Selection.Copy
    Range("C42").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "39"
    Range("R12:S12").Select
    Selection.Copy
    Range("C43").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    ActiveWindow.SmallScroll Down:=12
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "40"
    Range("R12:S12").Select
    Selection.Copy
    Range("C44").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "41"
    Range("R12:S12").Select
    Selection.Copy
    Range("C45").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "42"
    Range("R12:S12").Select
    Selection.Copy
    Range("C46").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "43"
    Range("R12:S12").Select
    Selection.Copy
    Range("C47").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "44"
    Range("R12:S12").Select
    Selection.Copy
    Range("C48").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "45"
    Range("R12:S12").Select
    Selection.Copy
    Range("C49").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "46"
    Range("R12:S12").Select
    Selection.Copy
    Range("C50").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "47"
    Range("R12:S12").Select
    Selection.Copy
    Range("C51").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "48"
    Range("R12:S12").Select
    Selection.Copy
    Range("C52").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "49"
    Range("R12:S12").Select
    Selection.Copy
    Range("C53").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "50"
    Range("R12:S12").Select
    Selection.Copy
    Range("C54").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "51"
    Range("R12:S12").Select
    Selection.Copy
    Range("C55").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "52"
    Range("R12:S12").Select
    Selection.Copy
    Range("C56").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "53"
    Range("R12:S12").Select
    Selection.Copy
    Range("C57").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "54"
    Range("R12:S12").Select
    Selection.Copy
    Range("C58").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "55"
    Range("R12:S12").Select
    Selection.Copy
    Range("C59").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    ActiveWindow.SmallScroll Down:=15
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "56"
    Range("R12:S12").Select
    Selection.Copy
    Range("C60").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "57"
    Range("R12:S12").Select
    Selection.Copy
    Range("C61").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "58"
    Range("R12:S12").Select
    Selection.Copy
    Range("C62").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "59"
    Range("R12:S12").Select
    Selection.Copy
    Range("C63").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "60"
    Range("R12:S12").Select
    Selection.Copy
    Range("C64").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "61"
    Range("R12:S12").Select
    Selection.Copy
    Range("C65").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "62"
    Range("R12:S12").Select
    Selection.Copy
    Range("C66").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "63"
    Range("R12:S12").Select
    Selection.Copy
    Range("C67").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "64"
    Range("R12:S12").Select
    Selection.Copy
    Range("C68").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "65"
    Range("R12:S12").Select
    Selection.Copy
    Range("C69").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "66"
    Range("R12:S12").Select
    Selection.Copy
    Range("C70").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "67"
    Range("R12:S12").Select
    Selection.Copy
    Range("C71").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "68"
    Range("R12:S12").Select
    Selection.Copy
    Range("C72").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "69"
    Range("R12:S12").Select
    Selection.Copy
    Range("C73").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    ActiveWindow.SmallScroll Down:=12
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "70"
    Range("R12:S12").Select
    Selection.Copy
    Range("C74").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "71"
    Range("R12:S12").Select
    Selection.Copy
    Range("C75").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "72"
    Range("R12:S12").Select
    Selection.Copy
    Range("C76").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "73"
    Range("R12:S12").Select
    Selection.Copy
    Range("C77").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "74"
    Range("R12:S12").Select
    Selection.Copy
    Range("C78").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "75"
    Range("R12:S12").Select
    Selection.Copy
    Range("C79").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "76"
    Range("R12:S12").Select
    Selection.Copy
    Range("C80").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "77"
    Range("R12:S12").Select
    Selection.Copy
    ActiveWindow.SmallScroll Down:=6
    Range("C81").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "78"
    Range("R12:S12").Select
    Selection.Copy
    Range("C82").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "79"
    Range("R12:S12").Select
    Selection.Copy
    Range("C83").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "80"
    Range("R12:S12").Select
    Selection.Copy
    ActiveWindow.SmallScroll Down:=6
    Range("C84").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "81"
    Range("R12:S12").Select
    Selection.Copy
    Range("C85").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "82"
    Range("R12:S12").Select
    Selection.Copy
    Range("C86").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "83"
    Range("R12:S12").Select
    Selection.Copy
    Range("C87").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "84"
    Range("R12:S12").Select
    Selection.Copy
    Range("C88").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "85"
    Range("R12:S12").Select
    Selection.Copy
    Range("C89").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    ActiveWindow.SmallScroll Down:=3
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "86"
    Range("R12:S12").Select
    Selection.Copy
    Range("C90").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "87"
    Range("R12:S12").Select
    Selection.Copy
    Range("C91").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "88"
    Range("R12:S12").Select
    Selection.Copy
    Range("C92").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "89"
    Range("R12:S12").Select
    Selection.Copy
    Range("C93").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "90"
    Range("R12:S12").Select
    Selection.Copy
    Range("C94").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    ActiveWindow.SmallScroll Down:=6
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "91"
    Range("R12:S12").Select
    Selection.Copy
    Range("C95").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "92"
    Range("R12:S12").Select
    Selection.Copy
    Range("C96").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "93"
    Range("R12:S12").Select
    Selection.Copy
    Range("C97").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "94"
    Range("R12:S12").Select
    Selection.Copy
    Range("C98").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    ActiveWindow.SmallScroll Down:=6
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "95"
    Range("R12:S12").Select
    Selection.Copy
    Range("C99").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "96"
    Range("R12:S12").Select
    Selection.Copy
    Range("C100").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "97"
    Range("R12:S12").Select
    Selection.Copy
    Range("C101").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    ActiveWindow.SmallScroll Down:=3
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "98"
    Range("R12:S12").Select
    Selection.Copy
    Range("C102").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "99"
    Range("R12:S12").Select
    Selection.Copy
    Range("C103").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "100"
    Range("R12:S12").Select
    Selection.Copy
    Range("C104").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "101"
    Range("R12:S12").Select
    Selection.Copy
    Range("C105").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "102"
    Range("R12:S12").Select
    Selection.Copy
    Range("C106").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "103"
    Range("R12:S12").Select
    Selection.Copy
    Range("C107").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "104"
    Range("R12:S12").Select
    Selection.Copy
    Range("C108").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "105"
    Range("R12:S12").Select
    Selection.Copy
    Range("C109").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "106"
    Range("R12:S12").Select
    Selection.Copy
    Range("C110").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    ActiveWindow.SmallScroll Down:=9
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "107"
    Range("R12:S12").Select
    Selection.Copy
    Range("C111").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "108"
    Range("R12:S12").Select
    Selection.Copy
    Range("C112").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "109"
    Range("R12:S12").Select
    Selection.Copy
    Range("C113").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "110"
    Range("R12:S12").Select
    Selection.Copy
    Range("C114").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "111"
    Range("R12:S12").Select
    Selection.Copy
    Range("C115").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "112"
    Range("R12:S12").Select
    Selection.Copy
    Range("C116").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "113"
    Range("R12:S12").Select
    Selection.Copy
    Range("C117").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "114"
    Range("R12:S12").Select
    Selection.Copy
    Range("C118").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "115"
    Range("R12:S12").Select
    Selection.Copy
    Range("C119").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "116"
    Range("R12:S12").Select
    Selection.Copy
    ActiveWindow.SmallScroll Down:=6
    Range("C120").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "117"
    Range("R12:S12").Select
    Selection.Copy
    Range("C121").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "118"
    Range("R12:S12").Select
    Selection.Copy
    Range("C122").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "119"
    Range("R12:S12").Select
    Selection.Copy
    Range("C123").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "120"
    Range("R12:S12").Select
    Selection.Copy
    Range("C124").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "121"
    Range("R12:S12").Select
    Selection.Copy
    Range("C125").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    ActiveWindow.SmallScroll Down:=9
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "122"
    Range("R12:S12").Select
    Selection.Copy
    Range("C126").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "123"
    Range("R12:S12").Select
    Selection.Copy
    Range("C127").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "124"
    Range("R12:S12").Select
    Selection.Copy
    Range("C128").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "125"
    Range("R12:S12").Select
    Selection.Copy
    Range("C129").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "126"
    Range("R12:S12").Select
    Selection.Copy
    Range("C130").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "127"
    Range("R12:S12").Select
    Selection.Copy
    Range("C131").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "128"
    Range("R12:S12").Select
    Selection.Copy
    Range("C132").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "129"
    Range("R12:S12").Select
    Selection.Copy
    Range("C133").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "130"
    Range("R12:S12").Select
    Selection.Copy
    Range("C134").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    ActiveWindow.SmallScroll Down:=9
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "131"
    Range("R12:S12").Select
    Selection.Copy
    Range("C135").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "132"
    Range("R12:S12").Select
    Selection.Copy
    Range("C136").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "133"
    Range("R12:S12").Select
    Selection.Copy
    Range("C137").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "134"
    Range("R12:S12").Select
    Selection.Copy
    ActiveWindow.SmallScroll Down:=3
    Range("C138").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "135"
    Range("R12:S12").Select
    Selection.Copy
    Range("C139").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "136"
    Range("R12:S12").Select
    Selection.Copy
    Range("C140").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "137"
    Range("R12:S12").Select
    Selection.Copy
    Range("C141").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "138"
    Range("R12:S12").Select
    Selection.Copy
    ActiveWindow.SmallScroll Down:=3
    Range("C142").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "139"
    Range("R12:S12").Select
    Selection.Copy
    Range("C143").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "140"
    Range("R12:S12").Select
    Selection.Copy
    Range("C144").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "141"
    Range("R12:S12").Select
    Selection.Copy
    Range("C145").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "142"
    Range("R12:S12").Select
    Selection.Copy
    Range("C146").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "143"
    Range("R12:S12").Select
    Selection.Copy
    Range("C147").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "144"
    Range("R12:S12").Select
    Selection.Copy
    Range("C148").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "145"
    Range("R12:S12").Select
    Selection.Copy
    Range("C149").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    ActiveWindow.SmallScroll Down:=9
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "146"
    Range("R12:S12").Select
    Selection.Copy
    Range("C150").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "147"
    Range("R12:S12").Select
    Selection.Copy
    Range("C151").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "148"
    Range("R12:S12").Select
    Selection.Copy
    Range("C152").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "149"
    Range("R12:S12").Select
    Selection.Copy
    Range("C153").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "150"
    Range("R12:S12").Select
    Selection.Copy
    Range("C154").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "151"
    Range("R12:S12").Select
    Selection.Copy
    Range("C155").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    ActiveWindow.SmallScroll Down:=6
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "152"
    Range("R12:S12").Select
    Selection.Copy
    Range("C156").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "153"
    Range("R12:S12").Select
    Selection.Copy
    Range("C157").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "154"
    Range("R12:S12").Select
    Selection.Copy
    Range("C158").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "155"
    Range("R12:S12").Select
    Selection.Copy
    Range("C159").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    ActiveWindow.SmallScroll Down:=6
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "156"
    Range("R12:S12").Select
    Selection.Copy
    Range("C160").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "157"
    Range("R12:S12").Select
    Selection.Copy
    Range("C161").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "158"
    Range("R12:S12").Select
    Selection.Copy
    Range("C162").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "159"
    Range("R12:S12").Select
    Selection.Copy
    Range("C163").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "160"
    Range("R12:S12").Select
    Selection.Copy
    Range("C164").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "161"
    Range("R12:S12").Select
    Selection.Copy
    Range("C165").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "162"
    Range("R12:S12").Select
    Selection.Copy
    Range("C166").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "163"
    Range("R12:S12").Select
    Selection.Copy
    Range("C167").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "164"
    Range("R12:S12").Select
    Selection.Copy
    Range("C168").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    ActiveWindow.SmallScroll Down:=6
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "165"
    Range("R12:S12").Select
    Selection.Copy
    Range("C169").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "166"
    Range("R12:S12").Select
    Selection.Copy
    Range("C170").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    ActiveWindow.SmallScroll Down:=6
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "167"
    Range("R12:S12").Select
    Range("S12").Activate
    Selection.Copy
    Range("C171").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "168"
    Range("R12:S12").Select
    Selection.Copy
    Range("C172").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "169"
    Range("R12:S12").Select
    Selection.Copy
    Range("C173").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "170"
    Range("R12:S12").Select
    Selection.Copy
    Range("C174").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "171"
    Range("R12:S12").Select
    Selection.Copy
    Range("C175").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "172"
    Range("R12:S12").Select
    Selection.Copy
    Range("C176").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "173"
    Range("R12:S12").Select
    Selection.Copy
    Range("C177").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "174"
    Range("R12:S12").Select
    Selection.Copy
    Range("C178").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "175"
    Range("R12:S12").Select
    Selection.Copy
    Range("C179").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "176"
    Range("R12:S12").Select
    Selection.Copy
    Range("C180").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "177"
    Range("R12:S12").Select
    Selection.Copy
    Range("C181").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    ActiveWindow.SmallScroll Down:=9
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "178"
    Range("R12:S12").Select
    Selection.Copy
    Range("C182").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "179"
    Range("R12:S12").Select
    Selection.Copy
    Range("C183").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "180"
    Range("R12:S12").Select
    Selection.Copy
    Range("C184").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "181"
    Range("R12:S12").Select
    Selection.Copy
    Range("C185").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "182"
    Range("R12:S12").Select
    Selection.Copy
    Range("C186").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    ActiveWindow.SmallScroll Down:=3
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "183"
    Range("R12:S12").Select
    Selection.Copy
    Range("C187").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "184"
    Range("R12:S12").Select
    Selection.Copy
    Range("C188").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "185"
    Range("R12:S12").Select
    Selection.Copy
    Range("C189").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    ActiveWindow.SmallScroll Down:=3
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "186"
    Range("R12:S12").Select
    Selection.Copy
    Range("C190").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "187"
    Range("R12:S12").Select
    Selection.Copy
    Range("C191").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "188"
    Range("R12:S12").Select
    Selection.Copy
    Range("C192").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "189"
    Range("R12:S12").Select
    Selection.Copy
    Range("C193").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "190"
    Range("R12:S12").Select
    Selection.Copy
    Range("C194").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "191"
    Range("R12:S12").Select
    Selection.Copy
    Range("C195").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "192"
    Range("R12:S12").Select
    Selection.Copy
    Range("C196").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "193"
    Range("R12:S12").Select
    Selection.Copy
    Range("C197").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "194"
    Range("R12:S12").Select
    Selection.Copy
    Range("C198").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "195"
    Range("R12:S12").Select
    Selection.Copy
    Range("C199").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "196"
    Range("R12:S12").Select
    Selection.Copy
    Range("C200").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "197"
    Range("R12:S12").Select
    Selection.Copy
    Range("C201").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "198"
    Range("R12:S12").Select
    Selection.Copy
    Range("C202").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "199"
    Range("R12:S12").Select
    Selection.Copy
    Range("C203").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
    Range("N9").Select
    Application.CutCopyMode = False
    ActiveCell.FormulaR1C1 = "200"
    Range("R12:S12").Select
    Selection.Copy
    Range("C204").Select
    Selection.PasteSpecial Paste:=xlPasteValuesAndNumberFormats, Operation:= _
        xlNone, SkipBlanks:=False, Transpose:=False
End Sub
