"use client";

import { useEffect, useState, useCallback } from "react";
import { CodeBlock } from "./code-block";

const PROMPT = "Create a welcome card with a get started button";

interface StageJson {
  key: string;
  type: string;
  props: {
    title?: string;
    description?: string;
    label?: string;
    action?: string;
  };
  children?: StageJson[];
}

interface Stage {
  json: StageJson;
  stream: string;
}

const STAGES: Stage[] = [
  { json: { key: "root", type: "Card", props: {} }, stream: '{"op":"set","path":"/root","value":{"key":"root","type":"Card"}}' },
  { json: { key: "root", type: "Card", props: { title: "Welcome" } }, stream: '{"op":"replace","path":"/root/props/title","value":"Welcome"}' },
  { json: { key: "root", type: "Card", props: { title: "Welcome", description: "Get started with json-render" } }, stream: '{"op":"replace","path":"/root/props/description","value":"Get started..."}' },
  { json: { key: "root", type: "Card", props: { title: "Welcome", description: "Get started with json-render" }, children: [{ key: "btn", type: "Button", props: {} }] }, stream: '{"op":"add","path":"/root/children","value":{"key":"btn","type":"Button"}}' },
  { json: { key: "root", type: "Card", props: { title: "Welcome", description: "Get started with json-render" }, children: [{ key: "btn", type: "Button", props: { label: "Get Started", action: "start" } }] }, stream: '{"op":"replace","path":"/root/children/0/props","value":{"label":"Get Started"}}' },
];

const CODE_EXAMPLE = `const registry = {
  Card: ({ element, children }) => (
    <div className="card">
      <h3>{element.props.title}</h3>
      <p>{element.props.description}</p>
      {children}
    </div>
  ),
  Button: ({ element, onAction }) => (
    <button onClick={() => onAction(element.props.action)}>
      {element.props.label}
    </button>
  ),
};

<Renderer tree={tree} registry={registry} />`;

type Phase = "typing" | "streaming" | "complete";
type Tab = "stream" | "json" | "code";

export function Demo() {
  const [phase, setPhase] = useState<Phase>("typing");
  const [typedPrompt, setTypedPrompt] = useState("");
  const [stageIndex, setStageIndex] = useState(-1);
  const [streamLines, setStreamLines] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("stream");
  const [actionFired, setActionFired] = useState(false);

  const currentStage = stageIndex >= 0 ? STAGES[stageIndex] : null;

  const reset = useCallback(() => {
    setPhase("typing");
    setTypedPrompt("");
    setStageIndex(-1);
    setStreamLines([]);
    setActiveTab("stream");
    setActionFired(false);
  }, []);

  // Typing effect
  useEffect(() => {
    if (phase !== "typing") return;

    let i = 0;
    const interval = setInterval(() => {
      if (i < PROMPT.length) {
        setTypedPrompt(PROMPT.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setPhase("streaming"), 500);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [phase]);

  // Streaming effect
  useEffect(() => {
    if (phase !== "streaming") return;

    let i = 0;
    const interval = setInterval(() => {
      if (i < STAGES.length) {
        const currentIndex = i;
        const stage = STAGES[currentIndex];
        if (stage) {
          setStageIndex(currentIndex);
          setStreamLines((prev) => [...prev, stage.stream]);
        }
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setPhase("complete");
          setActiveTab("json");
        }, 500);
      }
    }, 600);

    return () => clearInterval(interval);
  }, [phase]);

  const handleAction = () => {
    setActionFired(true);
    setTimeout(() => setActionFired(false), 2000);
  };

  // Progressive render based on current stage
  const renderPreview = () => {
    if (!currentStage) {
      return <div className="text-muted-foreground/50 text-sm">waiting...</div>;
    }

    const { props, children } = currentStage.json;
    const hasTitle = props.title;
    const hasDesc = props.description;
    const buttonLabel = children?.[0]?.props?.label;

    return (
      <div className="text-center animate-in fade-in duration-200">
        <div className="border border-border rounded-lg p-4 bg-background inline-block text-left">
          {hasTitle ? (
            <h3 className="font-semibold mb-1">{props.title}</h3>
          ) : (
            <div className="h-5 w-20 bg-muted rounded animate-pulse mb-1" />
          )}
          {hasDesc ? (
            <p className="text-xs text-muted-foreground mb-3">{props.description}</p>
          ) : hasTitle ? (
            <div className="h-3 w-32 bg-muted rounded animate-pulse mb-3" />
          ) : null}
          {buttonLabel ? (
            <button
              onClick={handleAction}
              className="px-3 py-1.5 bg-foreground text-background rounded text-xs font-medium hover:opacity-90 transition-opacity"
            >
              {buttonLabel}
            </button>
          ) : hasDesc ? (
            <div className="h-7 w-24 bg-muted rounded animate-pulse" />
          ) : null}
        </div>
        {actionFired && (
          <div className="mt-3 text-xs font-mono text-muted-foreground animate-in fade-in slide-in-from-bottom-2">
            onAction(&quot;start&quot;)
          </div>
        )}
      </div>
    );
  };

  const jsonCode = currentStage
    ? JSON.stringify(currentStage.json, null, 2)
    : "// waiting...";

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Prompt input */}
      <div className="mb-6">
        <div className="border border-border rounded p-3 bg-card font-mono text-sm min-h-[44px] flex items-center">
          <span>{typedPrompt}</span>
          {phase === "typing" && (
            <span className="inline-block w-2 h-4 bg-foreground ml-0.5 animate-pulse" />
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Tabbed code/stream/json panel */}
        <div>
          <div className="flex gap-4 mb-2">
            {(["stream", "json", "code"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-xs font-mono transition-colors ${
                  activeTab === tab ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="border border-border rounded p-3 bg-card font-mono text-xs h-72 overflow-auto text-left">
            {activeTab === "stream" && (
              <div className="space-y-1">
                {streamLines.map((line, i) => (
                  <div
                    key={i}
                    className="text-muted-foreground truncate animate-in fade-in slide-in-from-bottom-1 duration-200"
                  >
                    {line}
                  </div>
                ))}
                {phase === "streaming" && streamLines.length < STAGES.length && (
                  <div className="flex gap-1 mt-2">
                    <span className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse" />
                    <span className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse [animation-delay:75ms]" />
                    <span className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse [animation-delay:150ms]" />
                  </div>
                )}
                {streamLines.length === 0 && phase !== "streaming" && (
                  <div className="text-muted-foreground/50">waiting...</div>
                )}
              </div>
            )}
            {activeTab === "json" && (
              <CodeBlock code={jsonCode} lang="json" />
            )}
            {activeTab === "code" && (
              <CodeBlock code={CODE_EXAMPLE} lang="tsx" />
            )}
          </div>
        </div>

        {/* Rendered output */}
        <div>
          <div className="text-xs text-muted-foreground mb-2 font-mono">render</div>
          <div className="border border-border rounded p-3 bg-card h-72 flex items-center justify-center">
            {renderPreview()}
          </div>
        </div>
      </div>
    </div>
  );
}
