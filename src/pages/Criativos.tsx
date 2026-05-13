import { useState, useMemo, memo, useCallback } from "react";
import { videoProducts } from "@/data/videoProducts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { 
  Play, Eye, Heart, ShoppingCart, Clock, Check,
  Crown, Medal, Trophy, Flame, FileText, ChevronDown,
  ChevronUp, Sparkles, TrendingUp, Video, Zap, BarChart3,
  X, ExternalLink
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";

import thumbVideo1 from "@/assets/thumb-video-1.jpg";
import thumbVideo2 from "@/assets/thumb-video-2.jpg";
import thumbVideo3 from "@/assets/thumb-video-3.jpg";
import thumbVideo4 from "@/assets/thumb-video-4.jpg";
import thumbVideo5 from "@/assets/thumb-video-5.jpg";
import thumbAttracione1 from "@/assets/thumb-attracione-1.jpg";
import thumbAttracione2 from "@/assets/thumb-attracione-2.jpg";
import thumbAttracione3 from "@/assets/thumb-attracione-3.jpg";
import thumbAttracione4 from "@/assets/thumb-attracione-4.jpg";
import thumbAttracione5 from "@/assets/thumb-attracione-5.jpg";
import thumbPortacopos1 from "@/assets/thumb-portacopos-1.jpg";
import thumbPortacopos2 from "@/assets/thumb-portacopos-2.jpg";
import thumbPortacopos3 from "@/assets/thumb-portacopos-3.jpg";
import thumbSeladora1 from "@/assets/thumb-seladora-1.jpg";
import thumbSeladora2 from "@/assets/thumb-seladora-2.jpg";
import thumbSeladora3 from "@/assets/thumb-seladora-3.jpg";
import thumbSeladora4 from "@/assets/thumb-seladora-4.jpg";
import thumbSeladora5 from "@/assets/thumb-seladora-5.jpg";
import thumbTopsutia1 from "@/assets/thumb-topsutia-1.jpg";
import thumbTopsutia2 from "@/assets/thumb-topsutia-2.jpg";
import thumbTopsutia4 from "@/assets/thumb-topsutia-4.jpg";
import thumbMounjax1 from "@/assets/thumb-mounjax-1.jpg";
import thumbMounjax2 from "@/assets/thumb-mounjax-2.jpg";
import thumbMounjax3 from "@/assets/thumb-mounjax-3.jpg";
import thumbMounjax4 from "@/assets/thumb-mounjax-4.jpg";
import thumbMounjax5 from "@/assets/thumb-mounjax-5.jpg";
import thumbShortcinta1 from "@/assets/thumb-shortcinta-1.jpg";
import thumbShortcinta2 from "@/assets/thumb-shortcinta-2.jpg";
import thumbShortcinta4 from "@/assets/thumb-shortcinta-4.jpg";
import thumbMoringa1 from "@/assets/thumb-moringa-1.jpg";
import thumbMoringa2 from "@/assets/thumb-moringa-2.jpg";
import thumbMoringa3 from "@/assets/thumb-moringa-3.jpg";
import thumbMoringa4 from "@/assets/thumb-moringa-4.jpg";
import thumbMoringa5 from "@/assets/thumb-moringa-5.jpg";
import thumbDimpless1 from "@/assets/thumb-dimpless-1.jpg";
import thumbDimpless2 from "@/assets/thumb-dimpless-2.jpg";
import thumbDimpless3 from "@/assets/thumb-dimpless-3.jpg";
import thumbDimpless4 from "@/assets/thumb-dimpless-4.jpg";
import thumbDimpless5 from "@/assets/thumb-dimpless-5.jpg";
import thumbTesto1 from "@/assets/thumb-testo-1.jpg";
import thumbTesto2 from "@/assets/thumb-testo-2.jpg";
import thumbTesto3 from "@/assets/thumb-testo-3.jpg";
import thumbTesto4 from "@/assets/thumb-testo-4.jpg";
import thumbTesto5 from "@/assets/thumb-testo-5.jpg";
import thumbEscovadente1 from "@/assets/thumb-escovadente-1.jpg";
import thumbEscovadente2 from "@/assets/thumb-escovadente-2.jpg";
import thumbEscovadente3 from "@/assets/thumb-escovadente-3.jpg";
import thumbEscovadente4 from "@/assets/thumb-escovadente-4.jpg";
import thumbEscovadente5 from "@/assets/thumb-escovadente-5.jpg";
import thumbSuplemento1 from "@/assets/thumb-suplemento-1.jpg";
import thumbSuplemento2 from "@/assets/thumb-suplemento-2.jpg";
import thumbSuplemento3 from "@/assets/thumb-suplemento-3.jpg";
import thumbSuplemento4 from "@/assets/thumb-suplemento-4.jpg";
import thumbColageno1 from "@/assets/thumb-colageno-1.jpg";
import thumbColageno2 from "@/assets/thumb-colageno-2.jpg";
import thumbColageno3 from "@/assets/thumb-colageno-3.jpg";
import thumbColageno4 from "@/assets/thumb-colageno-4.jpg";
import thumbColageno5 from "@/assets/thumb-colageno-5.jpg";
import thumbArginina1 from "@/assets/thumb-arginina-1.jpg";
import thumbArginina2 from "@/assets/thumb-arginina-2.jpg";
import thumbArginina3 from "@/assets/thumb-arginina-3.jpg";
import thumbArginina4 from "@/assets/thumb-arginina-4.jpg";
import thumbArginina5 from "@/assets/thumb-arginina-5.jpg";
import thumbCreatina1 from "@/assets/thumb-creatina-1.jpg";
import thumbCreatina2 from "@/assets/thumb-creatina-2.jpg";
import thumbCreatina3 from "@/assets/thumb-creatina-3.jpg";
import thumbCreatina4 from "@/assets/thumb-creatina-4.jpg";
import thumbBermudas1 from "@/assets/thumb-bermudas-1.jpg";
import thumbBermudas2 from "@/assets/thumb-bermudas-2.jpg";
import thumbBermudas3 from "@/assets/thumb-bermudas-3.jpg";
import thumbBermudas4 from "@/assets/thumb-bermudas-4.jpg";
import thumbBermudas5 from "@/assets/thumb-bermudas-5.jpg";
import thumbWhey1 from "@/assets/thumb-whey-1.jpg";
import thumbWhey2 from "@/assets/thumb-whey-2.jpg";
import thumbWhey3 from "@/assets/thumb-whey-3.jpg";
import thumbWhey4 from "@/assets/thumb-whey-4.jpg";
import thumbMaca1 from "@/assets/thumb-maca-1.jpg";
import thumbMaca2 from "@/assets/thumb-maca-2.jpg";
import thumbMaca3 from "@/assets/thumb-maca-3.jpg";
import thumbMaca4 from "@/assets/thumb-maca-4.jpg";
import thumbMaca5 from "@/assets/thumb-maca-5.jpg";
import thumbVitaminab12 from "@/assets/thumb-vitaminab12-1.jpg";
import thumbVitaminab122 from "@/assets/thumb-vitaminab12-2.jpg";
import thumbVitaminab123 from "@/assets/thumb-vitaminab12-3.jpg";
import thumbVitaminab124 from "@/assets/thumb-vitaminab12-4.jpg";
import thumbVitaminab125 from "@/assets/thumb-vitaminab12-5.jpg";
import thumbBone1 from "@/assets/thumb-bone-1.jpg";
import thumbBone2 from "@/assets/thumb-bone-2.jpg";
import thumbBone3 from "@/assets/thumb-bone-3.jpg";
import thumbBone4 from "@/assets/thumb-bone-4.jpg";
import thumbBone5 from "@/assets/thumb-bone-5.jpg";
import thumbMelatonina1 from "@/assets/thumb-melatonina-1.jpg";
import thumbMelatonina2 from "@/assets/thumb-melatonina-2.jpg";
import thumbMelatonina3 from "@/assets/thumb-melatonina-3.jpg";
import thumbMelatonina4 from "@/assets/thumb-melatonina-4.jpg";
import thumbCintaalta1 from "@/assets/thumb-cintaalta-1.jpg";
import thumbCintaalta2 from "@/assets/thumb-cintaalta-2.jpg";
import thumbCintaalta3 from "@/assets/thumb-cintaalta-3.jpg";
import thumbCintaalta4 from "@/assets/thumb-cintaalta-4.jpg";
import thumbCintaalta5 from "@/assets/thumb-cintaalta-5.jpg";
import thumbRologelo1 from "@/assets/thumb-rologelo-1.jpg";
import thumbRologelo2 from "@/assets/thumb-rologelo-2.jpg";
import thumbRologelo3 from "@/assets/thumb-rologelo-3.jpg";
import thumbRologelo4 from "@/assets/thumb-rologelo-4.jpg";
import thumbRologelo5 from "@/assets/thumb-rologelo-5.jpg";

