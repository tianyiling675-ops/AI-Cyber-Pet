import { useEffect, useState } from "react";
import { getEvalReport } from "../api";

const labels: Record<string, string> = {
  dialogue_quality: "对话质量",
  persona_consistency: "人格一致性",
  state_reference: "状态引用自然度",
  memory_reference: "回忆引用准确率",
  behavior_accuracy: "行为识别准确率",
  sync_latency_sec: "状态同步延迟",
};

export function EvalPage() {
  const [report, setReport] = useState<Record<string, number | string>>({});

  useEffect(() => {
    getEvalReport().then(setReport).catch(() => undefined);
  }, []);

  return (
    <main className="page-shell">
      <header className="page-head">
        <div>
          <p>Eval-Anything</p>
          <h1>质量报告</h1>
        </div>
        <a href="/demo">导演控制台</a>
      </header>
      <section className="eval-grid">
        {Object.entries(labels).map(([key, label]) => {
          const value = report[key];
          const numeric = typeof value === "number" ? value : 0;
          const score = key.includes("accuracy")
            ? `${Math.round(numeric * 100)}%`
            : key.includes("latency")
              ? `${numeric}s`
              : `${numeric}/5`;
          const width = key.includes("accuracy") ? numeric * 100 : key.includes("latency") ? 88 : (numeric / 5) * 100;
          return (
            <article className="eval-card" key={key}>
              <span>{label}</span>
              <strong>{score}</strong>
              <div className="meter">
                <i style={{ width: `${Math.min(100, width)}%` }} />
              </div>
            </article>
          );
        })}
      </section>
      <section className="report-note">
        <h2>低分样本处理</h2>
        <p>低分对话进入 prompt 迭代，误报状态进入行为识别调参，体验瓶颈进入功能优化列表。</p>
      </section>
    </main>
  );
}
