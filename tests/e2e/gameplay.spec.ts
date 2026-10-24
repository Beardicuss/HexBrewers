import { expect, test, type Page } from "@playwright/test";

const SETTINGS_KEY = "hexbrewers-settings";

async function dismissOpening(page: Page) {
  const enter = page.getByRole("button", { name: "ENTER ASHENVEIL" });
  await expect(enter).toBeEnabled({ timeout: 15_000 });
  await enter.click();
  const skip = page.getByRole("button", { name: /Skip/i });
  const loading = page.getByText("OPENING THE WAY TO ASHENVEIL", { exact: true });
  await expect(skip.or(loading)).toBeVisible({ timeout: 15_000 });
  if (await skip.isVisible()) {
    await skip.click();
    await expect(skip).toBeHidden();
  }
  // The opening loader intentionally waits for its presentation media. On a
  // cold local cache this can exceed the old 15-second assumption.
  await expect(skip).toBeVisible({ timeout: 45_000 });
  await skip.click();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: /New Game|Новая Игра|ახალი თამაში/ })).toBeVisible();
}

async function openNewGameSetup(page: Page) {
  await page.getByRole("button", { name: "New Game", exact: true }).click();
  await expect(page.getByRole("region", { name: "Prepare a New Brew" })).toBeVisible();
}

async function beginConfiguredGame(page: Page) {
  await page.getByRole("button", { name: /Begin Brewing/ }).click();
}

async function chooseRecipeSet(page: Page, recipeSet: number) {
  await page.getByRole("button", { name: /Recipe Book/ }).click();
  await page.getByRole("menuitemradio", { name: `Set ${recipeSet}`, exact: true }).click();
}

async function prepareDeterministicGame(page: Page, seed = 0x5eed, language: "en" | "ru" | "ka" = "en") {
  const browserErrors: string[] = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text());
  });

  await page.addInitScript(({ key, initialSeed, language }) => {
    localStorage.setItem(key, JSON.stringify({
      state: {
        resolution: "1920x1080",
        quality: "high",
        masterVolume: 0,
        musicVolume: 0,
        sfxVolume: 0,
        presentationSpeed: "fast",
        language,
        tutorialSeen: true,
      },
      version: 0,
    }));

    let state = initialSeed >>> 0;
    Math.random = () => {
      state += 0x6d2b79f5;
      let value = state;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }, { key: SETTINGS_KEY, initialSeed: seed, language });

  await page.goto("/");
  await dismissOpening(page);
  return browserErrors;
}

async function finishAiTurn(page: Page) {
  const fastForward = page.getByRole("button", { name: "Fast-forward all opponents" });
  const market = page.getByText("✦ Black Market ✦", { exact: true });
  const omenChoice = page.getByRole("group", { name: "The omen offers a choice." });
  const roundSummary = page.getByRole("button", { name: /Continue the Ritual/ });
  for (let decision = 0; decision < 24; decision += 1) {
    await expect(fastForward.or(market).or(omenChoice).or(roundSummary)).toBeVisible();
    if (await market.isVisible() || await roundSummary.isVisible()) return;
    if (await fastForward.isVisible()) {
      try {
        await fastForward.click({ timeout: 2_000 });
      } catch {
        // The final opponent can finish and detach the overlay between the
        // visibility check and click. Re-read the resulting phase.
      }
      continue;
    }
    if (await omenChoice.isVisible()) {
      await omenChoice.getByRole("button").first().click();
    }
  }
  await expect(market).toBeVisible();
}

async function resolveOmenChoiceIfOffered(page: Page) {
  const choice = page.getByRole("group", { name: "The omen offers a choice." });
  if (await choice.isVisible()) {
    await choice.getByRole("button").first().click();
  }
}

async function resolvePostBrewChoiceIfOffered(page: Page) {
  const skipSample = page.getByRole("button", { name: "Place none" });
  if (await skipSample.isVisible()) await skipSample.click();
}