const videoThumbnails: Record<string, string> = {
  // 9D Dentes Brancos
  "7542248634964790533": thumbVideo1,
  "7590517862624808212": thumbVideo2,
  "7557151952757361976": thumbVideo3,
  "7552168228152200459": thumbVideo4,
  "7553599041314049336": thumbVideo5,
  // Attracione Men
  "7574172221351021832": thumbAttracione1,
  "7569232111429750036": thumbAttracione2,
  "7595690476515233044": thumbAttracione3,
  "7574075007442160903": thumbAttracione4,
  "7571866708437241109": thumbAttracione5,
  // Porta Copos Automotivo
  "7539134157763464504": thumbPortacopos1,
  "7597210423070444807": thumbPortacopos2,
  "7551211443253677368": thumbPortacopos3,
  // Seladora a Vácuo
  "7515777581359123718": thumbSeladora1,
  "7502055184651111735": thumbSeladora2,
  "7502615312718646583": thumbSeladora3,
  "7603257114986941729": thumbSeladora4,
  "7561438311433112888": thumbSeladora5,
  // Kit 2 Top Sutiã
  "7604064672009964821": thumbTopsutia1,
  "7550831949468765496": thumbTopsutia2,
  "7591595295268457748": thumbTopsutia4,
  "7564957400285924628": thumbTopsutia1,
  "7596685382251498772": thumbTopsutia2,
  // Mounjax
  "7587998500403547400": thumbMounjax1,
  "7600051207427640583": thumbMounjax2,
  "7584585269370752276": thumbMounjax3,
  "7576045863290604817": thumbMounjax4,
  "7611702004989119761": thumbMounjax5,
  // Short Cinta Modeladora
  "7466926351992294661": thumbShortcinta1,
  "7571193988275768597": thumbShortcinta2,
  "7512604000198380856": thumbShortcinta4,
  "7621281220453846279": thumbShortcinta1,
  // Moringa + Maca Negra
  "7568941512617430292": thumbMoringa1,
  "7568907959074344212": thumbMoringa2,
  "7569470270499573010": thumbMoringa3,
  "7568989158379719956": thumbMoringa4,
  "7603791884162731284": thumbMoringa5,
  // Dimpless + Morosil
  "7572311566826147080": thumbDimpless1,
  "7446551334289034518": thumbDimpless2,
  "7593420588878662920": thumbDimpless3,
  "7600451923745033480": thumbDimpless4,
  "7460203931344571653": thumbDimpless5,
  // Testo
  "7603808815158398215": thumbTesto1,
  "7621700237232573716": thumbTesto2,
  "7582304980682444040": thumbTesto3,
  "7608394009995693332": thumbTesto4,
  "7588211915369811218": thumbTesto5,
  // Escova de Dente Elétrica
  "7609490641822731527": thumbEscovadente1,
  "7611658576041463058": thumbEscovadente2,
  "7524427375866645816": thumbEscovadente3,
  "7621723962858294545": thumbEscovadente4,
  "7519238496280792326": thumbEscovadente5,
  // Suplemento Alimentar
  "7569663324904803604": thumbSuplemento1,
  "7572985486680116501": thumbSuplemento2,
  "7614174278761843989": thumbSuplemento3,
  "7596479341794479368": thumbSuplemento4,
  // Kit Colageno Hidrolisado
  "7590838751639653652": thumbColageno1,
  "7575555258202623253": thumbColageno2,
  "7342834831698496773": thumbColageno3,
  "7572284324322626836": thumbColageno4,
  "7517355103691508997": thumbColageno5,
  // Capsulas de Arginina
  "7400539256445340933": thumbArginina1,
  "7291017751617998086": thumbArginina2,
  "7545391452365376774": thumbArginina3,
  "7604867615823006997": thumbArginina4,
  "7280506247936281861": thumbArginina5,
  // Creatina + Taurina
  "7620875871980702977": thumbCreatina1,
  "7577056514758757653": thumbCreatina2,
  "7616044695289859336": thumbCreatina3,
  "7625009050131975444": thumbCreatina4,
  // Bermudas Dry Fit
  "7604219796057591060": thumbBermudas1,
  "7613785186282736916": thumbBermudas2,
  "7582596442762661128": thumbBermudas3,
  "7553679377314172172": thumbBermudas4,
  "7611565376475761940": thumbBermudas5,
  // Whey Protein
  "7301431893805911302": thumbWhey1,
  "7612630995191237908": thumbWhey2,
  "7600758747304119572": thumbWhey3,
  "7246788093670460678": thumbWhey4,
  // Maca Peruana
  "7169710787454422277": thumbMaca1,
  "7543407413244742968": thumbMaca2,
  "7548643158532312325": thumbMaca3,
  "7254619794819910917": thumbMaca4,
  "7521728282698583302": thumbMaca5,
  // Vitamina B12
  "7217526721401163050": thumbVitaminab12,
  "7434586124367973687": thumbVitaminab122,
  "7392688760523066630": thumbVitaminab123,
  "7514345787971751174": thumbVitaminab124,
  "7599107886907657479": thumbVitaminab125,
  // Boné Aba Curva
  "7585202462923951381": thumbBone1,
  "7590804276323142933": thumbBone2,
  "7540648429874072888": thumbBone3,
  "7556718825752907064": thumbBone4,
  "7584452899439267093": thumbBone5,
  // Kit Melatonina
  "7577047889365519623": thumbMelatonina1,
  "7217216558236519722": thumbMelatonina2,
  "7526008944871935288": thumbMelatonina3,
  "7555620872485326091": thumbMelatonina4,
  // Cinta Modeladora Alta Compressão
  "6950668761728929030": thumbCintaalta1,
  "7569775689340079368": thumbCintaalta2,
  "7580043190984789256": thumbCintaalta3,
  "7568143922095000852": thumbCintaalta4,
  "7570737079550856456": thumbCintaalta5,
  // Rolo Fácil de Gelo
  "7543822109517024517": thumbRologelo1,
  "7609705077728742677": thumbRologelo2,
  "7482049048048848159": thumbRologelo3,
  "7544358400755256581": thumbRologelo4,
  "7609031772151614740": thumbRologelo5,
};

