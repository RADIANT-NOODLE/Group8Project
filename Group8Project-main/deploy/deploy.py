"""Puts VALORA on AWS, or updates it. Run from anywhere:

    python deploy/deploy.py            build and deploy
    python deploy/deploy.py --check    only build, and check the settings
    python deploy/deploy.py --allow-blank-terms    deploy although the terms still have blanks
    python deploy/deploy.py --test-email you@example.com    send one test email, and nothing else

Needs the AWS CLI signed in, and deploy/production.env filled in (see README.md).
"""
import argparse
import json
import os
import re
import shutil
import smtplib
import ssl
import subprocess
import sys
import time
import zipfile
from email.message import EmailMessage
from pathlib import Path

DEPLOY = Path(__file__).resolve().parent
ROOT = DEPLOY.parent
BACKEND = ROOT / "backend"
FRONTEND = ROOT / "FrontEnd"
BUILD = DEPLOY / "build"
PACKAGE = BUILD / "package"
ENV_FILE = DEPLOY / "production.env"

REQUIRED = ("AWS_REGION", "STACK_NAME", "DATABASE_URL", "SECRET_KEY", "BUDGET_EMAIL")
# Lambda's runtime is Linux, so these must be Linux packages even when building on Windows.
PLATFORMS = ("manylinux2014_x86_64", "manylinux_2_17_x86_64", "manylinux_2_28_x86_64")
# AWS's limit is 250 MB unpacked.
MAX_PACKAGE_MB = 240


def fail(message: str) -> None:
    sys.exit(f"\nStopped: {message}")


def run(*command: str, cwd: Path | None = None, env: dict | None = None, capture: bool = False) -> str:
    # Commands are never printed in full, so that settings cannot reach a terminal log.
    print(f"  > {' '.join(Path(part).name if index == 0 else part for index, part in enumerate(command[:3]))}")
    executable = shutil.which(command[0])
    if executable is None:
        fail(f"{command[0]} is not installed.")
    result = subprocess.run(
        [executable, *command[1:]],
        cwd=cwd,
        env={**os.environ, **(env or {})},
        capture_output=capture,
        text=True,
    )
    if result.returncode != 0:
        if capture:
            print(result.stderr)
        fail(f"'{' '.join(command[:3])}' failed.")
    return (result.stdout or "").strip() if capture else ""


def read_settings() -> dict[str, str]:
    if not ENV_FILE.exists():
        fail(f"{ENV_FILE} is missing. Copy production.env.example to production.env and fill it in.")
    settings = {}
    for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, value = line.split("=", 1)
            settings[key.strip()] = value.strip().strip("\"'")
    # Google shows app passwords with spaces, but they aren't part of the password
    if "gmail" in settings.get("SMTP_HOST", "").lower():
        settings["SMTP_PASSWORD"] = settings.get("SMTP_PASSWORD", "").replace(" ", "")
    return settings


def check_settings(settings: dict[str, str]) -> None:
    missing = [key for key in REQUIRED if not settings.get(key)]
    if missing:
        fail(f"production.env is missing: {', '.join(missing)}")
    if not settings["DATABASE_URL"].startswith("postgresql+asyncpg://"):
        fail("DATABASE_URL must start with postgresql+asyncpg://")
    if len(settings["SECRET_KEY"]) < 32 or "change" in settings["SECRET_KEY"].lower():
        fail("SECRET_KEY must be a long random value. See README.md for how to make one.")
    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", settings["BUDGET_EMAIL"]):
        fail("BUDGET_EMAIL does not look like an email address.")
    if not re.fullmatch(r"[a-z0-9-]+", settings["STACK_NAME"]):
        fail("STACK_NAME can only use lowercase letters, numbers and dashes.")
    check_email_settings(settings)
    print("Settings look complete.")


def check_email_settings(settings: dict[str, str]) -> None:
    if not settings.get("SMTP_HOST"):
        if settings.get("SMTP_USER") or settings.get("SMTP_PASSWORD"):
            fail("production.env has an email login but no SMTP_HOST. For Gmail, use smtp.gmail.com.")
        print("Warning: SMTP_HOST is empty, so forgot password emails will not be sent.")
        return
    missing = [key for key in ("SMTP_USER", "SMTP_PASSWORD") if not settings.get(key)]
    if missing:
        fail(f"production.env is missing these email settings: {', '.join(missing)}")
    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", settings.get("SMTP_FROM", "")) or settings["SMTP_FROM"].endswith(".local"):
        fail("SMTP_FROM must be a real address. For Gmail, use the same address as SMTP_USER.")