async function enableDlc(page: Page, title: "Mirewrought Pacts" | "Veilglass Afflictions") {
  await page.getByRole("button", { name: "DLCs", exact: true }).click();
  const toggle = page.getByRole("button", { name: `Enable DLC: ${title}`, exact: true });
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(page.getByRole("button", { name: `Disable DLC: ${title}`, exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: /Back to Main Menu/ }).click();
}

async function playSafeMatch(page: Page, recipeSet: number, playerCount: 2 | 3 | 4) {
  await openNewGameSetup(page);
  await chooseRecipeSet(page, recipeSet);
  await page.getByRole("button", { name: `${playerCount} players` }).click();
  await beginConfiguredGame(page);

  await completeNineRounds(page);
}

async function completeNineRounds(page: Page) {
  for (let round = 1; round <= 9; round += 1) {
    await expect(page.getByText(`Round ${round} / 9`, { exact: false })).toBeVisible();
    await resolveOmenChoiceIfOffered(page);
    await page.getByRole("button", { name: "✦ Begin Brewing ✦" }).click();
    const omenChoice = page.getByRole("group", { name: "The omen offers a choice." });
    const stopBrewing = page.getByRole("button", { name: "Stop Brewing" });
    await expect(omenChoice.or(stopBrewing)).toBeVisible();
    if (await omenChoice.isVisible()) await omenChoice.getByRole("button").first().click();
    await stopBrewing.click();
    await resolvePostBrewChoiceIfOffered(page);
    await finishAiTurn(page);
    const continueRitual = page.getByRole("button", { name: /Continue the Ritual/ });
    if (await continueRitual.isVisible()) {
      await continueRitual.click();
    }
    await page.getByRole("button", { name: "✦ Leave Market ✦" }).click();
    await page.getByRole("button", { name: "✦ End Round ✦" }).click();
  }

  await expect(page.getByText(/VICTORY|DEFEAT/)).toBeVisible();
  await expect(page.getByRole("button", { name: /Brew Again/ })).toBeVisible();
}

for (const playerCount of [2, 3, 4] as const) {
  for (const recipeSet of [1, 2, 3, 4]) {
    test(`completes nine rounds with ${playerCount} players and recipe set ${recipeSet}`, async ({ page }) => {
      const browserErrors = await prepareDeterministicGame(page, 0x5eed + playerCount * 100 + recipeSet);
      await playSafeMatch(page, recipeSet, playerCount);
      expect(browserErrors).toEqual([]);
    });
  }
}

test("Mirewrought Pacts exclusively unlocks the fifth seat", async ({ page }) => {
  const browserErrors = await prepareDeterministicGame(page, 0xc0de);
  await openNewGameSetup(page);
  await expect(page.getByRole("button", { name: "5 players requires Mirewrought Pacts" })).toBeDisabled();
  await page.getByRole("button", { name: /Main Menu/ }).click();

  await enableDlc(page, "Mirewrought Pacts");
  await openNewGameSetup(page);
  const fifthSeat = page.getByRole("button", { name: "5 players" });
  await expect(fifthSeat).toBeVisible();
  await page.getByRole("button", { name: /Recipe Book/ }).click();
  await expect(page.getByRole("menuitemradio", { name: "Set 5", exact: true })).toBeVisible();
  await expect(page.getByRole("menuitemradio", { name: "Set 6", exact: true })).toBeVisible();
  await page.getByRole("menuitemradio", { name: "Set 5", exact: true }).click();
  await fifthSeat.click();
  await beginConfiguredGame(page);
  const covenantDialog = page.getByRole("dialog", { name: "Choose the Mire Covenants" });
  await expect(covenantDialog).toBeVisible();
  await covenantDialog.getByRole("button", { name: /Moonstep/ }).click();
  await covenantDialog.getByRole("button", { name: "Bind These Covenants" }).click();
  await expect(page.getByText("The Hollow", { exact: true })).toBeVisible();
  await expect(page.getByRole("region", { name: "Mire Covenants" })).toBeVisible();
  await resolveOmenChoiceIfOffered(page);
  await page.getByRole("button", { name: "✦ Begin Brewing ✦" }).click();
  await resolveOmenChoiceIfOffered(page);
  const moonstep = page.getByRole("button", { name: /Moonstep/ });
  await expect(moonstep).toBeEnabled();
  await moonstep.click();
  await expect(moonstep).toBeDisabled();
  expect(browserErrors).toEqual([]);
});

for (const recipeSet of [5, 6] as const) {
  test(`completes nine Mirewrought rounds with recipe set ${recipeSet}`, async ({ page }) => {
    const browserErrors = await prepareDeterministicGame(page, 0xb000 + recipeSet);
    await enableDlc(page, "Mirewrought Pacts");
    await openNewGameSetup(page);
    await chooseRecipeSet(page, recipeSet);
    await page.getByRole("button", { name: "2 players" }).click();
    await beginConfiguredGame(page);

    const covenantDialog = page.getByRole("dialog", { name: "Choose the Mire Covenants" });
    await covenantDialog.getByRole("button").first().click();
    await covenantDialog.getByRole("button", { name: "Bind These Covenants" }).click();
    await completeNineRounds(page);
    expect(browserErrors).toEqual([]);
  });
}

for (const locale of [
  { language: "en", menu: "DLCs", title: "Forbidden Additions", mire: "Mirewrought Pacts" },
  { language: "ru", menu: "Дополнения", title: "Запретные дополнения", mire: "Топкие Пакты" },
  { language: "ka", menu: "გაფართოებები", title: "აკრძალული დამატებები", mire: "ჭაობნაქსოვი პაქტები" },
] as const) {
  test(`localizes the DLC library in ${locale.language}`, async ({ page }) => {
    await prepareDeterministicGame(page, 0xd1c0, locale.language);
    await page.getByRole("button", { name: locale.menu, exact: true }).click();
    await expect(page.getByRole("heading", { name: locale.title, exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: locale.mire, exact: true })).toBeVisible();
  });
}

test("keeps DLC stories and controls reachable on a narrow screen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await prepareDeterministicGame(page, 0xd1c5, "ka");
  await page.getByRole("button", { name: "გაფართოებები", exact: true }).click();
  await expect(page.getByRole("button", { name: "ჭაობნაქსოვი პაქტები", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /DLC-ის ჩართვა:/ }).first()).toBeVisible();
  await page.getByRole("button", { name: "ფარდამინის სენები", exact: true }).click();
  await expect(page.getByRole("heading", { name: "ფარდამინის სენები", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /რელიკვარიუმში დაბრუნება/ })).toBeVisible();
});

