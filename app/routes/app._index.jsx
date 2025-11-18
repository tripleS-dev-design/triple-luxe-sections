// app/routes/app._index.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useRouteLoaderData } from "@remix-run/react";
import {
  Page,
  Card,
  BlockStack,
  InlineStack,
  Text,
  Button,
  Box,
  Badge,
  Select,
  Icon,
} from "@shopify/polaris";
import * as PI from "@shopify/polaris-icons";

/* ======================= LAYOUT / CSS GLOBAL ======================= */

const LAYOUT_CSS = `
  html, body { margin:0; background:#F6F7F9; }

  /* on enlève les bordures et le max-width de Polaris */
  .Polaris-Page,
  .Polaris-Page__Content {
    max-width:none !important;
    padding-left:0 !important;
    padding-right:0 !important;
  }

  /* Header principal Shopify (titre de la page) */
  .Polaris-Page-Header {
    padding: 12px 24px;
    background:#F9FAFB;
    border-bottom:1px solid #E5E7EB;
  }

  .Polaris-Page-Header__TitleWrapper {
    display:inline-flex;
    align-items:center;
    gap:10px;
    padding:8px 14px;
    border-radius:999px;
    background:linear-gradient(135deg,#000000,#4C1D95,#7C3AED);
    color:#fff;
    box-shadow:0 10px 24px rgba(15,23,42,0.35);
  }

  .Polaris-Header-Title,
  .Polaris-Header-Title__Title,
  .Polaris-Header-Title__Subtitle {
    color:#F9FAFB !important;
  }

  .tls-shell {
    padding:16px 24px 32px 24px;
  }

  /* grille générale : rail gauche + contenu + colonne droite */
  .tls-editor {
    display:grid;
    grid-template-columns: 320px minmax(0, 3fr) minmax(260px, 1.2fr);
    gap:16px;
    align-items:start;
  }

  @media (max-width: 1200px) {
    .tls-editor {
      grid-template-columns: 280px minmax(0, 3fr);
    }
    .tls-side-col {
      display:none;
    }
  }

  @media (max-width: 960px) {
    .tls-editor {
      grid-template-columns: minmax(0, 1fr);
    }
    .tls-rail {
      position:static;
      max-height:none;
    }
  }

  /* rail gauche */
  .tls-rail {
    position:sticky;
    top:80px;
    max-height:calc(100vh - 96px);
    overflow:auto;
  }
  .tls-rail-card {
    background:#fff;
    border:1px solid #E5E7EB;
    border-radius:12px;
  }
  .tls-rail-head {
    padding:10px 12px;
    border-bottom:1px solid #E5E7EB;
    font-weight:700;
    font-size:13px;
  }
  .tls-rail-list {
    padding:8px;
    display:grid;
    gap:8px;
  }
  .tls-rail-item {
    display:grid;
    grid-template-columns:28px 1fr;
    gap:8px;
    align-items:center;
    padding:8px 10px;
    border-radius:10px;
    border:1px solid #E5E7EB;
    background:#FFF;
    cursor:pointer;
  }
  .tls-rail-item[data-sel="1"] {
    outline:2px solid #7C3AED;
    box-shadow:0 0 0 1px rgba(124,58,237,0.25);
  }
  .tls-rail-mini {
    margin-top:4px;
    border-radius:8px;
    padding:4px 6px;
    background:#F9FAFB;
    border:1px dashed #E5E7EB;
    font-size:11px;
    color:#6B7280;
  }

  /* colonne centrale */
  .tls-main-col {
    display:grid;
    gap:16px;
  }

  .tls-guide-title {
    padding:10px 12px;
    border-radius:10px;
    background:#F2F6FF;
    border:1px solid #C7D2FE;
    color:#0C4A6E;
    font-weight:800;
    margin-bottom:10px;
  }

  .tls-step-card {
    border-radius:10px;
    border:1px solid #E5E7EB;
    background:#FFF;
    padding:10px 10px;
  }

  .tls-blocks-card-header {
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:8px;
    margin-bottom:8px;
  }

  .tls-blocks-chip {
    padding:4px 8px;
    border-radius:999px;
    font-size:11px;
    font-weight:600;
    background:rgba(15,23,42,0.08);
  }

  /* grille des blocs violets */
  .tls-blocks-grid {
    display:grid;
    grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
    gap:16px;
  }

  .tls-block-header-pill {
    display:flex;
    align-items:center;
    gap:8px;
    padding:8px 12px;
    border-radius:999px;
    background:linear-gradient(135deg,#4C1D95,#7C3AED);
    color:#FFF;
  }

  .tls-block-group-tag {
    margin-left:auto;
    padding:2px 8px;
    border-radius:999px;
    font-size:11px;
    font-weight:600;
    background:rgba(15,23,42,0.38);
  }

  /* colonne droite */
  .tls-side-col {
    position:sticky;
    top:80px;
    max-height:calc(100vh - 96px);
    overflow:auto;
    display:grid;
    gap:16px;
  }

  .tls-note-list {
    margin-top:8px;
    display:grid;
    gap:6px;
    font-size:13px;
  }

  /* bouton YouTube flottant */
  .tls-youtube-btn {
    position:fixed;
    left:24px;
    bottom:24px;
    border:none;
    border-radius:999px;
    padding:10px 18px;
    background:linear-gradient(135deg,#111827,#4C1D95,#7C3AED);
    color:#fff;
    font-weight:600;
    cursor:pointer;
    box-shadow:0 10px 24px rgba(15,23,42,0.35);
    z-index:60;
  }

  @media (max-width: 640px){
    .tls-youtube-btn { left:16px; bottom:16px; padding:8px 14px; font-size:12px; }
  }
`;