def send_test_email(settings: dict[str, str], to_address: str) -> None:
    if not settings.get("SMTP_HOST"):
        fail("SMTP_HOST is empty in production.env. For Gmail, use smtp.gmail.com.")
    check_email_settings(settings)

    message = EmailMessage()
    message["From"] = settings["SMTP_FROM"]
    message["To"] = to_address
    message["Subject"] = "VALORA test email"
    message.set_content("Your forgot password email settings work.")

    print(f"Sending a test email to {to_address}...")
    try:
        with smtplib.SMTP(settings["SMTP_HOST"], int(settings.get("SMTP_PORT") or 587), timeout=15) as smtp:
            smtp.starttls(context=ssl.create_default_context())
            smtp.login(settings["SMTP_USER"], settings["SMTP_PASSWORD"])
            smtp.send_message(message)
    except smtplib.SMTPAuthenticationError:
        fail("The email login was refused. Check SMTP_USER and SMTP_PASSWORD. Gmail needs an app password, not your normal password.")
    except (smtplib.SMTPException, OSError) as error:
        # the error's type only: the message can repeat what was sent to the server
        fail(f"The email could not be sent ({type(error).__name__}). Check SMTP_HOST and SMTP_PORT.")
    print("Sent. Check that inbox, and the spam folder.")


def build_api() -> Path:
    print("Building the API package...")
    shutil.rmtree(PACKAGE, ignore_errors=True)
    PACKAGE.mkdir(parents=True)

    platforms = [part for platform in PLATFORMS for part in ("--platform", platform)]
    run(
        sys.executable, "-m", "pip", "install", "--quiet", "--no-cache-dir",
        "-r", str(BACKEND / "requirements-lambda.txt"),
        "--target", str(PACKAGE),
        *platforms,
        "--implementation", "cp",
        "--python-version", "3.12",
        "--only-binary=:all:",
    )
    shutil.copytree(BACKEND / "app", PACKAGE / "app", ignore=shutil.ignore_patterns("__pycache__", "*.pyc"))

    for leftover in PACKAGE.rglob("__pycache__"):
        shutil.rmtree(leftover, ignore_errors=True)
    # command-line helpers pip made for this computer; the API never runs them
    shutil.rmtree(PACKAGE / "bin", ignore_errors=True)

    size_mb = sum(item.stat().st_size for item in PACKAGE.rglob("*") if item.is_file()) / 1e6
    if size_mb > MAX_PACKAGE_MB:
        fail(f"The API package is {size_mb:.0f} MB, over AWS's limit.")

    windows_only = [p.name for pattern in ("*.pyd", "*.dll", "*.exe") for p in PACKAGE.rglob(pattern)]
    if windows_only:
        fail(f"The package contains Windows files, which cannot run on Lambda: {windows_only[:3]}")

    archive = BUILD / f"valora-api-{time.strftime('%Y%m%d-%H%M%S')}.zip"
    with zipfile.ZipFile(archive, "w", zipfile.ZIP_DEFLATED) as bundle:
        for item in sorted(PACKAGE.rglob("*")):
            if item.is_file():
                bundle.write(item, item.relative_to(PACKAGE).as_posix())
    print(f"API package: {size_mb:.0f} MB unpacked, {archive.stat().st_size / 1e6:.0f} MB zipped.")
    return archive


def build_website() -> None:
    print("Building the website...")
    # "/" means the API is on the same address as the website, through CloudFront.
    run("npm", "run", "build", cwd=FRONTEND, env={"VITE_API_BASE_URL": "/", "VITE_USE_MOCK_AUTH": "false"})


def aws(settings: dict[str, str], *arguments: str, capture: bool = False) -> str:
    return run("aws", *arguments, "--region", settings["AWS_REGION"], capture=capture)


def quiet_aws(settings: dict[str, str], *arguments: str) -> subprocess.CompletedProcess:
    """An AWS command whose failure is an answer rather than a problem."""
    executable = shutil.which("aws")
    if executable is None:
        fail("The AWS CLI is not installed.")
    return subprocess.run(
        [executable, *arguments, "--region", settings["AWS_REGION"]], capture_output=True, text=True
    )