test("Veilglass Afflictions adds a persistent Affliction Contract", async ({ page }) => {
  const browserErrors = await prepareDeterministicGame(page, 0xa551);
  await enableDlc(page, "Veilglass Afflictions");
  await openNewGameSetup(page);
  await expect(page.getByRole("button", { name: "Retort Resonance" })).toBeVisible();
  await page.getByRole("button", { name: "Deep Resonance" }).click();
  await beginConfiguredGame(page);
  const contractDialog = page.getByRole("dialog", { name: "Choose an Affliction Contract" });
  await expect(contractDialog).toBeVisible();
  await expect(contractDialog.getByRole("button")).toHaveCount(3);
  await contractDialog.getByRole("button", { name: /Ashen Breath/ }).click();
  await expect(page.getByText("Ashen Breath", { exact: true })).toBeVisible();
  await expect(page.getByText(/Distillate 0/).first()).toBeVisible();
  await expect(page.getByLabel("Veil Retort: 0/8").first()).toBeVisible();
  expect(browserErrors).toEqual([]);
});

test("tutorial and pause flow remain keyboard accessible", async ({ page }) => {
  await page.addInitScript((key) => localStorage.removeItem(key), SETTINGS_KEY);
  await page.goto("/");
  await dismissOpening(page);
  await openNewGameSetup(page);
  await beginConfiguredGame(page);

  const tutorial = page.getByRole("dialog", { name: "Your First Brew" });
  await expect(tutorial).toBeVisible();
  await expect(page.getByRole("button", { name: "Next" })).toBeFocused();
  await page.getByRole("button", { name: "Skip Tutorial" }).click();
  await page.getByRole("button", { name: "✦ Begin Brewing ✦" }).click();

  await page.keyboard.press("Escape");
  const pause = page.getByRole("dialog", { name: "Game Paused" });
  await expect(pause).toBeVisible();
  await expect(page.getByRole("button", { name: "Resume" })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("button", { name: "Main Menu" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Resume" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Pause game" })).toBeFocused();
});