function InjectCssOnce() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById("tls-layout-css-admin")) return;
    const t = document.createElement("style");
    t.id = "tls-layout-css-admin";
    t.appendChild(document.createTextNode(LAYOUT_CSS));
    document.head.appendChild(t);
  }, []);
}

/* ======================= UTIL: shopSub / apiKey depuis app.jsx ======================= */

function useParentData() {
  // id du loader de app.jsx
  return useRouteLoaderData("routes/app") || { shopSub: "", apiKey: "" };
}

/* ======================= Deep links Theme Editor ======================= */

function editorBase({ shopSub }) {
  return `https://admin.shopify.com/store/${shopSub}/themes/current/editor`;
}

function makeAddBlockLink({
  shopSub,
  apiKey,
  template = "index",
  handle,
  target = "main",
}) {
  const base = editorBase({ shopSub });
  const p = new URLSearchParams({
    context: "apps",
    template,
    addAppBlockId: `${apiKey}/${handle}`,
    target,
    enable_app_theme_extension_dev_preview: "1",
  });
  return `${base}?${p.toString()}`;
}

/* ======================= Langues & textes ======================= */

const LANG_OPTIONS = [
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
  { value: "es", label: "Español" },
  { value: "it", label: "Italiano" },
  { value: "de", label: "Deutsch" },
  { value: "ar", label: "العربية" },
];