def stack_exists(settings: dict[str, str]) -> bool:
    return quiet_aws(settings, "cloudformation", "describe-stacks", "--stack-name", settings["STACK_NAME"]).returncode == 0


def wait_for(settings: dict[str, str], condition: str) -> None:
    attempt = quiet_aws(settings, "cloudformation", "wait", condition, "--stack-name", settings["STACK_NAME"])
    if attempt.returncode != 0:
        fail(
            f"AWS could not finish ({condition}). See what went wrong under CloudFormation > "
            f"{settings['STACK_NAME']} > Events in the AWS console."
        )


def stack_outputs(settings: dict[str, str]) -> dict[str, str]:
    reply = aws(settings, "cloudformation", "describe-stacks", "--stack-name", settings["STACK_NAME"],
                "--query", "Stacks[0].Outputs", "--output", "json", capture=True)
    return {item["OutputKey"]: item["OutputValue"] for item in json.loads(reply)}


def deploy_stack(settings: dict[str, str], bucket: str, key: str, frontend_url: str) -> None:
    # Parameters go through a private file so that secrets never appear on a command line.
    parameters = {
        "ArtifactBucket": bucket,
        "ArtifactKey": key,
        "DatabaseUrl": settings["DATABASE_URL"],
        "SecretKey": settings["SECRET_KEY"],
        "FrontendUrl": frontend_url,
        "AccessTokenExpireMinutes": settings.get("ACCESS_TOKEN_EXPIRE_MINUTES", "30"),
        "SmtpHost": settings.get("SMTP_HOST", ""),
        "SmtpPort": settings.get("SMTP_PORT", "587"),
        "SmtpUser": settings.get("SMTP_USER", ""),
        "SmtpPassword": settings.get("SMTP_PASSWORD", ""),
        "SmtpFrom": settings.get("SMTP_FROM", "no-reply@valora.local"),
    }
    parameter_file = BUILD / "parameters.json"
    parameter_file.write_text(
        json.dumps([{"ParameterKey": key, "ParameterValue": value} for key, value in parameters.items()]),
        encoding="utf-8",
    )
    stack = settings["STACK_NAME"]
    common = (
        "--stack-name", stack,
        "--template-body", f"file://{(DEPLOY / 'template.yaml').as_posix()}",
        "--parameters", f"file://{parameter_file.as_posix()}",
        "--capabilities", "CAPABILITY_IAM",
    )
    try:
        if not stack_exists(settings):
            aws(settings, "cloudformation", "create-stack", *common)
            wait_for(settings, "stack-create-complete")
            return

        attempt = quiet_aws(settings, "cloudformation", "update-stack", *common)
        if attempt.returncode == 0:
            wait_for(settings, "stack-update-complete")
        elif "No updates are to be performed" not in attempt.stderr:
            print(attempt.stderr)
            fail("AWS refused the update.")
    finally:
        parameter_file.unlink(missing_ok=True)