test("new and continued rituals use distinct setup-aware loading screens", async ({ page }) => {
  await prepareDeterministicGame(page, 0x10ad);
  await openNewGameSetup(page);
  await beginConfiguredGame(page);
  await expect(page.locator(".game-loading-new")).toBeVisible();
  await expect(page.getByText("SEALING THE NEW CRUCIBLE", { exact: true })).toBeVisible();
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", /\d+/);
  await expect(page.getByRole("button", { name: "Pause game" })).toBeVisible({ timeout: 30_000 });

  await page.keyboard.press("Escape");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: /Return to Main Menu/ }).click();
  await page.getByRole("button", { name: "Continue Game" }).click();
  await expect(page.locator(".game-loading-continue")).toBeVisible();
  await expect(page.getByText("REKINDLING THE INTERRUPTED BREW", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Pause game" })).toBeVisible({ timeout: 30_000 });
});

test("game stage and animated background fill every viewport without clipped overlays", async ({ page }) => {
  await prepareDeterministicGame(page, 0x16_9);
  await openNewGameSetup(page);
  await beginConfiguredGame(page);

  const stage = page.locator(".game-stage");
  const video = page.locator(".game-background-video");
  await expect(stage).toBeVisible();
  await expect(video).toBeVisible();
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.readyState)).toBeGreaterThanOrEqual(1);

  for (const viewport of [
    { width: 1920, height: 1080 },
    { width: 1200, height: 1000 },
    { width: 1600, height: 700 },
  ]) {
    await page.setViewportSize(viewport);
    const geometry = await stage.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return {
        logicalWidth: element.clientWidth,
        logicalHeight: element.clientHeight,
        renderedWidth: rect.width,
        renderedHeight: rect.height,
      };
    });
    expect(geometry.logicalWidth).toBe(viewport.width);
    expect(geometry.logicalHeight).toBe(viewport.height);
    expect(geometry.renderedWidth).toBeCloseTo(viewport.width, 1);
    expect(geometry.renderedHeight).toBeCloseTo(viewport.height, 1);
  }

  const videoState = await video.evaluate((element: HTMLVideoElement) => ({
    fit: getComputedStyle(element).objectFit,
    width: element.videoWidth,
    height: element.videoHeight,
  }));
  expect(videoState).toEqual({ fit: "cover", width: 1920, height: 1080 });

  const videoBounds = await video.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom };
  });
  expect(videoBounds.left).toBeCloseTo(0, 1);
  expect(videoBounds.top).toBeCloseTo(0, 1);
  expect(videoBounds.right).toBeCloseTo(1600, 1);
  expect(videoBounds.bottom).toBeCloseTo(700, 1);

  await page.keyboard.press("Escape");
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
  await page.getByRole("button", { name: "Settings" }).click();
  await page.getByRole("button", { name: "Previous resolution" }).click();
  await page.getByRole("button", { name: "Previous resolution" }).click();
  await expect(page.getByText("1280 × 720", { exact: true })).toBeVisible();
  await expect.poll(() => stage.evaluate((element) => [element.clientWidth, element.clientHeight])).toEqual([1600, 700]);
});