const COPY = {
  en: {
    langLabel: "Language",
    guideTitle: "How to use Triple-Luxe-Sections",
    guideIntro:
      "Use this quick guide to add each block from the app into your Shopify theme.",
    guideSteps: [
      "Open your Theme Editor and choose the page where you want to add sections.",
      "Click “Add section” or “Add block” in the Apps area on the left.",
      "From this app page, click “Add to theme” on the block you want to install.",
      "Back in the Theme Editor, customise text, colours and images for your store.",
    ],
    blocksIntroTitle: "Blocks & sections",
    blocksIntroText:
      'Each card below is a block. Click “Add to theme”, then use “See how to install” to open the matching video tutorial.',
    addToTheme: "Add to theme",
    openEditor: "Open editor",
    seeHowToInstall: "See how to install",
    sideNotesTitle: "Quick notes",
  },
  fr: {
    langLabel: "Langue",
    guideTitle: "Comment utiliser Triple-Luxe-Sections",
    guideIntro:
      "Suis ce guide rapide pour ajouter chaque bloc de l’app dans ton thème Shopify.",
    guideSteps: [
      "Ouvre l’éditeur de thème et choisis la page où tu veux ajouter les sections.",
      "Clique sur « Ajouter une section » ou « Ajouter un bloc » dans la zone Applications à gauche.",
      "Depuis cette page, clique sur « Add to theme » sur le bloc que tu veux installer.",
      "Retourne dans l’éditeur de thème pour personnaliser le texte, les couleurs et les images.",
    ],
    blocksIntroTitle: "Blocs & sections",
    blocksIntroText:
      "Chaque carte ci-dessous est un bloc. Clique sur « Add to theme », puis « Voir comment installer » pour ouvrir la vidéo tutorielle.",
    addToTheme: "Add to theme",
    openEditor: "Open editor",
    seeHowToInstall: "Voir comment installer",
    sideNotesTitle: "Notes rapides",
  },
  es: {
    langLabel: "Idioma",
    guideTitle: "Cómo usar Triple-Luxe-Sections",
    guideIntro:
      "Usa esta guía rápida para añadir los bloques de la app a tu tema de Shopify.",
    guideSteps: [
      "Abre el editor de temas y elige la página donde quieres añadir secciones.",
      "Haz clic en «Agregar sección» o «Agregar bloque» en el área de aplicaciones.",
      "Desde esta página, haz clic en «Add to theme» en el bloque que quieres instalar.",
      "En el editor de temas, personaliza textos, colores e imágenes.",
    ],
    blocksIntroTitle: "Bloques & secciones",
    blocksIntroText:
      "Cada tarjeta es un bloque. Haz clic en «Add to theme» y luego en «See how to install» para ver el vídeo explicativo.",
    addToTheme: "Add to theme",
    openEditor: "Open editor",
    seeHowToInstall: "Ver cómo instalar",
    sideNotesTitle: "Notas rápidas",
  },
  it: {
    langLabel: "Lingua",
    guideTitle: "Come usare Triple-Luxe-Sections",
    guideIntro:
      "Segui questa guida rapida per aggiungere i blocchi dell’app al tuo tema Shopify.",
    guideSteps: [
      "Apri il Theme Editor e scegli la pagina dove vuoi aggiungere le sezioni.",
      "Clicca «Aggiungi sezione» o «Aggiungi blocco» nell’area App.",
      "Da questa pagina, clicca «Add to theme» sul blocco che vuoi installare.",
      "Nel Theme Editor personalizza testi, colori e immagini.",
    ],
    blocksIntroTitle: "Blocchi & sezioni",
    blocksIntroText:
      "Ogni card è un blocco. Clicca «Add to theme» e poi «See how to install» per aprire il video tutorial.",
    addToTheme: "Add to theme",
    openEditor: "Open editor",
    seeHowToInstall: "Vedi come installare",
    sideNotesTitle: "Note rapide",
  },
  de: {
    langLabel: "Sprache",
    guideTitle: "So benutzt du Triple-Luxe-Sections",
    guideIntro:
      "Nutze diese kurze Anleitung, um die App-Blöcke in dein Shopify-Theme einzufügen.",
    guideSteps: [
      "Öffne den Theme-Editor und wähle die Seite, auf der du Sektionen hinzufügen möchtest.",
      "Klicke auf „Abschnitt hinzufügen“ oder „Block hinzufügen“ im Apps-Bereich.",
      "Klicke auf dieser Seite bei dem gewünschten Block auf „Add to theme“.",
      "Passe anschließend im Theme-Editor Texte, Farben und Bilder an.",
    ],
    blocksIntroTitle: "Blöcke & Sektionen",
    blocksIntroText:
      "Jede Karte ist ein Block. Klicke „Add to theme“ und dann „See how to install“, um das Video-Tutorial zu öffnen.",
    addToTheme: "Add to theme",
    openEditor: "Open editor",
    seeHowToInstall: "Installationsvideo ansehen",
    sideNotesTitle: "Schnelle Hinweise",
  },
  ar: {
    langLabel: "اللغة",
    guideTitle: "طريقة استخدام Triple-Luxe-Sections",
    guideIntro:
      "استعمل هذا الدليل السريع لإضافة البلوكات من التطبيق إلى قالب Shopify.",
    guideSteps: [
      "افتح محرر القالب واختر الصفحة التي تريد إضافة السكشن فيها.",
      "اضغط «Add section» أو «Add block» داخل قسم التطبيقات.",
      "من هذه الصفحة، اضغط «Add to theme» على البلوك الذي تريد تثبيته.",
      "بعدها عدّل النصوص والألوان والصور من داخل محرر القالب.",
    ],
    blocksIntroTitle: "البلوكات و السكشن",
    blocksIntroText:
      "كل كارت هنا هو بلوك. اضغط «Add to theme» ثم «See how to install» لمشاهدة فيديو الشرح.",
    addToTheme: "Add to theme",
    openEditor: "Open editor",
    seeHowToInstall: "طريقة التثبيت",
    sideNotesTitle: "ملاحظات سريعة",
  },
};

