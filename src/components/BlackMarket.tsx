import React, { useMemo, useState } from "react";
import { CORE_ECONOMY_ASSETS, CORE_INGREDIENT_ASSETS } from "../assets/coreAssets";
import { useTranslation } from "../i18n/useTranslation";
import type { MarketItem, BuyPhaseState } from "../game/bazaarTypes";
import type { Player } from "../game/playerTypes";
import { canAfford } from "../game/bazaar";
import { getTokenVisual } from "../pixi/tokenVisuals";
import { getLocalizedTokenName } from "../i18n/tokenNames";
import { analyzeMarketPurchase } from "../game/marketInsights";
import { getRecipeSetForColor, type RecipeBooks } from "../game/recipeBooks";
import type { OmenCard } from "../game/omenTypes";
import "./BlackMarket.css";

interface BlackMarketProps {
  market: MarketItem[];
  player: Player;
  buyPhaseState: BuyPhaseState;
  round: number;
  recipeBooks: RecipeBooks;
  currentOmen: OmenCard | null;
  onBuy: (itemId: string) => void;
  onDone: () => void;
}

export function BlackMarket({ market, player, buyPhaseState, round, recipeBooks, currentOmen, onBuy, onDone }: BlackMarketProps) {
  const t = useTranslation();
  const [inspectedId, setInspectedId] = useState<string | undefined>(undefined);
  const coinsRemaining = buyPhaseState.coinsAvailable - buyPhaseState.coinsSpent;
  const inspectedItem = market.find((item) => item.id === inspectedId);
  const insight = useMemo(() => inspectedItem ? analyzeMarketPurchase(player, inspectedItem) : null, [inspectedItem, player]);
  const recipeKey = inspectedItem ? recipeKeyForColor(inspectedItem.token.color) : null;
  const recipeSet = inspectedItem ? getRecipeSetForColor(recipeBooks, inspectedItem.token.color) : 1;
  const recipeEffect = recipeKey ? t.grimoireRecipeSets[recipeKey]?.[recipeSet - 1]?.effect : undefined;
  const omenContext = inspectedItem && currentOmen
    ? getOmenContext(inspectedItem, currentOmen, t.marketScreen.context)
    : t.marketScreen.context.noOmen;
  const alreadyBoughtColor = buyPhaseState.purchases.length === 1
    ? market.find((item) => item.id === buyPhaseState.purchases[0])?.token.color
    : undefined;
  const inspectedPurchased = Boolean(inspectedItem && buyPhaseState.purchases.includes(inspectedItem.id));
  const inspectedLocked = Boolean(inspectedItem && round < inspectedItem.unlockRound);
  const inspectedSoldOut = Boolean(inspectedItem && inspectedItem.stock <= 0);
  const canBuyInspected = Boolean(inspectedItem && canAfford(inspectedItem, buyPhaseState, round, alreadyBoughtColor));

  return (
    <div className="black-market">
      <video className="black-market__video" src="/videos/market/black-market-idle-loop.mp4" poster="/images/black_market_bg.jpg" autoPlay muted loop playsInline aria-hidden="true" />
      <div className="black-market__shade" />
      <main className={`black-market__scene ${inspectedItem ? "has-ledger" : ""}`} aria-label={t.marketScreen.title}>
        <header className="black-market__header">
          <div>
            <p className="black-market__eyebrow">Tarnished wares · whispered prices</p>
            <h1>{removeDecorativeFigures(t.marketScreen.title)}</h1>
            <p>{t.marketScreen.subtitle}</p>
          </div>
          <div className="black-market__coin-purse" aria-label={`${cleanCoinLabel(t.marketScreen.coinsAvailable)} ${coinsRemaining}`}>
            <img src={CORE_ECONOMY_ASSETS.coin} alt="" aria-hidden="true" />
            <span>{cleanCoinLabel(t.marketScreen.coinsAvailable)}</span>
            <strong>{coinsRemaining}</strong>
            <small>/ {buyPhaseState.coinsAvailable}</small>
          </div>
        </header>

        <div className="black-market__counter">
          <section className="specimen-cabinet" aria-label="Market stock">
            <div className="specimen-cabinet__heading">
              <span>Merchant's specimens</span>
              <small>Select a vessel to inspect its bargain</small>
            </div>
            <div className="specimen-cabinet__grid">
              {market.map((item) => {
                const visual = getTokenVisual(item.token.color);
                const accent = `#${visual.border.toString(16).padStart(6, "0")}`;
                const purchased = buyPhaseState.purchases.includes(item.id);
                const locked = round < item.unlockRound;
                const soldOut = item.stock <= 0;
                const canBuy = canAfford(item, buyPhaseState, round, alreadyBoughtColor);
                const ingredientAsset = CORE_INGREDIENT_ASSETS[item.token.color as keyof typeof CORE_INGREDIENT_ASSETS];
                const classNames = ["market-specimen", item.id === inspectedItem?.id ? "is-selected" : "", locked ? "is-locked" : "", soldOut ? "is-sold" : "", purchased ? "is-purchased" : "", canBuy ? "can-buy" : ""].filter(Boolean).join(" ");
                return (
                  <div
                    key={item.id}
                    data-market-item-id={item.id}
                    className={classNames}
                    style={{ ["--specimen-accent" as string]: accent } as React.CSSProperties}
                    role="button"
                    tabIndex={0}
                    aria-pressed={item.id === inspectedItem?.id}
                    onClick={() => setInspectedId((current) => current === item.id ? undefined : item.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setInspectedId((current) => current === item.id ? undefined : item.id);
                      }
                    }}
                  >
                    <div className="market-specimen__glass">
                      {ingredientAsset ? <img src={ingredientAsset} alt="" /> : <span>{visual.symbol}</span>}
                      <b>{item.token.color === "echo" ? "?" : item.token.value}</b>
                    </div>
                    <div className="market-specimen__label">
                      <strong>{getLocalizedTokenName(item.token.color, t, item.token.value)}</strong>
                      <span>{locked ? `${t.marketScreen.lockedUntilRound} ${item.unlockRound}` : soldOut ? t.marketScreen.sold : purchased ? t.marketScreen.purchased : `⬡ ${item.cost}`}</span>
                    </div>
                    {(locked || soldOut) && <i className="market-specimen__seal" aria-hidden="true">⌾</i>}
                  </div>
                );
              })}
            </div>
          </section>

          {inspectedItem && insight && (
            <aside className="merchant-ledger" aria-live="polite">
              <button type="button" className="merchant-ledger__close" onClick={() => setInspectedId(undefined)} aria-label="Close merchant ledger">×</button>
              <div className="merchant-ledger__top">
                <div className="merchant-ledger__portrait">
                  <img src={CORE_INGREDIENT_ASSETS[inspectedItem.token.color as keyof typeof CORE_INGREDIENT_ASSETS]} alt="" />
                </div>
                <div>
                  <span className="merchant-ledger__kicker">Merchant ledger · lot {String(market.indexOf(inspectedItem) + 1).padStart(2, "0")}</span>
                  <h2>{getLocalizedTokenName(inspectedItem.token.color, t, inspectedItem.token.value)}</h2>
                  <p>{t.marketScreen.roles[insight.role]} · {t.marketScreen.value} {inspectedItem.token.color === "echo" ? "?" : inspectedItem.token.value}</p>
                </div>
                <div className="merchant-ledger__price"><small>PRICE</small><strong>⬡ {inspectedItem.cost}</strong></div>
              </div>

              <div className="merchant-ledger__facts">
                <ImpactFact label={t.marketScreen.bagAfterPurchase} value={`${player.bag.tokens.length} → ${player.bag.tokens.length + 1}`} />
                <ImpactFact label={t.marketScreen.voidshardDensity} value={`${Math.round(insight.voidshardShareBefore * 100)}% → ${Math.round(insight.voidshardShareAfter * 100)}%`} tone={insight.voidshardShareChange < 0 ? "good" : insight.voidshardShareChange > 0 ? "danger" : undefined} />
                <ImpactFact label={t.marketScreen.ownedMatching} value={String(insight.ownedMatching)} />
                <ImpactFact label={t.marketScreen.coinsAfterPurchase} value={String(Math.max(0, coinsRemaining - inspectedItem.cost))} />
              </div>

              <LedgerEntry label={t.marketScreen.activeRecipe} value={recipeEffect ?? t.marketScreen.context.fixedEffect} />
              <LedgerEntry label={t.marketScreen.synergy} value={t.marketScreen.synergies[insight.synergy]} />
              <LedgerEntry label={t.marketScreen.whyNow} value={omenContext} />
              <p className="merchant-ledger__caveat">{t.marketScreen.impactCaveat}</p>

              <div className="merchant-ledger__action">
                {inspectedPurchased ? <span className="ledger-status is-purchased">✓ {t.marketScreen.purchased}</span>
                  : inspectedLocked ? <span className="ledger-status">{t.marketScreen.lockedUntilRound} {inspectedItem.unlockRound}</span>
                  : inspectedSoldOut ? <span className="ledger-status">{t.marketScreen.sold}</span>
                  : <button type="button" disabled={!canBuyInspected} onClick={() => onBuy(inspectedItem.id)}>{t.marketScreen.buy} · ⬡ {inspectedItem.cost}</button>}
              </div>
            </aside>
          )}
        </div>

        <button type="button" className="black-market__leave" onClick={onDone}>{removeDecorativeFigures(t.marketScreen.leaveMarket)}</button>
      </main>
    </div>
  );
}

