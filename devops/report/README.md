# DevOps lab report

[Open the final 15-page PDF](H5X_DevOps_Project_Report_Md_Faisal_Tabrez.pdf)

The report follows the supplied MGIT reference's letter-size page format,
Arial/Calibri typography, college logo, formal cover and unsigned certification
layout. Declaration and acknowledgement share a page so all required DevOps
sections and thirteen screenshots fit within fifteen pages.

Details used:

- Student: Md. Faisal Tabrez
- Roll number: 23261A0535
- Guide: K. Rajitha, Associate Professor
- Department: Computer Science and Engineering
- Institution: Mahatma Gandhi Institute of Technology

Signature lines remain blank for the student and faculty. No signature has
been reproduced. The report does not assign an unprovided name to the Head
of Department.

The PDF uses implementation revision `5c4d3af`, Jenkins build 2 and GitHub
Actions run 42673103294 attempt 2. Original screenshots, complete command logs,
JUnit reports and manifests are stored under [../evidence](../evidence/).

## Rebuild the report

`build_report.py` generates the PDF from the saved screenshots without
rerunning or fabricating implementation results. It requires Python,
ReportLab, Pillow, and the Arial, Calibri Bold and Consolas TrueType fonts
normally installed on Windows. Set `H5X_REPORT_FONTS` to a compatible font
directory if the fonts are stored elsewhere.

```sh
python -m pip install reportlab pillow
python devops/report/build_report.py
```

The generator enforces fifteen pages and checks each page's content height.
The delivered PDF was rendered and all fifteen pages were visually checked.
The supplied college logo is retained as a report template asset.
