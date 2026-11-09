import jenkins.model.Jenkins
import hudson.security.HudsonPrivateSecurityRealm
import hudson.security.FullControlOnceLoggedInAuthorizationStrategy
import org.jenkinsci.plugins.workflow.job.WorkflowJob
import org.jenkinsci.plugins.workflow.cps.CpsScmFlowDefinition
import hudson.plugins.git.GitSCM
import hudson.plugins.git.UserRemoteConfig
import hudson.plugins.git.BranchSpec

def jenkins = Jenkins.get()
def passwordFile = new File('/run/h5x/admin-password')
if (!passwordFile.exists()) throw new IllegalStateException('Mount the local lab admin-password file')
def realm = new HudsonPrivateSecurityRealm(false)
realm.createAccount('faisal', passwordFile.text.trim())
jenkins.setSecurityRealm(realm)
def authorization = new FullControlOnceLoggedInAuthorizationStrategy()
authorization.setAllowAnonymousRead(false)
jenkins.setAuthorizationStrategy(authorization)
jenkins.setNumExecutors(1)
jenkins.setSystemMessage('H5X DevOps Lab - Md. Faisal Tabrez - 23261A0535')
def job = jenkins.getItem('H5X-DevOps')
if (job == null) job = jenkins.createProject(WorkflowJob, 'H5X-DevOps')
def remote = new UserRemoteConfig('https://github.com/FaisalTabrez/H5X.git', null, null, null)
def scm = new GitSCM([remote], [new BranchSpec('*/devops/h5x-lab-project')], false, [], null, null, [])
def definition = new CpsScmFlowDefinition(scm, 'Jenkinsfile')
definition.setLightweight(true)
job.setDefinition(definition)
job.setDescription('Git checkout, Node tests, Docker image, Selenium acceptance and local Kubernetes deployment')
job.save()
jenkins.save()