// Types
interface CreativeVideo {
  id: number;
  creator: string;
  avatar: string;
  views: number;
  likes: number;
  shares: number;
  sales: number;
  duration: string;
  format: string;
  style: string;
  hook: string;
  steps: string[];
  conversion: number;
  trending: boolean;
  tiktokUrl: string;
}

const generateCreatives = (productId: number, _productName: string): CreativeVideo[] => {
  const hooks = [
    `"Gente, vocês PRECISAM ver isso..." 👀`,
    `"Para tudo! Olha o que chegou aqui..." 🤯`,
    `"Eu não acreditei quando testei..." 😱`,
    `"Todo mundo tá comprando isso e eu entendi o porquê" 🔥`,
    `"Se eu soubesse disso antes, teria comprado há meses" 💸`,
    `"O TikTok me fez comprar e não me arrependi" ✅`,
    `"POV: você encontrou o melhor produto do TikTok" 🎯`,
    `"Eu testei pra vocês e olha o resultado..." 📦`,
  ];
  const styles = ["UGC", "Unboxing", "Review", "Tutorial", "Antes/Depois", "POV", "Storytelling", "GRWM"];
  const formats = ["9:16 Vertical", "9:16 Vertical", "9:16 Vertical", "1:1 Quadrado"];
  const durations = ["0:15", "0:22", "0:30", "0:45", "1:00", "0:18", "0:35", "0:28"];
  const stepTemplates = [
    ["Hook com problema/dor", "Mostrar o produto", "Demonstração de uso", "Resultado final + CTA"],
    ["Abertura com curiosidade", "Unboxing do produto", "Primeiras impressões", "Resultado + link na bio"],
    ["Contexto do dia a dia", "Apresentação do produto", "Antes vs Depois", "Depoimento + CTA"],
    ["POV com texto na tela", "Zoom no produto", "Uso prático", "Reação positiva + CTA"],
    ["Trend audio + gancho", "Corte rápido pro produto", "3 benefícios em texto", "Prova social + link"],
  ];
  const creators = ["@mariaviral_", "@pedrosales", "@juliatrend", "@lucasmkt_", "@anacriativos", "@rafashop_", "@gabriellive", "@caboroteiro"];
  const avatarColors = ["from-tiktok-cyan to-tiktok-pink", "from-tiktok-pink to-tiktok-purple", "from-tiktok-cyan to-tiktok-green", "from-tiktok-yellow to-tiktok-pink", "from-tiktok-purple to-tiktok-cyan", "from-tiktok-green to-tiktok-cyan", "from-tiktok-pink to-tiktok-yellow", "from-tiktok-cyan to-tiktok-purple"];

  // Real TikTok videos mapped by product ID
  const productVideos: Record<number, { id: string; creator: string; url: string }[]> = {
    95: [ // 9D Dentes Brancos
      { id: "7542248634964790533", creator: "@luisasoaress11", url: "https://www.tiktok.com/@luisasoaress11/video/7542248634964790533" },
      { id: "7590517862624808212", creator: "@vendedor_top", url: "https://www.tiktok.com/@vendedor_top/video/7590517862624808212" },
      { id: "7557151952757361976", creator: "@rodrigo.flz", url: "https://www.tiktok.com/@rodrigo.flz/video/7557151952757361976" },
      { id: "7552168228152200459", creator: "@kaumonteiiro", url: "https://www.tiktok.com/@kaumonteiiro/video/7552168228152200459" },
      { id: "7553599041314049336", creator: "@niccatalani", url: "https://www.tiktok.com/@niccatalani/video/7553599041314049336" },
    ],
    14: [ // Attracione Men
      { id: "7574172221351021832", creator: "@luizwolf.indica", url: "https://www.tiktok.com/@luizwolf.indica/video/7574172221351021832" },
      { id: "7569232111429750036", creator: "@tavs.shop", url: "https://www.tiktok.com/@tavs.shop/video/7569232111429750036" },
      { id: "7595690476515233044", creator: "@tavs.shop", url: "https://www.tiktok.com/@tavs.shop/video/7595690476515233044" },
      { id: "7574075007442160903", creator: "@tavs.shop", url: "https://www.tiktok.com/@tavs.shop/video/7574075007442160903" },
      { id: "7571866708437241109", creator: "@henrickcosan", url: "https://www.tiktok.com/@henrickcosan/video/7571866708437241109" },
    ],
    116: [ // Porta Copos Automotivo
      { id: "7539134157763464504", creator: "@mikello_0", url: "https://www.tiktok.com/@mikello_0/video/7539134157763464504" },
      { id: "7597210423070444807", creator: "@autoshoppi", url: "https://www.tiktok.com/@autoshoppi/video/7597210423070444807" },
      { id: "7551211443253677368", creator: "@espacoauto", url: "https://www.tiktok.com/@espacoauto/video/7551211443253677368" },
    ],
    117: [ // Seladora a Vácuo
      { id: "7515777581359123718", creator: "@sabrinanobrga", url: "https://www.tiktok.com/@sabrinanobrga/video/7515777581359123718" },
      { id: "7502055184651111735", creator: "@panelaterapia", url: "https://www.tiktok.com/@panelaterapia/video/7502055184651111735" },
      { id: "7502615312718646583", creator: "@andressahcatty", url: "https://www.tiktok.com/@andressahcatty/video/7502615312718646583" },
      { id: "7603257114986941729", creator: "@temu_pt_official", url: "https://www.tiktok.com/@temu_pt_official/video/7603257114986941729" },
      { id: "7561438311433112888", creator: "@shopee_br", url: "https://www.tiktok.com/@shopee_br/video/7561438311433112888" },
    ],
    15: [ // Kit 2 Top Sutiã
      { id: "7604064672009964821", creator: "@yelisashop", url: "https://www.tiktok.com/@yelisashop/video/7604064672009964821" },
      { id: "7550831949468765496", creator: "@janieli.shop", url: "https://www.tiktok.com/@janieli.shop/video/7550831949468765496" },
      { id: "7591595295268457748", creator: "@_shopfacil_", url: "https://www.tiktok.com/@_shopfacil_/video/7591595295268457748" },
      { id: "7564957400285924628", creator: "@videosehistoriasdapoly", url: "https://www.tiktok.com/@videosehistoriasdapoly/video/7564957400285924628" },
      { id: "7596685382251498772", creator: "@.familiapimentel", url: "https://www.tiktok.com/@.familiapimentel/video/7596685382251498772" },
    ],
    50: [ // Mounjax
      { id: "7587998500403547400", creator: "@oficial.com.br01", url: "https://www.tiktok.com/@oficial.com.br01/video/7587998500403547400" },
      { id: "7600051207427640583", creator: "@emishop__", url: "https://www.tiktok.com/@emishop__/video/7600051207427640583" },
      { id: "7584585269370752276", creator: "@th.evitals", url: "https://www.tiktok.com/@th.evitals/video/7584585269370752276" },
      { id: "7576045863290604817", creator: "@biasincerona", url: "https://www.tiktok.com/@biasincerona/video/7576045863290604817" },
      { id: "7611702004989119761", creator: "@lunavalkyriaoficial", url: "https://www.tiktok.com/@lunavalkyriaoficial/video/7611702004989119761" },
    ],
    16: [ // Short Cinta Modeladora
      { id: "7466926351992294661", creator: "@stellamedeirosa", url: "https://www.tiktok.com/@stellamedeirosa/video/7466926351992294661" },
      { id: "7571193988275768597", creator: "@lariilunn", url: "https://www.tiktok.com/@lariilunn/video/7571193988275768597" },
      { id: "7512604000198380856", creator: "@stellamedeirosa", url: "https://www.tiktok.com/@stellamedeirosa/video/7512604000198380856" },
      { id: "7621281220453846279", creator: "@keylasbraga", url: "https://www.tiktok.com/@keylasbraga/video/7621281220453846279" },
    ],
    51: [ // Moringa + Maca Negra
      { id: "7568941512617430292", creator: "@suplementoforte", url: "https://www.tiktok.com/@suplementoforte/video/7568941512617430292" },
      { id: "7568907959074344212", creator: "@.suplementosaudavel", url: "https://www.tiktok.com/@.suplementosaudavel/video/7568907959074344212" },
      { id: "7569470270499573010", creator: "@gabirecomenda17", url: "https://www.tiktok.com/@gabirecomenda17/video/7569470270499573010" },
      { id: "7568989158379719956", creator: "@.suplementosaudavel", url: "https://www.tiktok.com/@.suplementosaudavel/video/7568989158379719956" },
      { id: "7603791884162731284", creator: "@reisaudenatural", url: "https://www.tiktok.com/@reisaudenatural/video/7603791884162731284" },
    ],
    52: [ // Dimpless + Morosil
      { id: "7572311566826147080", creator: "@farma_nath2", url: "https://www.tiktok.com/@farma_nath2/video/7572311566826147080" },
      { id: "7446551334289034518", creator: "@willportela", url: "https://www.tiktok.com/@willportela/video/7446551334289034518" },
      { id: "7593420588878662920", creator: "@drogariadffarma", url: "https://www.tiktok.com/@drogariadffarma/video/7593420588878662920" },
      { id: "7600451923745033480", creator: "@carolwellnessproo", url: "https://www.tiktok.com/@carolwellnessproo/video/7600451923745033480" },
      { id: "7460203931344571653", creator: "@larilustosaa", url: "https://www.tiktok.com/@larilustosaa/video/7460203931344571653" },
    ],
    53: [ // Testo
      { id: "7603808815158398215", creator: "@testo_oficial", url: "https://www.tiktok.com/@testo_oficial/video/7603808815158398215" },
      { id: "7621700237232573716", creator: "@testo_review", url: "https://www.tiktok.com/@testo_review/video/7621700237232573716" },
      { id: "7582304980682444040", creator: "@jserip", url: "https://www.tiktok.com/@jserip/video/7582304980682444040" },
      { id: "7608394009995693332", creator: "@manualdonerdcurioso", url: "https://www.tiktok.com/@manualdonerdcurioso/video/7608394009995693332" },
      { id: "7588211915369811218", creator: "@prime_unbox_tiktok", url: "https://www.tiktok.com/@prime_unbox_tiktok/video/7588211915369811218" },
    ],
    17: [ // Escova de Dente Elétrica
      { id: "7609490641822731527", creator: "@shopdanaih", url: "https://www.tiktok.com/@shopdanaih/video/7609490641822731527" },
      { id: "7611658576041463058", creator: "@denilson_fferreira", url: "https://www.tiktok.com/@denilson_fferreira/video/7611658576041463058" },
      { id: "7524427375866645816", creator: "@utheuzinn", url: "https://www.tiktok.com/@utheuzinn/video/7524427375866645816" },
      { id: "7621723962858294545", creator: "@eu.alvess", url: "https://www.tiktok.com/@eu.alvess/video/7621723962858294545" },
      { id: "7519238496280792326", creator: "@elacatarina", url: "https://www.tiktok.com/@elacatarina/video/7519238496280792326" },
    ],
    54: [ // Suplemento Alimentar
      { id: "7569663324904803604", creator: "@suplementoforte", url: "https://www.tiktok.com/@suplementoforte/video/7569663324904803604" },
      { id: "7572985486680116501", creator: "@ferr.titk", url: "https://www.tiktok.com/@ferr.titk/video/7572985486680116501" },
      { id: "7614174278761843989", creator: "@billy.would", url: "https://www.tiktok.com/@billy.would/video/7614174278761843989" },
      { id: "7596479341794479368", creator: "@luciana.mendes.vr", url: "https://www.tiktok.com/@luciana.mendes.vr/video/7596479341794479368" },
    ],
    55: [ // Kit Colageno Hidrolisado
      { id: "7590838751639653652", creator: "@heerbaloom", url: "https://www.tiktok.com/@heerbaloom/video/7590838751639653652" },
      { id: "7575555258202623253", creator: "@bruno.weingartner", url: "https://www.tiktok.com/@bruno.weingartner/video/7575555258202623253" },
      { id: "7342834831698496773", creator: "@ivania.sousa.silv", url: "https://www.tiktok.com/@ivania.sousa.silv/video/7342834831698496773" },
      { id: "7572284324322626836", creator: "@trembonessa", url: "https://www.tiktok.com/@trembonessa/video/7572284324322626836" },
      { id: "7517355103691508997", creator: "@thaadigital", url: "https://www.tiktok.com/@thaadigital/video/7517355103691508997" },
    ],
    56: [ // Capsulas de Arginina
      { id: "7400539256445340933", creator: "@natalice_conceicao1", url: "https://www.tiktok.com/@natalice_conceicao1/video/7400539256445340933" },
      { id: "7291017751617998086", creator: "@cozinhadoleao", url: "https://www.tiktok.com/@cozinhadoleao/video/7291017751617998086" },
      { id: "7545391452365376774", creator: "@banheiradeconhecimento", url: "https://www.tiktok.com/@banheiradeconhecimento/video/7545391452365376774" },
      { id: "7604867615823006997", creator: "@nutryfly", url: "https://www.tiktok.com/@nutryfly/video/7604867615823006997" },
      { id: "7280506247936281861", creator: "@nativaalimentos", url: "https://www.tiktok.com/@nativaalimentos/video/7280506247936281861" },
    ],
    57: [ // 500g Creatina + 500g Taurina
      { id: "7620875871980702977", creator: "@marame.aurora", url: "https://www.tiktok.com/@marame.aurora/video/7620875871980702977" },
      { id: "7577056514758757653", creator: "@trembonessa", url: "https://www.tiktok.com/@trembonessa/video/7577056514758757653" },
      { id: "7616044695289859336", creator: "@wrz.recomenda", url: "https://www.tiktok.com/@wrz.recomenda/video/7616044695289859336" },
      { id: "7625009050131975444", creator: "@achadinhos_da_gui1", url: "https://www.tiktok.com/@achadinhos_da_gui1/video/7625009050131975444" },
    ],
    18: [ // Bermudas 3 Dry Fit
      { id: "7604219796057591060", creator: "@lealrecomenda", url: "https://www.tiktok.com/@lealrecomenda/video/7604219796057591060" },
      { id: "7613785186282736916", creator: "@guhfontes_", url: "https://www.tiktok.com/@guhfontes_/video/7613785186282736916" },
      { id: "7582596442762661128", creator: "@luansmithsp", url: "https://www.tiktok.com/@luansmithsp/video/7582596442762661128" },
      { id: "7553679377314172172", creator: "@historiasdabiblia10", url: "https://www.tiktok.com/@historiasdabiblia10/video/7553679377314172172" },
      { id: "7611565376475761940", creator: "@guhfontes_", url: "https://www.tiktok.com/@guhfontes_/video/7611565376475761940" },
    ],
    58: [ // Whey Protein Isolado 900g
      { id: "7301431893805911302", creator: "@patrickbeneducci", url: "https://www.tiktok.com/@patrickbeneducci/video/7301431893805911302" },
      { id: "7612630995191237908", creator: "@frazaolima", url: "https://www.tiktok.com/@frazaolima/video/7612630995191237908" },
      { id: "7600758747304119572", creator: "@angelacrioliveira", url: "https://www.tiktok.com/@angelacrioliveira/video/7600758747304119572" },
      { id: "7246788093670460678", creator: "@zuinesportess", url: "https://www.tiktok.com/@zuinesportess/video/7246788093670460678" },
    ],
    59: [ // Maca Peruana
      { id: "7169710787454422277", creator: "@daiagym", url: "https://www.tiktok.com/@daiagym/video/7169710787454422277" },
      { id: "7543407413244742968", creator: "@vendas_tiktokshop", url: "https://www.tiktok.com/@vendas_tiktokshop/video/7543407413244742968" },
      { id: "7548643158532312325", creator: "@ga.meireles", url: "https://www.tiktok.com/@ga.meireles/video/7548643158532312325" },
      { id: "7254619794819910917", creator: "@famanatural", url: "https://www.tiktok.com/@famanatural/video/7254619794819910917" },
      { id: "7521728282698583302", creator: "@saude.natural12", url: "https://www.tiktok.com/@saude.natural12/video/7521728282698583302" },
    ],
    60: [ // Vitamina B12
      { id: "7217526721401163050", creator: "@drabrunascalco", url: "https://www.tiktok.com/@drabrunascalco/video/7217526721401163050" },
      { id: "7434586124367973687", creator: "@drguilhermestefano", url: "https://www.tiktok.com/@drguilhermestefano/video/7434586124367973687" },
      { id: "7392688760523066630", creator: "@towtei", url: "https://www.tiktok.com/@towtei/video/7392688760523066630" },
      { id: "7514345787971751174", creator: "@drogariadffarma", url: "https://www.tiktok.com/@drogariadffarma/video/7514345787971751174" },
      { id: "7599107886907657479", creator: "@andreafariaterapeuta", url: "https://www.tiktok.com/@andreafariaterapeuta/video/7599107886907657479" },
    ],
    19: [ // Boné Aba Curva Premium
      { id: "7585202462923951381", creator: "@liderancy", url: "https://www.tiktok.com/@liderancy/video/7585202462923951381" },
      { id: "7590804276323142933", creator: "@autoridade", url: "https://www.tiktok.com/@autoridade/video/7590804276323142933" },
      { id: "7540648429874072888", creator: "@darkc.shop", url: "https://www.tiktok.com/@darkc.shop/video/7540648429874072888" },
      { id: "7556718825752907064", creator: "@e.souzaxx1", url: "https://www.tiktok.com/@e.souzaxx1/video/7556718825752907064" },
      { id: "7584452899439267093", creator: "@flowstore_br", url: "https://www.tiktok.com/@flowstore_br/video/7584452899439267093" },
    ],
    61: [ // Kit Melatonina 5 Unidades
      { id: "7577047889365519623", creator: "@jshopfvb", url: "https://www.tiktok.com/@jshopfvb/video/7577047889365519623" },
      { id: "7217216558236519722", creator: "@sweet_ddreams", url: "https://www.tiktok.com/@sweet_ddreams/video/7217216558236519722" },
      { id: "7526008944871935288", creator: "@christyarimura", url: "https://www.tiktok.com/@christyarimura/video/7526008944871935288" },
      { id: "7555620872485326091", creator: "@farmaciavieira1", url: "https://www.tiktok.com/@farmaciavieira1/video/7555620872485326091" },
    ],
    20: [ // Cinta Modeladora De Alta Compressão
      { id: "6950668761728929030", creator: "@silhouettmodeladores", url: "https://www.tiktok.com/@silhouettmodeladores/video/6950668761728929030" },
      { id: "7569775689340079368", creator: "@isa_deconto", url: "https://www.tiktok.com/@isa_deconto/video/7569775689340079368" },
      { id: "7580043190984789256", creator: "@mare.shop_", url: "https://www.tiktok.com/@mare.shop_/video/7580043190984789256" },
      { id: "7568143922095000852", creator: "@annadnner", url: "https://www.tiktok.com/@annadnner/video/7568143922095000852" },
      { id: "7570737079550856456", creator: "@anasillvaofc1", url: "https://www.tiktok.com/@anasillvaofc1/video/7570737079550856456" },
    ],
    79: [ // Rolo Fácil de Gelo
      { id: "7543822109517024517", creator: "@promosdapaty1", url: "https://www.tiktok.com/@promosdapaty1/video/7543822109517024517" },
      { id: "7609705077728742677", creator: "@raquel.queiroz514", url: "https://www.tiktok.com/@raquel.queiroz514/video/7609705077728742677" },
      { id: "7482049048048848159", creator: "@ivylosada", url: "https://www.tiktok.com/@ivylosada/video/7482049048048848159" },
      { id: "7544358400755256581", creator: "@duany.lessa", url: "https://www.tiktok.com/@duany.lessa/video/7544358400755256581" },
      { id: "7609031772151614740", creator: "@a.melhor.escolha8", url: "https://www.tiktok.com/@a.melhor.escolha8/video/7609031772151614740" },
    ],
  };

  const realVideos = productVideos[productId];

  // Only show products that have real videos
  if (!realVideos || realVideos.length === 0) return [];

  return realVideos.map((rv, i) => {
    const seed = (productId * 7 + i * 13) % 100;
    const viewBase = 50000 + seed * 4500;
    const salesBase = 200 + seed * 25;

    return {
      id: i + 1,
      creator: rv.creator,
      avatar: avatarColors[(productId + i) % avatarColors.length],
      views: viewBase + i * 12000,
      likes: Math.round(viewBase * (0.04 + (seed % 5) * 0.01)),
      shares: Math.round(viewBase * (0.008 + (seed % 3) * 0.003)),
      sales: salesBase + i * 80,
      duration: durations[(productId + i) % durations.length],
      format: formats[(productId + i) % formats.length],
      style: styles[(productId + i) % styles.length],
      hook: hooks[(productId + i) % hooks.length],
      steps: stepTemplates[(productId + i) % stepTemplates.length],
      conversion: parseFloat((1.2 + (seed % 40) * 0.08).toFixed(1)),
      trending: seed > 60,
      tiktokUrl: rv.url,
    };
  }).sort((a, b) => b.sales - a.sales);
};