def ensure_budget(settings: dict[str, str], account: str) -> None:
    """Sets up the bill warning. A warning only: AWS budgets do not stop or cap spending.

    Made directly because CloudFormation has no Budget type in some regions. Failing here
    must not fail the deployment, since the site itself is already up.
    """
    name = f"{settings['STACK_NAME']}-monthly"
    # Budgets is a global AWS service, answered from us-east-1 whatever region the site is in.
    def budgets(*arguments: str) -> subprocess.CompletedProcess:
        return subprocess.run(
            [shutil.which("aws"), "budgets", *arguments, "--account-id", account, "--region", "us-east-1"],
            capture_output=True,
            text=True,
        )

    if budgets("describe-budget", "--budget-name", name).returncode == 0:
        print("The bill warning is already in place.")
        return

    budget_file = BUILD / "budget.json"
    alerts_file = BUILD / "budget-alerts.json"
    budget_file.write_text(json.dumps({
        "BudgetName": name,
        "BudgetType": "COST",
        "TimeUnit": "MONTHLY",
        "BudgetLimit": {"Amount": settings.get("MONTHLY_BUDGET_USD", "3"), "Unit": "USD"},
    }), encoding="utf-8")
    subscribers = [{"SubscriptionType": "EMAIL", "Address": settings["BUDGET_EMAIL"]}]
    alerts_file.write_text(json.dumps([
        {"Notification": {"NotificationType": kind, "ComparisonOperator": "GREATER_THAN", "Threshold": threshold, "ThresholdType": "PERCENTAGE"}, "Subscribers": subscribers}
        for kind, threshold in (("ACTUAL", 80), ("FORECASTED", 100))
    ]), encoding="utf-8")
    try:
        attempt = budgets(
            "create-budget",
            "--budget", f"file://{budget_file.as_posix()}",
            "--notifications-with-subscribers", f"file://{alerts_file.as_posix()}",
        )
    finally:
        budget_file.unlink(missing_ok=True)
        alerts_file.unlink(missing_ok=True)

    if attempt.returncode == 0:
        print(f"Bill warning set up at ${settings.get('MONTHLY_BUDGET_USD', '3')} a month.")
    else:
        print(f"Warning: the bill warning could not be set up, but the site is fine.\n{attempt.stderr.strip()}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="only build, and check the settings")
    parser.add_argument(
        "--allow-blank-terms",
        action="store_true",
        help="deploy although the public terms still show unfilled blanks",
    )
    parser.add_argument("--test-email", metavar="ADDRESS", help="send one test email, and nothing else")
    arguments = parser.parse_args()

    settings = read_settings()
    if arguments.test_email:
        send_test_email(settings, arguments.test_email)
        return

    check_settings(settings)

    # Public legal text must not go live with blanks in it.
    terms = (FRONTEND / "app/pages/Auth/TermsContent.jsx").read_text(encoding="utf-8")
    blanks = sorted(set(re.findall(r"\[Insert[^\]]*\]", terms)))
    if blanks and not arguments.check and not arguments.allow_blank_terms:
        fail(
            f"The Terms and Conditions still have blanks to fill in: {', '.join(blanks)}\n"
            "To publish them as they are, run this again with --allow-blank-terms."
        )
    if blanks:
        print(f"Warning: the public Terms and Conditions still show these blanks: {', '.join(blanks)}")

    BUILD.mkdir(exist_ok=True)
    archive = build_api()
    build_website()

    if arguments.check:
        print("\nCheck finished. Nothing was sent to AWS.")
        return

    account = aws(settings, "sts", "get-caller-identity", "--query", "Account", "--output", "text", capture=True)
    bucket = f"{settings['STACK_NAME']}-artifacts-{account}"

    print("Uploading the API package...")
    if quiet_aws(settings, "s3api", "head-bucket", "--bucket", bucket).returncode != 0:
        aws(settings, "s3", "mb", f"s3://{bucket}")
    aws(settings, "s3", "cp", str(archive), f"s3://{bucket}/{archive.name}", "--only-show-errors")

    print("Creating or updating the AWS resources (a first run takes several minutes)...")
    if stack_exists(settings):
        frontend_url = settings.get("FRONTEND_URL") or stack_outputs(settings)["WebsiteUrl"]
        deploy_stack(settings, bucket, archive.name, frontend_url)
    else:
        # The site's address only exists once CloudFront does; password reset links need it.
        deploy_stack(settings, bucket, archive.name, settings.get("FRONTEND_URL", ""))
        frontend_url = settings.get("FRONTEND_URL") or stack_outputs(settings)["WebsiteUrl"]
        deploy_stack(settings, bucket, archive.name, frontend_url)
    outputs = stack_outputs(settings)

    print("Uploading the website...")
    aws(settings, "s3", "sync", str(FRONTEND / "dist"), f"s3://{outputs['WebsiteBucketName']}",
        "--delete", "--exclude", "*.map", "--only-show-errors",
        # File names do not change between builds, so browsers must check for a newer copy.
        "--cache-control", "public, max-age=0, must-revalidate")
    aws(settings, "cloudfront", "create-invalidation", "--distribution-id", outputs["DistributionId"],
        "--paths", "/index.html", "/assets/*", "--output", "text", "--query", "Invalidation.Id", capture=True)

    ensure_budget(settings, account)

    print(f"\nDone. VALORA is at {outputs['WebsiteUrl']}")
    print("A brand new site can take about 10 minutes to appear everywhere.")
    print(f"Bill warnings go to {settings['BUDGET_EMAIL']}.")


if __name__ == "__main__":
    main()
