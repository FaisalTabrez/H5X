"""Create the fifteen-page MGIT-format report from verified lab evidence."""
from pathlib import Path
from xml.sax.saxutils import escape
import json
import os

from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph, Table, TableStyle
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.lib import colors
from PIL import Image

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parents[1]
SHOTS = REPO / 'devops/evidence/screenshots'
OUT = ROOT / 'H5X_DevOps_Project_Report_Md_Faisal_Tabrez.pdf'
OUT.parent.mkdir(parents=True, exist_ok=True)
FONTS = Path(os.getenv('H5X_REPORT_FONTS', 'C:/Windows/Fonts'))
for name, filename in [('Arial','arial.ttf'), ('Arial-Bold','arialbd.ttf'),
                       ('Arial-Italic','ariali.ttf'), ('Calibri-Bold','calibrib.ttf'),
                       ('Mono','consola.ttf')]:
    pdfmetrics.registerFont(TTFont(name, str(FONTS / filename)))
pdfmetrics.registerFontFamily('Arial', normal='Arial', bold='Arial-Bold', italic='Arial-Italic', boldItalic='Arial-Bold')

W, H, M = 612, 792, 59
CW = W - 2*M
BASE = ParagraphStyle('body', fontName='Arial', fontSize=10, leading=13.6,
                      textColor=colors.black, spaceAfter=7, alignment=TA_JUSTIFY)
SMALL = ParagraphStyle('small', parent=BASE, fontSize=9, leading=11.7, alignment=TA_LEFT)
CAP = ParagraphStyle('caption', parent=SMALL, fontSize=8.5, leading=10.5, alignment=TA_CENTER)
CODE = ParagraphStyle('code', fontName='Mono', fontSize=8.4, leading=11, alignment=TA_LEFT)
TABLE = ParagraphStyle('table', parent=SMALL, fontSize=9.1, leading=12)
c = canvas.Canvas(str(OUT), pagesize=(W,H), pageCompression=1)
c.setTitle('DevOps Pipeline for the H5X Website')
c.setAuthor('Md. Faisal Tabrez - 23261A0535')
c.setSubject('DevOps Lab Project Report - K. Rajitha Associate Professor')
y = 0
page_number = 0
figure_number = 0
layouts = []
current_images = []

def text(txt, size=10, bold=False, center=False, top=None):
    global y
    if top is not None: y=top
    font='Arial-Bold' if bold else 'Arial'
    c.setFont(font, size)
    if center: c.drawCentredString(W/2, H-y-size, txt)
    else: c.drawString(M, H-y-size, txt)
    y += size*1.4

def para(txt, style=BASE, top=None, gap=7):
    global y
    if top is not None: y=top
    p=Paragraph(txt,style)
    _,h=p.wrap(CW,H)
    p.drawOn(c,M,H-y-h)
    y += h+gap

def heading(txt, front=False):
    global y
    size=22 if front else 15
    c.setFont('Calibri-Bold',size)
    if front: c.drawCentredString(W/2,H-y-size,txt)
    else: c.drawString(M,H-y-size,txt)
    y += size+15

def sub(txt):
    global y
    c.setFont('Arial-Bold',10.5)
    c.drawString(M,H-y-10.5,txt)
    y += 18

def gap(n=9):
    global y
    y += n

