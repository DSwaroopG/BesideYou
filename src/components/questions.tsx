import { questions } from "@/content/pilot";
import { MoreQuestions } from "@/components/more-questions";

// FAQ list. With phoneLimit, phones show the first few questions and a "More questions" button for
// the rest (components/more-questions.tsx). Without JavaScript, and on larger screens, all show.
export function Questions({ items = questions, itemClassName, phoneLimit }: { items?: ReadonlyArray<{ question: string; answer: string }>; itemClassName?: string; phoneLimit?: number }) {
  const extra = phoneLimit && items.length > phoneLimit + 1 ? items.length - phoneLimit : 0;
  return <div className="by-questions">
    {items.map((item, k) => <details className={[itemClassName, extra && k >= phoneLimit! ? "by-q-extra" : ""].filter(Boolean).join(" ") || undefined} key={item.question}><summary>{item.question}<span aria-hidden="true">+</span></summary><p>{item.answer}</p></details>)}
    {extra > 0 && <MoreQuestions count={extra} />}
  </div>;
}
