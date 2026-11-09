"""Browser acceptance tests shared by local runs, Jenkins and GitHub Actions."""
import os
from pathlib import Path

import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:18088").rstrip("/")
ARTIFACTS = Path(os.getenv("SCREENSHOT_DIR", "reports/selenium/screenshots"))


@pytest.fixture
def browser(request):
    options = webdriver.ChromeOptions()
    for argument in ("--headless=new", "--window-size=1440,1000",
                     "--disable-dev-shm-usage", "--no-sandbox"):
        options.add_argument(argument)
    remote = os.getenv("SELENIUM_REMOTE_URL")
    driver = (webdriver.Remote(command_executor=remote, options=options)
              if remote else webdriver.Chrome(options=options))
    driver.set_window_size(1440, 1000)
    driver.set_page_load_timeout(30)
    yield driver
    ARTIFACTS.mkdir(parents=True, exist_ok=True)
    driver.save_screenshot(str(ARTIFACTS / f"{request.node.name}.png"))
    driver.quit()


def open_page(browser, filename):
    browser.get(f"{BASE_URL}/{filename}")
    WebDriverWait(browser, 15).until(
        lambda d: d.execute_script("return !!window.H5XViews && !!window.h5xSound"))
    return WebDriverWait(browser, 15)


@pytest.mark.parametrize("filename,page,title", [
    ("index.html", "ctf", "CTF TEAM"),
    ("bug-hunt.html", "bugs", "BUG HUNT"),
    ("hackathon.html", "hackathon", "HACKATHON"),
    ("events.html", "events", "EVENTS ATTENDED"),
    ("gallery.html", "gallery", "GALLERY"),
])
def test_navigation(browser, filename, page, title):
    wait = open_page(browser, "index.html")
    wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR,
               f'nav a[href="{filename}"]'))).click()
    wait.until(lambda d: d.find_element(By.TAG_NAME, "body").get_attribute("data-page") == page)
    assert browser.title == f"H5X / {title}"
    active = browser.find_elements(By.CSS_SELECTOR, 'nav a[aria-current="page"]')
    assert len(active) == 1
    assert active[0].get_attribute("href").endswith(filename)


def test_theme_persists_after_reload(browser):
    wait = open_page(browser, "index.html")
    wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, '[data-set="dark"]'))).click()
    wait.until(lambda d: d.find_element(By.TAG_NAME, "html").get_attribute("data-theme") == "dark")
    browser.refresh()
    wait.until(lambda d: d.find_element(By.CSS_SELECTOR, '[data-set="dark"]').get_attribute("aria-pressed") == "true")
    browser.find_element(By.CSS_SELECTOR, '[data-set="light"]').click()
    assert browser.find_element(By.TAG_NAME, "html").get_attribute("data-theme") == "light"


def test_gallery_selection_and_dialog(browser):
    wait = open_page(browser, "gallery.html")
    # Pause animation through the public control for deterministic interaction.
    motion = wait.until(EC.element_to_be_clickable((By.ID, "motion")))
    if motion.get_attribute("aria-pressed") == "false" and motion.is_enabled():
        motion.click()
    wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, '[data-photo="1"]'))).click()
    wait.until(lambda d: d.find_element(By.CSS_SELECTOR, '[data-photo="1"]').get_attribute("aria-pressed") == "true")
    title = browser.find_element(By.ID, "featured-title").text
    wait.until(EC.element_to_be_clickable((By.ID, "expand-photo"))).click()
    dialog = wait.until(EC.visibility_of_element_located((By.ID, "photo-dialog")))
    assert dialog.get_attribute("open") is not None
    assert browser.find_element(By.ID, "photo-title").text == title
    assert browser.find_element(By.CSS_SELECTOR, "#photo-dialog img").get_attribute("src")
    ARTIFACTS.mkdir(parents=True, exist_ok=True)
    browser.save_screenshot(str(ARTIFACTS / "gallery-dialog-open.png"))
    browser.find_element(By.CSS_SELECTOR, "#photo-dialog .dialog-close").click()
    wait.until(EC.invisibility_of_element_located((By.ID, "photo-dialog")))


def test_motion_pause_persists(browser):
    wait = open_page(browser, "index.html")
    motion = wait.until(EC.element_to_be_clickable((By.ID, "motion")))
    motion.click()
    assert motion.get_attribute("aria-pressed") == "true"
    browser.refresh()
    wait.until(lambda d: d.find_element(By.ID, "motion").get_attribute("aria-pressed") == "true")
    assert "no-motion" in browser.find_element(By.TAG_NAME, "html").get_attribute("class")