/* ======================= Blocks (mêmes handles que ton repo) ======================= */

const BLOCKS = [
  {
    handle: "header-informatique",
    title: "Header — Tech",
    group: "Tech",
    description: "Logo, search, utilities, quick links.",
    template: "index",
    icon: PI.ThemeEditIcon,
    videoUrl: "#",
  },
  {
    handle: "banner-kenburns",
    title: "Ken Burns Banner",
    group: "Tech",
    description: "3 slides, fade + smooth zoom/pan.",
    template: "index",
    icon: PI.ImageIcon,
    videoUrl: "#",
  },
  {
    handle: "carousel-cercle",
    title: "Circle Carousel",
    group: "Tech",
    description: "Circular image scrolling.",
    template: "index",
    icon: PI.AppsIcon,
    videoUrl: "#",
  },
  {
    handle: "product-grid-glow",
    title: "Product Grid (Glow)",
    group: "Tech",
    description: "Showcase products with glow style.",
    template: "index",
    icon: PI.AppsIcon,
    videoUrl: "#",
  },
  {
    handle: "packs-descriptifs",
    title: "Descriptive Packs",
    group: "Tech",
    description: "Product cards + lists & badges.",
    template: "index",
    icon: PI.StarIcon,
    videoUrl: "#",
  },
  {
    handle: "social-icons",
    title: "Social Icons",
    group: "Tech",
    description: "Stylish social links, variants.",
    template: "index",
    icon: PI.AppsIcon,
    videoUrl: "#",
  },
  {
    handle: "footer-liens",
    title: "Footer — Links",
    group: "Shared",
    description: "2–4 link columns.",
    template: "index",
    icon: PI.ViewIcon,
    videoUrl: "#",
  },
  {
    handle: "t2-header-fashion",
    title: "Header — Fashion",
    group: "Fashion",
    description: "Fashion header, clean and airy.",
    template: "index",
    icon: PI.ThemeEditIcon,
    videoUrl: "#",
  },
  {
    handle: "t2-hero-runway",
    title: "Hero — Runway",
    group: "Fashion",
    description: "Runway hero with collection CTA.",
    template: "index",
    icon: PI.ImageIcon,
    videoUrl: "#",
  },
  {
    handle: "t2-categories-pills",
    title: "Categories (pills)",
    group: "Fashion",
    description: "Filters/tabs styled as pills.",
    template: "index",
    icon: PI.AppsIcon,
    videoUrl: "#",
  },
  {
    handle: "t2-products-grid",
    title: "Product Grid (Fashion)",
    group: "Fashion",
    description: "Responsive grid adapted for fashion.",
    template: "index",
    icon: PI.AppsIcon,
    videoUrl: "#",
  },
  {
    handle: "t2-social-proof",
    title: "Social Proof",
    group: "Fashion",
    description: "Testimonials / customer reviews.",
    template: "index",
    icon: PI.StarIcon,
    videoUrl: "#",
  },
  {
    handle: "tls3-hero-brand-video-pro",
    title: "Hero Video — Brand Pro",
    group: "Pro",
    description: "Large hero video or key visual.",
    template: "index",
    icon: PI.ImageIcon,
    videoUrl: "#",
  },
  {
    handle: "tls3-founders-story-pro",
    title: "Founders’ Story",
    group: "Pro",
    description: "Founders’ story + photo layout.",
    template: "index",
    icon: PI.StarIcon,
    videoUrl: "#",
  },
];