const fmt = (n: number) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
};

const RankBadge = memo(({ rank }: { rank: number }) => {
  if (rank === 1) return (
    <div className="absolute -top-1.5 -left-1.5 w-7 h-7 rounded-full bg-gradient-to-br from-tiktok-yellow to-tiktok-pink flex items-center justify-center shadow-lg shadow-tiktok-yellow/20 z-10">
      <Crown className="w-3.5 h-3.5 text-background" />
    </div>
  );
  if (rank === 2) return (
    <div className="absolute -top-1.5 -left-1.5 w-7 h-7 rounded-full bg-gradient-to-br from-muted-foreground to-foreground/60 flex items-center justify-center shadow-lg z-10">
      <Medal className="w-3.5 h-3.5 text-background" />
    </div>
  );
  if (rank === 3) return (
    <div className="absolute -top-1.5 -left-1.5 w-7 h-7 rounded-full bg-gradient-to-br from-tiktok-yellow/80 to-tiktok-yellow/40 flex items-center justify-center shadow-lg z-10">
      <Trophy className="w-3.5 h-3.5 text-background" />
    </div>
  );
  return (
    <div className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center z-10">
      <span className="text-[9px] font-bold text-muted-foreground">#{rank}</span>
    </div>
  );
});
RankBadge.displayName = "RankBadge";