def table(rows,widths,header=True):
    global y
    cells=[]
    for i,row in enumerate(rows):
        cells.append([Paragraph(('<b>'+escape(str(v))+'</b>') if i==0 and header else escape(str(v)),TABLE) for v in row])
    t=Table(cells,colWidths=widths,hAlign='LEFT')
    style=[('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),7),
           ('RIGHTPADDING',(0,0),(-1,-1),7),('TOPPADDING',(0,0),(-1,-1),5),
           ('BOTTOMPADDING',(0,0),(-1,-1),5),
           ('LINEBELOW',(0,0),(-1,0),.5,colors.HexColor('#777777')),
           ('LINEBELOW',(0,-1),(-1,-1),.3,colors.HexColor('#b0b0b0'))]
    if header: style += [('BACKGROUND',(0,0),(-1,0),colors.HexColor('#ededed'))]
    t.setStyle(TableStyle(style))
    _,h=t.wrap(CW,H)
    t.drawOn(c,M,H-y-h)
    y += h+10

def code(txt):
    global y
    lines=txt.strip().splitlines()
    # Preserve indentation without relying on monospace tab handling.
    markup='<br/>'.join(escape(line).replace(' ','&#160;') for line in lines)
    p=Paragraph(markup,CODE)
    _,h=p.wrap(CW-16,H)
    c.setFillColor(colors.HexColor('#f3f3f3'))
    c.rect(M,H-y-h-14,CW,h+14,fill=1,stroke=0)
    c.setFillColor(colors.black)
    p.drawOn(c,M+8,H-y-h-7)
    y += h+23

def image(name,caption,max_h=None,width=None):
    global y,figure_number
    path=SHOTS/name
    iw,ih=Image.open(path).size
    dw=width or CW
    dh=dw*ih/iw
    if max_h and dh>max_h:
        dh=max_h; dw=dh*iw/ih
    x=(W-dw)/2
    c.drawImage(str(path),x,H-y-dh,width=dw,height=dh)
    current_images.append({'file':name,'top':round(y,1),'height':round(dh,1)})
    y += dh+5
    figure_number+=1
    p=Paragraph(f'Figure {figure_number}. {caption}',CAP)
    _,ch=p.wrap(CW,H)
    p.drawOn(c,M,H-y-ch)
    y += ch+11

def start(title=None,front=False):
    global y,page_number,current_images
    page_number+=1
    current_images=[]
    y=59
    if title: heading(title,front)

def finish():
    if y>734:
        raise ValueError(f'Page {page_number} overflows: content bottom {y:.1f}')
    if page_number>1:
        c.setFont('Arial',8)
        c.setFillColor(colors.HexColor('#666666'))
        c.drawCentredString(W/2,29,str(page_number))
        c.setFillColor(colors.black)
    layouts.append({'page':page_number,'content_bottom':round(y,1),'images':current_images.copy()})
    c.showPage()

def pipeline_diagram():
    global y
    labels=[['GitHub','branch'],['Jenkins or','Actions'],['Node tests','and build'],['Docker','image'],['Selenium','checks'],['Kubernetes','deployment']]
    bw=73; bh=41; sep=(CW-6*bw)/5
    for i,lines in enumerate(labels):
        x=M+i*(bw+sep)
        c.setLineWidth(.6)
        c.rect(x,H-y-bh,bw,bh,fill=0,stroke=1)
        c.setFont('Arial',8.2)
        for j,line in enumerate(lines): c.drawCentredString(x+bw/2,H-y-15-j*11,line)
        if i<5:
            ax=x+bw+1; bx=x+bw+sep-1; yy=H-y-bh/2
            c.line(ax,yy,bx,yy); c.line(bx-3,yy+2,bx,yy); c.line(bx-3,yy-2,bx,yy)
    y+=bh+13

TITLE='DevOps Pipeline for the H5X Website'
BRANCH='devops/h5x-lab-project'
REV='5c4d3af21c37617d5e3643ba0185b0d466ad8d2b'
RUN='42673103294'
LOGO=ROOT/'mgit-logo.jpeg'
if not LOGO.exists(): LOGO=next(ROOT.glob('mgit-logo.jp*'))

# Page 1: retained cover typography, spacing, logo and institution block.
start()
c.setFont('Calibri-Bold',22)
c.drawCentredString(W/2,H-157,TITLE)
text('DevOps Lab Project Report',15,True,True,top=170)
text('Bachelor of Technology',12,False,True,top=195)
text('Computer Science and Engineering',12,False,True,top=215)
text('By',11,False,True,top=252)
text('Md. Faisal Tabrez (23261A0535)',13,True,True,top=273)
text('Under the guidance of',11,False,True,top=311)
text('K. Rajitha',13,True,True,top=331)
text('Associate Professor',11,False,True,top=352)
c.drawImage(str(LOGO),254,H-519,width=104,height=129,mask='auto')
text('DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING',10,True,True,top=560)
text('MAHATMA GANDHI INSTITUTE OF TECHNOLOGY',11,True,True,top=579)
text('GANDIPET, HYDERABAD-500075, TELANGANA',10,False,True,top=600)
y=630
finish()

# Page 2: unsigned certification in the supplied institutional format.
start('CERTIFICATION',True)
c.drawImage(str(LOGO),254,H-280,width=104,height=129,mask='auto')
para('This is to certify that the DevOps Lab project entitled <b>DevOps Pipeline for the H5X Website</b> is being submitted by <b>Md. Faisal Tabrez</b>, bearing <b>Roll No. 23261A0535</b>, in partial fulfilment of the requirements for the award of <b>Bachelor of Technology in Computer Science and Engineering</b> at <b>Mahatma Gandhi Institute of Technology</b>. This report records the project implementation, execution outputs and analysis carried out under the guidance and supervision of the project guide.',
     ParagraphStyle('cert',parent=BASE,fontSize=12,leading=16),top=305)
c.setLineWidth(.5)
c.line(M,H-620,M+162,H-620)
c.line(W-M-162,H-620,W-M,H-620)
left=Paragraph('<b>Project Guide</b><br/>K. Rajitha<br/>Associate Professor<br/>Department of CSE',SMALL)
_,hh=left.wrap(210,200); left.drawOn(c,M,H-628-hh)
right=Paragraph('<b>Head of Department</b><br/>Department of CSE',ParagraphStyle('right',parent=SMALL,alignment=2))
_,hh=right.wrap(210,200); right.drawOn(c,W-M-210,H-628-hh)
y=700
finish()

# Page 3: both front-matter statements share a page to meet the page limit.
start('DECLARATION',True)
para('I, <b>Md. Faisal Tabrez (23261A0535)</b>, declare that this DevOps Lab project report, <b>DevOps Pipeline for the H5X Website</b>, presents the DevOps implementation and analysis recorded on the repository branch <b>devops/h5x-lab-project</b>. The existing H5X website, its credited upstream material and the software tools used in this work are acknowledged. The terminal outputs, browser screenshots and pipeline results in this report are based on executed commands and saved artifacts.',
     ParagraphStyle('decl',parent=BASE,fontSize=12,leading=16),top=126)
para('The Kubernetes results describe a local single-node teaching environment. They demonstrate deployment, manual scaling and pod replacement; they do not establish production availability or automatic scaling.',
     ParagraphStyle('decl2',parent=BASE,fontSize=12,leading=16))
text('Student signature: ____________________',10,top=340)
text('Md. Faisal Tabrez (23261A0535)',10,top=363)
y=430
heading('ACKNOWLEDGEMENT',True)
para('I thank <b>K. Rajitha, Associate Professor, Department of Computer Science and Engineering</b>, for guidance and support. I also thank the department faculty and staff of Mahatma Gandhi Institute of Technology. I acknowledge the maintainers of Git, GitHub, Jenkins, Docker, Selenium, Kubernetes and kind, and the contributors whose work is credited in the H5X repository.',
     ParagraphStyle('ack',parent=BASE,fontSize=12,leading=16),top=485)
text('Md. Faisal Tabrez (23261A0535)',10,top=640)
finish()

# Page 4: a static contents page with verified, fixed page numbers.
start('TABLE OF CONTENTS',True)
gap(9)
rows=[['Section','Page'],['Certification','2'],['Declaration and Acknowledgement','3'],
      ['1 Introduction','5'],['2 Git and GitHub','6'],['2 GitHub Actions execution','7'],
      ['3 Jenkins pipeline','8'],['3 Jenkins command outputs','9'],['4 Docker','10'],
      ['5 Selenium tests','11'],['5 Selenium browser output','12'],
      ['6 Kubernetes deployment','13'],['6 Kubernetes scaling and recovery','14'],
      ['7 Conclusion and References','15']]
table(rows,[CW-60,60])
gap(25)
para('<b>Project repository</b><br/><link href="https://github.com/FaisalTabrez/H5X/tree/devops/h5x-lab-project" color="black">github.com/FaisalTabrez/H5X/tree/devops/h5x-lab-project</link>',SMALL)
para('<b>Implementation revision</b><br/>'+REV,SMALL)
para('<b>Evidence record</b><br/>Jenkins H5X-DevOps build 2; GitHub Actions run 42673103294, attempt 2. Execution logs use UTC timestamps. Full logs and original-resolution screenshots accompany the report in devops/evidence.',SMALL)
finish()

# Page 5: introduction and the actual deployed website.
start('1 Introduction')
para('This project implements a repeatable delivery pipeline for the H5X team website. H5X contains five pages for CTF activities, bug hunting, hackathons, events and photographs. The application builds with Node.js and produces static HTML, CSS, JavaScript and image assets. The DevOps work adds automated checks, container packaging, browser acceptance tests and a real Kubernetes deployment.')
para('The objective is to verify a change before deployment and retain evidence of the result. Jenkins runs the local delivery pipeline, while GitHub Actions independently verifies the branch on a hosted runner. Both execute the website build, Docker packaging, Selenium tests and local Kubernetes rollout. The checked-in CTFtime snapshot keeps the build independent of live data availability.')
sub('Pipeline flow')
pipeline_diagram()
image('01-h5x-kubernetes-website.png','The H5X website served by the local Kubernetes Service.')
table([['Component','Lab implementation'],['Application','Five static pages; no external database'],['Execution environment','Docker Desktop Linux containers; kind v0.33.0'],['Deployment target','Kubernetes v1.37.0; namespace h5x-devops']], [130,CW-130])
finish()

# Page 6: Git version control and source inventory.
start('2 Git and GitHub')
para('The implementation is committed to <b>devops/h5x-lab-project</b> in the existing H5X repository. Git records the changes to the pipeline, Dockerfile, browser tests and Kubernetes manifests. Jenkins fetches this branch and checks out its exact source revision, so its workspace appears as a detached HEAD; the remote branch shown below identifies the revision being tested.')
code('git switch -c devops/h5x-lab-project\ngit add .\ngit commit -m "Add DevOps lab pipeline with Docker Selenium and Kubernetes"\ngit push -u origin devops/h5x-lab-project')
image('02-git-branch.png','Real Git terminal output from the Jenkins workspace.')
table([['Tracked file or folder','Purpose'],['Jenkinsfile','Five-stage local CI/CD pipeline'],['Dockerfile and devops/nginx.conf','Build and serve the website container'],['tests/selenium/','Browser acceptance checks'],['k8s/ and devops/kind.yaml','Deployment, Service, namespace and local cluster'],['.github/workflows/devops-lab.yml','Hosted verification and saved artifacts']], [205,CW-205])
finish()

# Page 7: hosted CI, with both UI and the recorded CLI output.
start('2 GitHub Actions execution')
para('The workflow ran against revision <b>5c4d3af</b>. Run <b>42673103294, attempt 2</b>, completed successfully, including unit tests, Docker build, eight Selenium checks, cluster creation and deployment verification. The first attempt of this run stopped with a GitHub internal server error before any job started; the retry used the same source revision.',SMALL)
image('03-github-actions-success.png','GitHub Actions showing the successful verify job.',max_h=238)
image('13-github-actions-output.png','Selected test and deployment output from the hosted Actions job.',max_h=238)
para('The workflow uploads JUnit XML, browser screenshots and Kubernetes manifests as <b>h5x-devops-evidence</b>. The terminal displays selected command-output lines from the hosted job. Complete logs, including runner notices, are preserved in <b>devops/evidence/logs/github-actions.log</b>.',SMALL)
finish()

# Page 8: Jenkins architecture, stages and the actual successful job.
start('3 Jenkins pipeline')
para('A separate Jenkins controller was run in Docker for the lab. Its initialization creates the <b>H5X-DevOps</b> Pipeline job and loads the Jenkinsfile from the project branch. Build <b>2</b> completed with <b>SUCCESS</b> and archived the test XML, browser images and rendered deployment manifest.')
table([['Stage','Executed work'],['Git checkout','Fetch the branch and record revision 5c4d3af'],['Test and build','Run npm test, build five pages and validate assets'],['Docker image','Build h5x-devops:build-2 and inspect its user'],['Selenium acceptance','Run eight browser checks against a temporary container'],['Kubernetes deploy','Load the image into kind, apply manifests and verify health']], [126,CW-126])
image('04-jenkins-success.png','Jenkins build 2 with successful status, source revision and artifacts.')
para('The lab controller includes Node.js, Python, Docker CLI with Buildx, kind and kubectl. It uses one executor and prevents overlapping runs of this job. The Docker socket and cluster credentials are available only to this trusted local lab; passwords and kubeconfigs are excluded from Git.',SMALL)
finish()

# Page 9: command outputs attached to the Jenkins section.
start('3 Jenkins command outputs')
para('The existing Node test suite passed all <b>14 tests</b>. The static build generated five pages, and the site checker verified their assets, records and gallery credits. The terminal screenshot repeats these same project commands in the checked-out Jenkins workspace.',SMALL)
image('06-node-tests-build.png','Node test summary, static build and site validation output.',max_h=245)
image('05-jenkins-console.png','Jenkins console ending with Finished SUCCESS.',max_h=245)
para('Build 1 exposed a missing Docker CLI in the original controller image. The controller Dockerfile was corrected to include Docker CLI and Buildx, then build 2 passed. The archived console log records the successful run without substituting expected output for actual results.',SMALL)
finish()

# Page 10: container implementation and real build/runtime outputs.
start('4 Docker')
para('The multi-stage Dockerfile builds the website with Node.js and copies only the generated output into unprivileged Nginx. The runtime uses user <b>101</b> and listens on port <b>8080</b>. The /healthz endpoint supports container health checks and Kubernetes probes. The measured local image size was <b>93,283,132 bytes</b>.')
code('FROM node:22-alpine AS build\nWORKDIR /app\n# Copy package.json, scripts, src, static and data\nRUN npm run build:pages && npm run check:site\nFROM nginxinc/nginx-unprivileged:stable-alpine\nCOPY devops/nginx.conf /etc/nginx/conf.d/default.conf\nCOPY --from=build /app/out/ /usr/share/nginx/html/\nEXPOSE 8080')
para('The excerpt summarizes the two build stages; the repository contains the complete Dockerfile, source-copy instructions and HEALTHCHECK.',SMALL)
image('07-docker-build-health.png','Docker build, non-root user, healthy container and HTTP checks.')
para('The home route returned <b>HTTP 200</b>, the missing route returned <b>HTTP 404</b>, and the running container reported <b>healthy</b>. The Jenkins image tag build-2 identifies the container image loaded into Kubernetes.',SMALL)
finish()

# Page 11: acceptance suite and its command output.
start('5 Selenium tests')
para('Python Selenium WebDriver controls Chromium through a remote Selenium server. Pytest runs independent browser sessions, explicit waits synchronize with visible controls, and screenshots are saved after each test. The same acceptance suite is used locally, in Jenkins and in GitHub Actions.')
table([['Check','Cases','Verified behaviour'],['Navigation','5','Each menu link opens the correct page, title and active item'],['Theme persistence','1','Dark mode survives reload; light mode can be restored'],['Gallery interaction','1','Photo selection updates; full-image dialog opens and closes'],['Motion persistence','1','Pause state and accessibility state survive reload']], [117,50,CW-167])
image('08-selenium-tests.png','Actual Selenium acceptance output showing eight passing tests.')
para('The captured terminal execution completed with <b>8 passed in 8.55 seconds</b>. This is one observed test duration, not a performance benchmark. JUnit reports and the browser screenshots are saved as build artifacts; the hosted workflow independently passed the same eight checks.',SMALL)
finish()

# Page 12: actual browser output and the selected acceptance assertions.
start('5 Selenium browser output')
para('The gallery test selects the second photograph using the visible thumbnail control, opens the full photograph and verifies that the dialog title matches the selected image. It then closes the dialog and waits for it to disappear. The browser image below was captured from the deployed Kubernetes website.')
image('09-selenium-gallery-dialog.png','The real gallery dialog opened by Selenium on the deployed website.')
sub('Representative test assertions')
code('wait.until(EC.element_to_be_clickable(\n    (By.CSS_SELECTOR, \'[data-photo="1"]\'))).click()\ntitle = browser.find_element(By.ID, "featured-title").text\nbrowser.find_element(By.ID, "expand-photo").click()\nwait.until(EC.visibility_of_element_located(\n    (By.ID, "photo-dialog")))\nassert browser.find_element(By.ID, "photo-title").text == title\nbrowser.find_element(\n    By.CSS_SELECTOR, "#photo-dialog .dialog-close").click()')
para('The suite tests the website interface and local application state. It does not submit content to external sites or depend on successful navigation to the photographs\' original social posts. The source tests are available in <b>tests/selenium/test_website.py</b>.',SMALL)
finish()

# Page 13: the real local Kubernetes deployment.
start('6 Kubernetes deployment')
para('kind creates a real single-node Kubernetes cluster inside Docker. Jenkins loads its tested image into the node, renders the Kustomize resources, replaces the local image tag with <b>h5x-devops:build-2</b> and applies the manifest. The Deployment maintains two replicas; a NodePort Service exposes port 30080, mapped to host port 18088.')
code('kind load docker-image h5x-devops:build-2 --name h5x-devops\nkubectl --context kind-h5x-devops apply -f reports/manifests/deployment.yaml\nkubectl -n h5x-devops rollout status deployment/h5x\ncurl --fail http://127.0.0.1:18088/healthz')
image('10-kubernetes-resources.png','Ready Kubernetes node, two replicas, NodePort Service and health response.')
table([['Configuration','Applied value'],['Health checks','Readiness and liveness probes on /healthz'],['Resources per pod','Requests 50m CPU and 32Mi; limits 250m CPU and 128Mi'],['Security','Non-root user 101; read-only root; capabilities dropped'],['Update policy','Rolling update with maxUnavailable 0 and maxSurge 1']], [130,CW-130])
finish()

# Page 14: observed manual scaling, recovery and restored replica count.
start('6 Kubernetes scaling and recovery')
para('The deployment was scaled from two to three replicas. After all three pods became ready, one selected pod was deleted. Kubernetes created a replacement pod, readiness checks passed, and the deployment was restored to two replicas. These are executed cluster operations.',SMALL)
image('11-kubernetes-scaling.png','Scaling to three replicas and waiting for rollout completion.',max_h=238)
image('12-kubernetes-recovery.png','Pod replacement, readiness checks and restoration to two replicas.',max_h=238)
para('Deleted pod: <b>h5x-648b67cc75-br7tp</b>. Replacement pod: <b>h5x-648b67cc75-qwt76</b>. The final Deployment reported <b>READY 2/2</b>. This demonstrates replica reconciliation after pod deletion. It does not measure request continuity or recovery from failure of the single cluster node.',SMALL)
finish()

# Page 15: supported conclusion, practical limits and inspectable references.
start('7 Conclusion')
para('The project demonstrates a working DevOps pipeline for an existing website. Version-controlled configuration drives automated checks, a tested Docker image, browser acceptance tests and a verified Kubernetes rollout. Jenkins and GitHub Actions independently completed the delivery workflow for implementation revision <b>5c4d3af</b>.')
table([['Requirement','Observed result'],['Git and GitHub','Implementation branch pushed with tracked configuration'],['Jenkins','H5X-DevOps build 2 finished SUCCESS'],['Docker','Image built; user 101; container healthy; HTTP 200/404 checks'],['Selenium','Eight acceptance tests passed'],['Kubernetes','Two ready replicas; scaling to three; pod replacement verified'],['GitHub Actions','Run 42673103294 attempt 2 completed successfully']], [120,CW-120])
para('The deployment is a single-node local lab with manual scaling. Production work would require separate Jenkins agents, managed credentials, immutable image references, TLS, monitoring and a multi-node deployment. The captured results do not establish autoscaling, production high availability or performance improvements.',SMALL)
sub('References')
refs=[
('1. Project implementation and evidence','https://github.com/FaisalTabrez/H5X/tree/devops/h5x-lab-project'),
('2. Successful GitHub Actions run','https://github.com/FaisalTabrez/H5X/actions/runs/42673103294'),
('3. Jenkins documentation Using a Jenkinsfile','https://www.jenkins.io/doc/book/pipeline/jenkinsfile/'),
('4. Docker documentation Multi-stage builds','https://docs.docker.com/build/building/multi-stage/'),
('5. Selenium documentation Remote WebDriver','https://www.selenium.dev/documentation/webdriver/drivers/remote_webdriver/'),
('6. Kubernetes documentation Deployments','https://kubernetes.io/docs/concepts/workloads/controllers/deployment/'),
('7. kind documentation Quick Start','https://kind.sigs.k8s.io/docs/user/quick-start/'),
]
for label,url in refs:
    para(f'<b>{label}</b><br/><link href="{url}" color="black">{url}</link>',SMALL,gap=5)
finish()

if page_number != 15: raise AssertionError(page_number)
c.save()
(ROOT/'layout.json').write_text(json.dumps(layouts,indent=2),encoding='utf-8')
print(f'Created {OUT} with {page_number} pages and {figure_number} figures')