test("three-opponent cards remain visible in a narrow layout", async ({ page }) => {
  await prepareDeterministicGame(page, 0x4a12);
  await openNewGameSetup(page);
  await page.getByRole("button", { name: "4 players" }).click();
  await beginConfiguredGame(page);
  await page.setViewportSize({ width: 700, height: 900 });

  const cards = page.locator('[data-layout="compact"]');
  await expect(cards).toHaveCount(3);
  await expect(page.locator('[data-layout="compact"][data-state="queued"]')).toHaveCount(3);
  for (const card of await cards.all()) {
    await expect(card).toBeVisible();
    const box = await card.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(700);
  }

  await page.getByRole("button", { name: "✦ Begin Brewing ✦" }).click();
  await page.getByRole("button", { name: "Stop Brewing" }).click();
  await expect(page.locator('[data-layout="compact"][data-state="brewing"]')).toHaveCount(1);
  await finishAiTurn(page);
  await expect(page.locator('[data-layout="compact"]:not([data-state="queued"]):not([data-state="brewing"])')).toHaveCount(3);
});

test("formal rules reference is searchable and responsive", async ({ page }) => {
  await page.setViewportSize({ width: 700, height: 900 });
  await prepareDeterministicGame(page, 0x6a11);
  await page.getByRole("button", { name: "Grimoire" }).click();
  await page.getByRole("button", { name: /Rules/ }).click();

  await expect(page.getByLabel("Authoritative Quick Reference")).toBeVisible();
  await expect(page.getByText("Effect Timing & Decision Order")).toBeVisible();
  const search = page.getByRole("searchbox", { name: "Search the rules…" });
  await search.fill("shared stock");
  await expect(page.getByRole("heading", { name: "Multiplayer Seating & Shared Stock" })).toBeVisible();
  await expect(page.getByText("The Crucible Spiral")).toHaveCount(0);
});

