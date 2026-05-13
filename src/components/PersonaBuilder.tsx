import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Slider } from "@/components/ui/slider";

// Ethnicity images - Female
import ethAfricanaF from "@/assets/persona/eth-africana-f.jpg";
import ethAsiaticaF from "@/assets/persona/eth-asiatica-f.jpg";
import ethEuropeiaF from "@/assets/persona/eth-europeia-f.jpg";
import ethIndianaF from "@/assets/persona/eth-indiana-f.jpg";
import ethOrienteMedioF from "@/assets/persona/eth-orientemedio-f.jpg";
import ethLatinaF from "@/assets/persona/eth-latina-f.jpg";

// Ethnicity images - Male
import ethAfricanaM from "@/assets/persona/eth-africana-m.jpg";
import ethAsiaticaM from "@/assets/persona/eth-asiatico-m.jpg";
import ethEuropeiaM from "@/assets/persona/eth-europeu-m.jpg";
import ethIndianaM from "@/assets/persona/eth-indiano-m.jpg";
import ethOrienteMedioM from "@/assets/persona/eth-orientemedio-m.jpg";
import ethLatinaM from "@/assets/persona/eth-latino-m.jpg";

export interface PersonaConfig {
  gender: "feminino" | "masculino";
  ethnicity: string;
  skinTone: string;
  eyeColor: string;
  skinCondition: string | null;
  age: number;
  hairStyle: string;
  hairColor: string;
}

const ethnicities = [
  { id: "africana", label: "Africana", femaleImg: ethAfricanaF, maleImg: ethAfricanaM },
  { id: "asiatica", label: "Asiática", femaleImg: ethAsiaticaF, maleImg: ethAsiaticaM },
  { id: "europeia", label: "Europeia", femaleImg: ethEuropeiaF, maleImg: ethEuropeiaM },
  { id: "indiana", label: "Indiana", femaleImg: ethIndianaF, maleImg: ethIndianaM },
  { id: "oriente-medio", label: "Oriente Médio", femaleImg: ethOrienteMedioF, maleImg: ethOrienteMedioM },
  { id: "latina", label: "Latina", femaleImg: ethLatinaF, maleImg: ethLatinaM },
];

const skinTones = [
  { id: "clara", label: "Clara", color: "#FDDCBC" },
  { id: "media", label: "Média", color: "#D4A574" },
  { id: "morena", label: "Morena", color: "#A0724A" },
  { id: "escura", label: "Escura", color: "#6B4226" },
  { id: "muito-escura", label: "Muito Escura", color: "#3B2210" },
];

const eyeColors = [
  { id: "castanho", label: "Castanho", color: "#5C3317" },
  { id: "castanho-escuro", label: "Cast. Escuro", color: "#2C1608" },
  { id: "verde", label: "Verde", color: "#4A7A4A" },
  { id: "azul", label: "Azul", color: "#4A7AB5" },
  { id: "mel", label: "Mel", color: "#B8860B" },
  { id: "preto", label: "Preto", color: "#1A1A1A" },
];

const skinConditions = [
  { id: "nenhuma", label: "Nenhuma", emoji: "✨" },
  { id: "sardas", label: "Sardas", emoji: "🟤" },
  { id: "vitiligo", label: "Vitiligo", emoji: "🤍" },
  { id: "marcas", label: "Marcas", emoji: "💫" },
  { id: "cicatrizes", label: "Cicatrizes", emoji: "⚡" },
];

const hairStyles = [
  { id: "liso", label: "Liso" },
  { id: "ondulado", label: "Ondulado" },
  { id: "cacheado", label: "Cacheado" },
  { id: "crespo", label: "Crespo" },
  { id: "curto", label: "Curto" },
  { id: "raspado", label: "Raspado" },
];

const hairColors = [
  { id: "preto", label: "Preto", color: "#1A1A1A" },
  { id: "castanho", label: "Castanho", color: "#5C3317" },
  { id: "loiro", label: "Loiro", color: "#D4A017" },
  { id: "ruivo", label: "Ruivo", color: "#B7410E" },
  { id: "grisalho", label: "Grisalho", color: "#A0A0A0" },
  { id: "colorido", label: "Colorido", color: "linear-gradient(135deg, #FF69B4, #7B68EE)" },
];

