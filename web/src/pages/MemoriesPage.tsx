import { FormEvent, useEffect, useState } from "react";
import { analyzeUpload, createMemory, getMemories } from "../api";
import type { Memory } from "../types";

export function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  function refresh() {
    getMemories().then((data) => setMemories(data.memories)).catch(() => undefined);
  }

  useEffect(refresh, []);

  async function addTextMemory(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || !content.trim()) return;
    const result = await createMemory({ title, content });
    setMemories((items) => [result.memory, ...items]);
    setTitle("");
    setContent("");
  }

  async function analyze(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    setAnalyzing(true);
    const form = new FormData();
    form.append("pet_id", "orange_cat_001");
    form.append("title", title);
    form.append("story", content);
    if (file) form.append("file", file);
    await new Promise((resolve) => window.setTimeout(resolve, 1100));
    const result = await analyzeUpload(form);
    setMemories((items) => [result.memory, ...items]);
    setTitle("");
    setContent("");
    setFile(null);
    setAnalyzing(false);
  }

  return (
    <main className="page-shell">
      <header className="page-head">
        <div>
          <p>回忆档案</p>
          <h1>橘橘的时间线</h1>
        </div>
        <a href="/mobile">返回状态</a>
      </header>

      <section className="memory-composer">
        <form onSubmit={analyze}>
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="回忆标题" />
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="写一点发生了什么"
          />
          <label className="file-input">
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
            />
            {file ? file.name : "选择图片/视频"}
          </label>
          <div className="composer-actions">
            <button type="submit" disabled={analyzing}>
              {analyzing ? "AI 分析中..." : "上传并分析"}
            </button>
            <button type="button" onClick={addTextMemory}>
              只新增文字
            </button>
          </div>
        </form>
        <aside>
          <strong>分析输出</strong>
          <span>场景</span>
          <span>情绪</span>
          <span>性格线索</span>
          <span>关键 moment</span>
        </aside>
      </section>

      <section className="memory-list">
        {memories.map((memory) => (
          <article className="memory-card" key={memory.id}>
            <time>{memory.memory_date}</time>
            <h2>{memory.title}</h2>
            <p>{memory.content}</p>
            {memory.media_path ? <a href={memory.media_path}>素材文件</a> : null}
            <div className="tag-row">
              {memory.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <dl>
              <div>
                <dt>场景</dt>
                <dd>{memory.ai_extracted.scene || "--"}</dd>
              </div>
              <div>
                <dt>性格线索</dt>
                <dd>{memory.ai_extracted.personality_clue || "--"}</dd>
              </div>
            </dl>
          </article>
        ))}
      </section>
    </main>
  );
}