test("Grimoire expansion rules follow enabled DLCs", async ({ page }) => {
  await prepareDeterministicGame(page, 0x6a13);
  await page.getByRole("button", { name: "Grimoire" }).click();
  await page.getByRole("button", { name: /Rules/ }).click();
  await expect(page.getByText("Mire Covenants", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Distillation Phase", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: /Back to Menu/ }).click();

  await enableDlc(page, "Mirewrought Pacts");
  await enableDlc(page, "Veilglass Afflictions");
  await page.getByRole("button", { name: "Grimoire" }).click();
  await page.getByRole("button", { name: /Rules/ }).click();

  await expect(page.getByText("Mire Covenants", { exact: true })).toBeVisible();
  await expect(page.getByText("Abyssal Runoff & Mire Ingredients", { exact: true })).toBeVisible();
  await expect(page.getByText("Distillation Phase", { exact: true })).toBeVisible();
  await expect(page.getByText("Afflictions & Remedy Paths", { exact: true })).toBeVisible();
});

test("all Grimoire tabs remain readable in a narrow layout", async ({ page }) => {
  await page.setViewportSize({ width: 700, height: 900 });
  await prepareDeterministicGame(page, 0x6a12);
  await page.getByRole("button", { name: "Grimoire" }).click();

  const ingredientCards = page.locator(".ingredient-gallery > .ingredient-gallery-item");
  await expect(ingredientCards.first()).toBeVisible();
  expect(await ingredientCards.count()).toBeGreaterThanOrEqual(7);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  await page.getByRole("button", { name: /Omen Cards/ }).click();
  await expect(page.locator(".omen-deck-gallery > .omen-deck-card")).toHaveCount(24);
  await expect(page.locator(".omen-deck-gallery > .omen-deck-card").first()).toBeVisible();

  await page.getByRole("button", { name: /Rules/ }).click();
  await expect(page.getByLabel("Authoritative Quick Reference")).toBeVisible();
});

test("Brewer's Chronicle exposes records, weekly trials, and honors", async ({ page }) => {
  await prepareDeterministicGame(page, 0x6a14);
  await page.getByRole("button", { name: "Brewer’s Chronicle", exact: true }).click();

  await expect(page.getByRole("heading", { name: "Brewer’s Chronicle" })).toBeVisible();
  await expect(page.getByText("The Daily Omen", { exact: true })).toBeVisible();
  await expect(page.getByText("The Turning Trial", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Named Trials" }).click();
  await expect(page.getByText("THIS WEEK’S TURNING SEAL", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: "Answer This Week’s Trial" })).toBeVisible();

  await page.getByRole("button", { name: "Honors & Titles" }).click();
  await expect(page.getByText("First Seal", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Locked" }).first()).toBeDisabled();
});

test("Brewer's Chronicle migrates a version 2 record", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("hexbrewers-chronicle", JSON.stringify({
      version: 2,
      matchesPlayed: 3,
      victories: 2,
      totalPrestige: 51,
      bestPrestige: 21,
      dailyChallengesCompleted: 1,
      dailyVictories: 1,
      currentDailyStreak: 1,
      bestDailyStreak: 1,
      recentMatches: [],
      challengeCompletions: {},
      challengeVictories: {},
      unlockedAchievementIds: ["first_ritual"],
      selectedTitleId: "first_ritual",
    }));
  });
  await prepareDeterministicGame(page, 0x6a15);
  await page.getByRole("button", { name: "Brewer’s Chronicle", exact: true }).click();

  await expect(page.getByText("Recorded title: Initiate of Ashenveil")).toBeVisible();
  await expect(page.locator(".chronicle-ledger")).toContainText("3");
  await expect(page.locator(".chronicle-ledger")).toContainText("67%");
  await page.getByRole("button", { name: "Named Trials" }).click();
  await expect(page.getByRole("button", { name: "Answer This Week’s Trial" })).toBeVisible();
});

test("local preview streams the original Softcurse ident", async ({ request }) => {
  const response = await request.get("/videos/intro/softcurse-systems.mp4", {
    headers: { Range: "bytes=0-1023" },
  });
  expect(response.status()).toBe(206);
  expect(response.headers()["content-type"]).toContain("video/mp4");
  expect((await response.body()).byteLength).toBe(1024);
});

test("reduced-motion preference disables menu animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await dismissOpening(page);
  await expect(page.locator(".menu-room-video")).toHaveCount(0);

  await page.keyboard.press("Tab");
  const focused = page.locator(":focus");
  await expect(focused).toBeVisible();
  expect(await focused.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe("none");
});

test("main menu remains fully visible at a laptop viewport", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await prepareDeterministicGame(page);

  const settings = page.getByRole("button", { name: /Settings/ });
  const footer = page.getByText(/Softcurse Systems/);
  await expect(settings).toBeVisible();
  await expect(footer).toBeVisible();

  const fitsViewport = await footer.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    return bounds.top >= 0 && bounds.bottom <= window.innerHeight;
  });
  expect(fitsViewport).toBe(true);
});

test("settings remain operable in a short narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 700, height: 600 });
  await prepareDeterministicGame(page, 0x5e77);
  await page.getByRole("button", { name: /Settings/ }).click();

  await expect(page.getByRole("tab", { name: "VIDEO" })).toBeVisible();
  await page.getByRole("tab", { name: "LANGUAGE" }).click();
  await expect(page.getByRole("tabpanel")).toBeVisible();
  await expect(page.getByRole("button", { name: /Back to Menu/ })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

for (const locale of [
  { language: "ru" as const, newGame: "Новая Игра", grimoire: "Гримуар", ingredients: /Ингредиенты/ },
  { language: "ka" as const, newGame: "ახალი თამაში", grimoire: "გრიმუარი", ingredients: /ინგრედიენტები/ },
]) {
  test(`loads the ${locale.language} interface without English fallback`, async ({ page }) => {
    await prepareDeterministicGame(page, 0x7a11, locale.language);
    await expect(page.getByRole("button", { name: locale.newGame })).toBeVisible();
    await page.getByRole("button", { name: locale.grimoire }).click();
    await expect(page.getByRole("button", { name: locale.ingredients })).toBeVisible();
    await expect(page.getByRole("button", { name: "New Game" })).toHaveCount(0);
  });
}
