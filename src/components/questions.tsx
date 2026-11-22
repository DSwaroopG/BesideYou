import { questions } from "@/content/pilot";
export function Questions({ items = questions, itemClassName }: { items?: ReadonlyArray<{ question: string; answer: string }>; itemClassName?: string }) {
  return <div className="by-questions">{items.map(item => <details className={itemClassName} key={item.question}><summary>{item.question}<span aria-hidden="true">+</span></summary><p>{item.answer}</p></details>)}</div>;
}
