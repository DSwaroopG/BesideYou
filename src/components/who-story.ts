// Timing for the Examples story on /who-we-help, shared by the page component and the 3D
// scene so captions, card rows and the figure's gestures stay in step. No three.js in here.
//
// The track is split into one chapter per person. Within a chapter (local progress 0..1) the
// person walks in, introduces themselves, explains the four card rows, then walks off (except the
// last person, who stays).
export const PEOPLE = 4;
export const STORY = { arrive: .1, rows: [.24, .41, .58, .75], leave: .9 } as const;

export function storyAt(progress: number) {
 const scaled = Math.max(0, Math.min(1, progress)) * PEOPLE;
 const chapter = Math.min(PEOPLE - 1, Math.floor(scaled));
 const local = Math.min(1, scaled - chapter);
 const last = chapter === PEOPLE - 1;
 const leaving = !last && local >= STORY.leave;
 let row = -1;
 STORY.rows.forEach((start, k) => { if (local >= start) row = k; });
 // Speech: hidden while walking in or out; line 0 is the introduction, lines 1..4 follow the rows.
 const line = leaving || local < STORY.arrive ? -1 : row + 1;
 return { chapter, local, last, leaving, row: leaving ? -1 : row, line, allDone: leaving };
}