/* ======================= NAV gauche ======================= */

const NAV_ITEMS = [
  {
    id: "guide",
    label: "Guide",
    desc: "Steps to add and configure the blocks.",
    icon: PI.AppsIcon,
  },
  {
    id: "blocks",
    label: "Blocks library",
    desc: "All sections included in Triple-Luxe-Sections.",
    icon: PI.ThemeEditIcon,
  },
  {
    id: "theme",
    label: "Theme editor",
    desc: "Open your Shopify Theme Editor.",
    icon: PI.ViewIcon,
  },
  {
    id: "support",
    label: "Support",
    desc: "YouTube tutorials & Tawk.to chat.",
    icon: PI.ChatIcon || PI.AppsIcon,
  },
];

/* ======================= Carte bloc violet ======================= */

function BlockCard({ block, shopSub, apiKey, t }) {
  const IconSrc = block.icon || PI.AppsIcon;

  const addUrl = makeAddBlockLink({
    shopSub,
    apiKey,
    template: block.template,
    handle: block.handle,
  });

  const editorUrl = editorBase({ shopSub });

  return (
    <Card>
      <Box padding="300">
        <BlockStack gap="300">
          <div className="tls-block-header-pill">
            <Icon source={IconSrc} />
            <Text as="h3" variant="headingSm">
              {block.title}
            </Text>
            <span className="tls-block-group-tag">{block.group}</span>
          </div>

          {block.description ? (
            <Text as="p" tone="subdued">
              {block.description}
            </Text>
          ) : null}

          <InlineStack gap="200" wrap>
            <Button url={addUrl} target="_top" variant="primary">
              {t.addToTheme}
            </Button>
            <Button url={editorUrl} target="_blank" external>
              {t.openEditor}
            </Button>
            <Button
              url={block.videoUrl || "#"}
              target="_blank"
              external
              icon={PI.VideoIcon || PI.PlayIcon}
            >
              {t.seeHowToInstall}
            </Button>
          </InlineStack>
        </BlockStack>
      </Box>
    </Card>
  );
}

/* ======================= Composant principal ======================= */

const YOUTUBE_URL = "https://www.youtube.com"; // remplace par ta vraie chaîne

function TawkScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
(function(){
  var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
  s1.async=true;
  s1.src='https://embed.tawk.to/68fd2c098f570d1956b50811/1j8ef81r3';
  s1.charset='UTF-8';
  s1.setAttribute('crossorigin','*');
  s0.parentNode.insertBefore(s1,s0);
})();
      `,
      }}
    />
  );
}

export default function TLSAdminIndex() {
  const { shopSub, apiKey } = useParentData();
  const [lang, setLang] = useState("fr");
  const [navSel, setNavSel] = useState("blocks");

  const t = useMemo(() => COPY[lang] || COPY.en, [lang]);

  const scrollToAnchor = (id) => {
    if (typeof document === "undefined") return;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleNavClick = (item) => {
    setNavSel(item.id);
    if (item.id === "guide") scrollToAnchor("tls-guide");
    if (item.id === "blocks") scrollToAnchor("tls-blocks");
    if (item.id === "theme") window.open(editorBase({ shopSub }), "_blank");
    if (item.id === "support") {
      try {
        if (window.Tawk_API && typeof window.Tawk_API.maximize === "function") {
          window.Tawk_API.maximize();
          return;
        }
      } catch {}
      window.open(YOUTUBE_URL, "_blank");
    }
  };

  return (
    <>
      <InjectCssOnce />

      <Page
        fullWidth
        title="Triple-Luxe-Sections"
        subtitle="Blocks & guide in one interface"
      >
        <div className="tls-shell">
          <div className="tls-editor">
            {/* ================== Rail gauche ================== */}
            <div className="tls-rail">
              <div className="tls-rail-card">
                <div className="tls-rail-head">Navigation</div>
                <div className="tls-rail-list">
                  {NAV_ITEMS.map((item) => (
                    <div
                      key={item.id}
                      className="tls-rail-item"
                      data-sel={navSel === item.id ? 1 : 0}
                      onClick={() => handleNavClick(item)}
                    >
                      <div>
                        <Icon source={item.icon || PI.AppsIcon} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>
                          {item.label}
                        </div>
                        <div className="tls-rail-mini">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ================== Colonne centrale ================== */}
            <div className="tls-main-col">
              {/* GUIDE */}
              <div id="tls-guide">
                <Card>
                  <Box padding="300">
                    <BlockStack gap="200">
                      <div className="tls-guide-title">{t.guideTitle}</div>
                      <Text as="p" tone="subdued">
                        {t.guideIntro}
                      </Text>

                      <BlockStack gap="150">
                        {t.guideSteps.map((step, idx) => (
                          <div key={idx} className="tls-step-card">
                            <InlineStack gap="200" blockAlign="center">
                              <div
                                style={{
                                  width: 26,
                                  height: 26,
                                  borderRadius: 8,
                                  background: "#000",
                                  color: "#fff",
                                  display: "grid",
                                  placeItems: "center",
                                  fontSize: 12,
                                  fontWeight: 800,
                                }}
                              >
                                {idx + 1}
                              </div>
                              <Text as="p">{step}</Text>
                            </InlineStack>
                          </div>
                        ))}
                      </BlockStack>
                    </BlockStack>
                  </Box>
                </Card>
              </div>

              {/* INTRO + LANG + NB BLOCS */}
              <div id="tls-blocks">
                <Card>
                  <Box padding="300">
                    <div className="tls-blocks-card-header">
                      <InlineStack gap="200" blockAlign="center">
                        <Icon source={PI.ThemeEditIcon} />
                        <Text as="h2" variant="headingSm">
                          {t.blocksIntroTitle}
                        </Text>
                        <Badge tone="success">{BLOCKS.length} blocks</Badge>
                      </InlineStack>

                      <InlineStack gap="100" blockAlign="center">
                        <Text as="span" tone="subdued">
                          {t.langLabel}:
                        </Text>
                        <Select
                          options={LANG_OPTIONS}
                          value={lang}
                          onChange={setLang}
                        />
                      </InlineStack>
                    </div>

                    <Text as="p" tone="subdued">
                      {t.blocksIntroText}
                    </Text>
                  </Box>
                </Card>
              </div>

              {/* GRILLE DES BLOCS */}
              <div className="tls-blocks-grid">
                {BLOCKS.map((block) => (
                  <BlockCard
                    key={block.handle}
                    block={block}
                    shopSub={shopSub}
                    apiKey={apiKey}
                    t={t}
                  />
                ))}
              </div>
            </div>

            {/* ================== Colonne droite ================== */}
            <div className="tls-side-col">
              <Card>
                <Box padding="300">
                  <BlockStack gap="200">
                    <InlineStack gap="200" blockAlign="center">
                      <Icon source={PI.StarIcon} />
                      <Text as="h3" variant="headingSm">
                        {t.sideNotesTitle}
                      </Text>
                    </InlineStack>
                    <div className="tls-note-list">
                      <Text as="p">
                        • Commence par installer les headers et le hero sur ta
                        page principale.
                      </Text>
                      <Text as="p">
                        • Utilise les carrousels et grids produits sur les
                        landing pages ou collections.
                      </Text>
                      <Text as="p">
                        • Garde le même style (couleurs, typo) que ton thème
                        principal pour un rendu pro.
                      </Text>
                      <Text as="p">
                        • Si tu bloques, ouvre le chat Tawk.to ou la vidéo
                        YouTube pour voir un exemple réel.
                      </Text>
                    </div>
                  </BlockStack>
                </Box>
              </Card>
            </div>
          </div>
        </div>

        {/* Bouton YouTube flottant */}
        <button
          className="tls-youtube-btn"
          type="button"
          onClick={() => window.open(YOUTUBE_URL, "_blank")}
        >
          YouTube
        </button>
      </Page>

      {/* Support Tawk.to */}
      <TawkScript />
    </>
  );
}