interface CollapsibleSectionProps {
  title: string;
  icon: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const CollapsibleSection = ({ title, icon, children, defaultOpen = true }: CollapsibleSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border/30 pb-4 mb-4 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left py-1"
      >
        <span className="flex items-center gap-2 text-sm font-medium">
          <span>{icon}</span> {title}
        </span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {isOpen && <div className="mt-3">{children}</div>}
    </div>
  );
};

interface PersonaBuilderProps {
  persona: PersonaConfig;
  onChange: (persona: PersonaConfig) => void;
}

export function PersonaBuilder({ persona, onChange }: PersonaBuilderProps) {
  const update = (partial: Partial<PersonaConfig>) => {
    onChange({ ...persona, ...partial });
  };

  return (
    <div className="space-y-1">
      {/* Gender */}
      <CollapsibleSection title="Gênero" icon="👤">
        <div className="grid grid-cols-2 gap-3">
          {(["feminino", "masculino"] as const).map((g) => (
            <button
              key={g}
              onClick={() => update({ gender: g })}
              className={cn(
                "rounded-lg p-3 text-center border-2 transition-all flex flex-col items-center gap-2",
                persona.gender === g
                  ? "border-tiktok-pink bg-tiktok-pink/10"
                  : "border-border/50 hover:border-border"
              )}
            >
              <span className="text-2xl">{g === "feminino" ? "♀" : "♂"}</span>
              <span className="text-sm font-medium capitalize">{g}</span>
            </button>
          ))}
        </div>
      </CollapsibleSection>

      {/* Ethnicity */}
      <CollapsibleSection title="Etnia / Origem" icon="🌍">
        <div className="grid grid-cols-3 gap-3">
          {ethnicities.map((eth) => (
            <button
              key={eth.id}
              onClick={() => update({ ethnicity: eth.id })}
              className={cn(
                "rounded-lg overflow-hidden border-2 transition-all",
                persona.ethnicity === eth.id
                  ? "border-tiktok-pink ring-2 ring-tiktok-pink/30"
                  : "border-border/50 hover:border-border"
              )}
            >
              <div className="aspect-[3/4] overflow-hidden relative">
                <img
                  src={persona.gender === "feminino" ? eth.femaleImg : eth.maleImg}
                  alt={eth.label}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <span className="text-xs font-medium text-white">{eth.label}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </CollapsibleSection>

      {/* Skin Tone */}
      <CollapsibleSection title="Cor da pele" icon="🎨">
        <div className="grid grid-cols-5 gap-3">
          {skinTones.map((tone) => (
            <button
              key={tone.id}
              onClick={() => update({ skinTone: tone.id })}
              className={cn(
                "rounded-lg overflow-hidden border-2 transition-all flex flex-col items-center gap-1 p-2",
                persona.skinTone === tone.id
                  ? "border-tiktok-pink ring-2 ring-tiktok-pink/30"
                  : "border-border/50 hover:border-border"
              )}
            >
              <div
                className="w-full aspect-square rounded-md"
                style={{ backgroundColor: tone.color }}
              />
              <span className="text-[10px] font-medium text-muted-foreground">{tone.label}</span>
            </button>
          ))}
        </div>
      </CollapsibleSection>

      {/* Eye Color */}
      <CollapsibleSection title="Cor dos olhos" icon="👁">
        <div className="grid grid-cols-3 gap-3">
          {eyeColors.map((eye) => (
            <button
              key={eye.id}
              onClick={() => update({ eyeColor: eye.id })}
              className={cn(
                "rounded-lg border-2 transition-all flex items-center gap-2 p-3",
                persona.eyeColor === eye.id
                  ? "border-tiktok-pink bg-tiktok-pink/10"
                  : "border-border/50 hover:border-border"
              )}
            >
              <div
                className="w-5 h-5 rounded-full border border-white/20 flex-shrink-0"
                style={{ backgroundColor: eye.color }}
              />
              <span className="text-xs font-medium">{eye.label}</span>
            </button>
          ))}
        </div>
      </CollapsibleSection>

      {/* Skin Conditions */}
      <CollapsibleSection title="Condições da pele" icon="🧬" defaultOpen={false}>
        <div className="grid grid-cols-3 gap-2">
          {skinConditions.map((cond) => (
            <button
              key={cond.id}
              onClick={() => update({ skinCondition: cond.id === "nenhuma" ? null : cond.id })}
              className={cn(
                "rounded-lg border-2 transition-all p-2 text-center",
                (cond.id === "nenhuma" && !persona.skinCondition) || persona.skinCondition === cond.id
                  ? "border-tiktok-pink bg-tiktok-pink/10"
                  : "border-border/50 hover:border-border"
              )}
            >
              <span className="text-lg">{cond.emoji}</span>
              <p className="text-[10px] font-medium mt-1">{cond.label}</p>
            </button>
          ))}
        </div>
      </CollapsibleSection>

      {/* Hair Style */}
      <CollapsibleSection title="Estilo do cabelo" icon="💇">
        <div className="grid grid-cols-3 gap-2">
          {hairStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => update({ hairStyle: style.id })}
              className={cn(
                "rounded-lg border-2 transition-all p-2 text-center text-xs font-medium",
                persona.hairStyle === style.id
                  ? "border-tiktok-pink bg-tiktok-pink/10"
                  : "border-border/50 hover:border-border"
              )}
            >
              {style.label}
            </button>
          ))}
        </div>
      </CollapsibleSection>

      {/* Hair Color */}
      <CollapsibleSection title="Cor do cabelo" icon="🎨">
        <div className="grid grid-cols-3 gap-3">
          {hairColors.map((hc) => (
            <button
              key={hc.id}
              onClick={() => update({ hairColor: hc.id })}
              className={cn(
                "rounded-lg border-2 transition-all flex items-center gap-2 p-3",
                persona.hairColor === hc.id
                  ? "border-tiktok-pink bg-tiktok-pink/10"
                  : "border-border/50 hover:border-border"
              )}
            >
              <div
                className="w-5 h-5 rounded-full border border-white/20 flex-shrink-0"
                style={{ background: hc.color }}
              />
              <span className="text-xs font-medium">{hc.label}</span>
            </button>
          ))}
        </div>
      </CollapsibleSection>

      {/* Age */}
      <CollapsibleSection title="Idade" icon="📅">
        <div className="px-2">
          <Slider
            value={[persona.age]}
            onValueChange={([val]) => update({ age: val })}
            min={18}
            max={80}
            step={1}
            className="mb-2"
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">18 – 80 anos</span>
            <span className="text-sm font-bold text-tiktok-pink">{persona.age} anos</span>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
}

export function personaToDescription(persona: PersonaConfig): string {
  const genderMap: Record<string, string> = {
    feminino: "woman",
    masculino: "man",
  };

  const ethMap: Record<string, string> = {
    africana: "African",
    asiatica: "East Asian",
    europeia: "European/Caucasian",
    indiana: "South Asian/Indian",
    "oriente-medio": "Middle Eastern",
    latina: "Latin American/Brazilian",
  };

  const skinMap: Record<string, string> = {
    clara: "light/fair skin",
    media: "medium skin tone",
    morena: "warm brown skin",
    escura: "dark brown skin",
    "muito-escura": "very dark skin",
  };

  const eyeMap: Record<string, string> = {
    castanho: "brown eyes",
    "castanho-escuro": "dark brown eyes",
    verde: "green eyes",
    azul: "blue eyes",
    mel: "amber/honey eyes",
    preto: "black eyes",
  };

  const hairStyleMap: Record<string, string> = {
    liso: "straight hair",
    ondulado: "wavy hair",
    cacheado: "curly hair",
    crespo: "coily/kinky hair",
    curto: "short hair",
    raspado: "buzzcut/shaved hair",
  };

  const hairColorMap: Record<string, string> = {
    preto: "black",
    castanho: "brown",
    loiro: "blonde",
    ruivo: "red/auburn",
    grisalho: "gray/silver",
    colorido: "colorful/dyed",
  };

  const parts = [
    `Brazilian ${genderMap[persona.gender] || "person"}`,
    `age ${persona.age}`,
    ethMap[persona.ethnicity] || "",
    skinMap[persona.skinTone] || "",
    eyeMap[persona.eyeColor] || "",
    `${hairColorMap[persona.hairColor] || ""} ${hairStyleMap[persona.hairStyle] || ""}`.trim(),
  ];

  if (persona.skinCondition) {
    const condMap: Record<string, string> = {
      sardas: "with freckles",
      vitiligo: "with vitiligo skin condition",
      marcas: "with birthmarks",
      cicatrizes: "with visible scars",
    };
    parts.push(condMap[persona.skinCondition] || "");
  }

  return parts.filter(Boolean).join(", ");
}

export const defaultPersona: PersonaConfig = {
  gender: "feminino",
  ethnicity: "latina",
  skinTone: "media",
  eyeColor: "castanho",
  skinCondition: null,
  age: 25,
  hairStyle: "ondulado",
  hairColor: "castanho",
};