function ImpactFact({ label, value, tone }: { label: string; value: string; tone?: "good" | "danger" }) {
  return <div className={`ledger-fact ${tone ? `is-${tone}` : ""}`}><span>{label}</span><strong>{value}</strong></div>;
}

function LedgerEntry({ label, value }: { label: string; value: string }) {
  return <div className="merchant-ledger__entry"><span>{label}</span><p>{value}</p></div>;
}

function recipeKeyForColor(color: MarketItem["token"]["color"]): string | null {
  switch (color) {
    case "blue": return "Frostbile";
    case "red": return "Bloodthorn";
    case "yellow": return "Plaguedust";
    case "green": return "Deathweave";
    case "purple": return "Wraithbloom";
    default: return null;
  }
}

function getOmenContext(item: MarketItem, omen: OmenCard, copy: BlackMarketCopy["context"]): string {
  const effect = omen.effect;
  if (effect.type === "bonus_for_color" && effect.color === item.token.color) return copy.matchingColor;
  if (effect.type === "bonus_for_white_limit" && item.token.color !== "white") return copy.saferBag;
  if (effect.type === "double_ruby_space" && ["blue", "red", "yellow"].includes(item.token.color)) return copy.rubyPositioning;
  if (effect.type === "orange_extra_movement" && item.token.color === "orange") return copy.orangeMovement;
  return copy.neutral;
}

type BlackMarketCopy = ReturnType<typeof useTranslation>["marketScreen"];

function removeDecorativeFigures(value: string): string {
  return value.replace(/[✦◆◇❖]/g, "").replace(/\s{2,}/g, " ").trim();
}

function cleanCoinLabel(value: string): string {
  return value.replace(/^[\s⬡◇◈◆]+/, "").trim();
}