const CreativeCard = memo(({ video, rank, productName }: { video: CreativeVideo; rank: number; productName: string }) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  // Extract video ID from TikTok URL
  const videoId = video.tiktokUrl.split("/").pop() || "";

  const handleGenerateScript = useCallback(() => {
    const script = `🎬 ROTEIRO DE VÍDEO — ${productName}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 Estilo: ${video.style} | ⏱ Duração: ${video.duration} | 📐 Formato: ${video.format}
👤 Referência: ${video.creator} (${fmt(video.sales)} vendas)

🎯 HOOK (Primeiros 3 segundos):
${video.hook}

📋 ESTRUTURA DO VÍDEO:
${video.steps.map((step, i) => `  ${i + 1}. ${step}`).join("\n")}

📊 MÉTRICAS DE REFERÊNCIA:
  • Views: ${fmt(video.views)}
  • Likes: ${fmt(video.likes)}
  • Vendas: ${fmt(video.sales)}
  • Conversão: ${video.conversion}%

💡 DICA: Adapte o hook e mantenha a mesma estrutura. O formato ${video.style} está convertendo bem nesse produto.
`;
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [video, productName]);

  return (
    <>
    <div className="relative group">
      <RankBadge rank={rank} />
      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden transition-all duration-300 hover:border-tiktok-cyan/30 hover:shadow-lg hover:shadow-tiktok-cyan/5">
        {/* Video thumbnail - clickable */}
        <div 
          className="relative h-36 bg-gradient-to-br from-muted to-background overflow-hidden cursor-pointer"
          onClick={() => setShowVideo(true)}
        >
          {videoThumbnails[videoId] ? (
            <img 
              src={videoThumbnails[videoId]} 
              alt={`Vídeo de ${video.creator}`}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
          ) : null}
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center border border-border/50 group-hover:scale-110 group-hover:bg-tiktok-cyan/20 group-hover:border-tiktok-cyan/40 transition-all duration-300">
              <Play className="w-5 h-5 text-foreground ml-0.5" />
            </div>
          </div>
          {/* Duration pill */}
          <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm rounded-md px-1.5 py-0.5 text-[10px] font-medium text-foreground">
            {video.duration}
          </div>
          {/* Style pill */}
          <div className="absolute top-2 right-2 bg-tiktok-cyan/20 backdrop-blur-sm rounded-md px-2 py-0.5 text-[10px] font-semibold text-tiktok-cyan border border-tiktok-cyan/20">
            {video.style}
          </div>
          {video.trending && (
            <div className="absolute top-2 left-2 bg-tiktok-pink/20 backdrop-blur-sm rounded-md px-2 py-0.5 text-[10px] font-semibold text-tiktok-pink border border-tiktok-pink/20 flex items-center gap-0.5">
              <Zap className="w-3 h-3" /> HYPE
            </div>
          )}
          {/* Format */}
          <div className="absolute bottom-2 left-2 text-[9px] text-muted-foreground bg-background/60 backdrop-blur-sm rounded px-1.5 py-0.5">
            {video.format}
          </div>
        </div>

        <div className="p-4">
          {/* Creator row */}
          <div className="flex items-center gap-2.5 mb-3">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${video.avatar} flex items-center justify-center flex-shrink-0`}>
              <span className="text-[10px] font-bold text-background">{video.creator.slice(1, 3).toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{video.creator}</p>
              <p className="text-[10px] text-muted-foreground">{fmt(video.sales)} vendas atribuídas</p>
            </div>
          </div>

          {/* Hook section */}
          <div className="relative rounded-xl p-3 mb-3 border border-tiktok-cyan/10 bg-tiktok-cyan/5">
            <div className="flex items-center gap-1 mb-1.5">
              <div className="w-1 h-1 rounded-full bg-tiktok-cyan animate-pulse" />
              <p className="text-[9px] font-bold text-tiktok-cyan uppercase tracking-[0.15em]">Hook · Primeiros 3s</p>
            </div>
            <p className="text-[13px] font-medium text-foreground leading-relaxed">{video.hook}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-1 mb-3">
            {[
              { icon: Eye, value: fmt(video.views), label: "Views" },
              { icon: Heart, value: fmt(video.likes), label: "Likes" },
              { icon: ShoppingCart, value: fmt(video.sales), label: "Vendas" },
              { icon: BarChart3, value: `${video.conversion}%`, label: "Conv." },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center py-2 rounded-lg bg-muted/30">
                <Icon className="w-3 h-3 text-muted-foreground mx-auto mb-1" />
                <p className="text-[11px] font-bold text-foreground">{value}</p>
                <p className="text-[9px] text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>

          {/* Expandable structure */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between text-[11px] font-semibold text-tiktok-cyan hover:text-tiktok-cyan/80 transition-colors py-2 border-t border-border/30"
          >
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Estrutura do vídeo ({video.steps.length} etapas)
            </span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {expanded && (
            <div className="mt-1 mb-2 space-y-2 animate-in slide-in-from-top-2 duration-200">
              {video.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-gradient-to-br from-tiktok-cyan/20 to-tiktok-pink/20 flex items-center justify-center flex-shrink-0 mt-0.5 border border-tiktok-cyan/10">
                    <span className="text-[9px] font-bold text-tiktok-cyan">{i + 1}</span>
                  </div>
                  <p className="text-[11px] text-foreground/80 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <Button
            onClick={handleGenerateScript}
            className={`w-full mt-2 text-xs h-9 gap-1.5 font-semibold rounded-xl transition-all duration-300 ${
              copied
                ? "bg-tiktok-green text-background"
                : "bg-gradient-to-r from-tiktok-cyan to-tiktok-pink hover:opacity-90 text-background hover:shadow-lg hover:shadow-tiktok-cyan/20"
            }`}
          >
            {copied ? (
              <><Check className="w-3.5 h-3.5" /> Roteiro copiado!</>
            ) : (
              <><Sparkles className="w-3.5 h-3.5" /> Gerar roteiro igual</>
            )}
          </Button>
        </div>
      </div>
    </div>

    {/* TikTok Video Modal */}
    <Dialog open={showVideo} onOpenChange={setShowVideo}>
      <DialogContent className="max-w-md p-0 bg-black border-border/50 overflow-hidden rounded-2xl">
        <div className="relative">
          <button 
            onClick={() => setShowVideo(false)}
            className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="w-full" style={{ aspectRatio: "9/16", maxHeight: "80vh" }}>
            <iframe
              src={`https://www.tiktok.com/player/v1/${videoId}?music_info=1&description=1`}
              className="w-full h-full"
              allowFullScreen
              allow="encrypted-media"
              style={{ border: "none" }}
            />
          </div>
          <div className="p-4 bg-card border-t border-border/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${video.avatar} flex items-center justify-center`}>
                  <span className="text-[8px] font-bold text-background">{video.creator.slice(1, 3).toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">{video.creator}</p>
                  <p className="text-[10px] text-muted-foreground">{video.style} · {video.duration}</p>
                </div>
              </div>
              <a
                href={video.tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] font-semibold text-tiktok-cyan hover:text-tiktok-cyan/80 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                Ver no TikTok
              </a>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
});
CreativeCard.displayName = "CreativeCard";

const Criativos = () => {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);

  const [catRef, catApi] = useEmblaCarousel({ dragFree: true, containScroll: "trimSnaps" });
  const [prodRef, prodApi] = useEmblaCarousel({ dragFree: true, containScroll: "trimSnaps", slidesToScroll: 3 });

  const scrollProdPrev = useCallback(() => prodApi?.scrollPrev(), [prodApi]);
  const scrollProdNext = useCallback(() => prodApi?.scrollNext(), [prodApi]);

  const categories = useMemo(() => {
    const cats = [...new Set(videoProducts.map(p => p.category))];
    return ["Todos", ...cats.sort()];
  }, []);

  const filteredProducts = useMemo(() => {
    const list = selectedCategory === "Todos"
      ? videoProducts
      : videoProducts.filter(p => p.category === selectedCategory);
    return list.sort((a, b) => b.fires - a.fires).slice(0, 20);
  }, [selectedCategory]);

  const activeProduct = useMemo(() => {
    if (selectedProduct) return videoProducts.find(p => p.id === selectedProduct) || null;
    return filteredProducts[0] || null;
  }, [selectedProduct, filteredProducts]);

  const creatives = useMemo(() => {
    if (!activeProduct) return [];
    return generateCreatives(activeProduct.id, activeProduct.name);
  }, [activeProduct]);

  const totalSales = useMemo(() => creatives.reduce((s, c) => s + c.sales, 0), [creatives]);
  const totalViews = useMemo(() => creatives.reduce((s, c) => s + c.views, 0), [creatives]);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 p-4 md:p-6 lg:p-8 w-full max-w-[1440px] mx-auto">
        {/* Hero header */}
        <div className="relative mb-8 rounded-3xl overflow-hidden glass-card inner-shine p-6 md:p-8">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-tiktok-cyan/8 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 left-1/3 w-48 h-48 bg-tiktok-pink/6 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-tiktok-cyan to-tiktok-pink flex items-center justify-center shadow-lg shadow-tiktok-cyan/20">
                <Video className="w-6 h-6 text-background" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Biblioteca de <span className="gradient-text">Criativos</span></h1>
                <p className="text-sm text-muted-foreground">Modele o que já vende. Não crie do zero.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Category filter - draggable */}
        <div className="mb-6 overflow-hidden" ref={catRef}>
          <div className="flex gap-2 pb-2 cursor-grab active:cursor-grabbing">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setSelectedProduct(null); }}
                className={`flex-shrink-0 px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-300 ${
                  selectedCategory === cat
                    ? "bg-gradient-to-r from-tiktok-cyan to-tiktok-pink text-background shadow-lg shadow-tiktok-cyan/15"
                    : "glass-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Horizontal product carousel - draggable */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.15em] flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-tiktok-cyan" />
              Selecione um produto
            </h3>
            <div className="flex gap-1.5">
              <button onClick={scrollProdPrev} className="w-7 h-7 rounded-lg bg-card border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={scrollProdNext} className="w-7 h-7 rounded-lg bg-card border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="overflow-hidden" ref={prodRef}>
            <div className="flex gap-3 cursor-grab active:cursor-grabbing">
              {filteredProducts.map(product => {
                const isActive = activeProduct?.id === product.id;
                return (
                  <button
                    key={product.id}
                    onClick={() => setSelectedProduct(product.id)}
                    className={`flex-shrink-0 w-[130px] rounded-2xl p-3 transition-all duration-300 border text-center group ${
                      isActive
                        ? "bg-tiktok-cyan/5 border-tiktok-cyan/30 shadow-lg shadow-tiktok-cyan/10"
                        : "bg-card border-border/30 hover:border-border hover:bg-card/80"
                    }`}
                  >
                    <div className="relative mx-auto w-16 h-16 mb-2">
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        className={`w-16 h-16 rounded-xl object-cover transition-all duration-300 ${
                          isActive ? "ring-2 ring-tiktok-cyan/50 scale-105" : "group-hover:scale-105"
                        }`}
                      />
                      {isActive && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-tiktok-cyan flex items-center justify-center">
                          <Play className="w-2.5 h-2.5 text-background ml-0.5" />
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] font-medium text-foreground truncate leading-tight">{product.name}</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <Flame className="w-3 h-3 text-tiktok-pink" />
                      <span className="text-[10px] text-muted-foreground">{product.fires}/dia</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main content - full width */}
        {activeProduct && (
          <>
            {/* Product header + summary stats */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 p-4 rounded-2xl bg-card border border-border/30">
              <img src={activeProduct.image} alt={activeProduct.name} className="w-14 h-14 rounded-xl object-cover ring-2 ring-border/30" loading="lazy" />
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-foreground truncate">{activeProduct.name}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{creatives.length} criativos de alta performance</p>
              </div>
              <div className="flex gap-3">
                <div className="text-center px-4 py-2 rounded-xl bg-tiktok-cyan/5 border border-tiktok-cyan/10">
                  <p className="text-sm font-bold text-tiktok-cyan">{fmt(totalViews)}</p>
                  <p className="text-[9px] text-muted-foreground">Views total</p>
                </div>
                <div className="text-center px-4 py-2 rounded-xl bg-tiktok-pink/5 border border-tiktok-pink/10">
                  <p className="text-sm font-bold text-tiktok-pink">{fmt(totalSales)}</p>
                  <p className="text-[9px] text-muted-foreground">Vendas total</p>
                </div>
              </div>
            </div>

            {creatives.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {creatives.map((video, i) => (
                  <CreativeCard key={video.id} video={video} rank={i + 1} productName={activeProduct.name} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 rounded-2xl border border-border/30 bg-card">
                <Video className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm font-medium text-muted-foreground">Nenhum vídeo adicionado para este produto ainda</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Os vídeos serão adicionados em breve</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Criativos;
