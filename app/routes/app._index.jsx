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

/* ======================= CSS LAYOUT ======================= */

const LAYOUT_CSS = `
  html, body { margin:0; background:#F6F7F9; }

  .Polaris-Page,
  .Polaris-Page__Content {
    max-width:none !important;
    padding-left:0 !important;
    padding-right:0 !important;
  }

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

/* ======================= Parent loader data (app.jsx) ======================= */

function useParentData() {
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
    guideTitle: "How to use Luxe Sections & Blocks",
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
  // ... tu peux garder les autres langues comme tu les avais
};

/* ======================= Blocs ======================= */

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
  // ... le reste de tes blocs comme avant
];

/* ======================= Carte bloc ======================= */

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

          {block.description && (
            <Text as="p" tone="subdued">
              {block.description}
            </Text>
          )}

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

const YOUTUBE_URL = "https://www.youtube.com";

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
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
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
        title="Luxe Sections & Blocks"
        subtitle="Blocks & guide in one interface"
      >
        <div className="tls-shell">
          <div className="tls-editor">
            {/* Rail gauche */}
            <div className="tls-rail">
              <div className="tls-rail-card">
                <div className="tls-rail-head">Navigation</div>
                <div className="tls-rail-list">
                  {/* Tu remets ici NAV_ITEMS comme tu les avais */}
                </div>
              </div>
            </div>

            {/* Colonne centrale */}
            <div className="tls-main-col">
              {/* Guide + blocs : pareil que ta version précédente */}
            </div>

            {/* Colonne droite */}
            <div className="tls-side-col">
              {/* Notes rapides comme avant */}
            </div>
          </div>
        </div>

        <button
          className="tls-youtube-btn"
          type="button"
          onClick={() => window.open(YOUTUBE_URL, "_blank")}
        >
          YouTube
        </button>
      </Page>

      <TawkScript />
    </>
  );
}
