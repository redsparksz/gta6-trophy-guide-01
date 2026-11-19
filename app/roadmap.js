// Roadmap to the platinum: the three-step route, the chapter order, the
// one missable trophy, and the 100% checklist breakdown. All numbers come
// from the cited PowerPyx roadmap; the chapter list names key missions only.
export function renderRoadmap(container, trophies) {
  const missable = trophies.find((t) => t.missable);
  const missableName = missable ? missable.name : 'Positive Mental Attitude';

  container.innerHTML = `
    <div class="roadmap-intro">
      <p class="eyebrow">Roadmap · Difficulty 4/10 · about 200 hours · 1 playthrough</p>
      <h2>One playthrough to the platinum</h2>
      <p>Grand Theft Auto VI has no online trophies, no mission replay and no New Game Plus — but almost everything can be finished in post-story free-roam. The only thing that can truly go wrong is one meditation in Chapter 1 (see the warning below). Cheats disable trophies and your save, so play clean. You get 15 manual saves plus 1 autosave: save at the start and end of each chapter (10 saves) and rotate the remaining 5 for cleanup.</p>
      <div class="roadmap-stats">
        <div class="stat"><b>55</b><span>trophies</span></div>
        <div class="stat"><b>~200 h</b><span>to platinum</span></div>
        <div class="stat"><b>0</b><span>online trophies</span></div>
        <div class="stat"><b>1</b><span>potentially missable</span></div>
        <div class="stat"><b>5</b><span>story chapters</span></div>
      </div>
    </div>

    <div class="step">
      <div class="step-head"><span class="step-num">Step 1</span><h3>Play the story, grab the side content</h3><span class="step-hours">60–80 hours</span></div>
      <p>Play through the five chapters and pick up the optional missions and scans on the way — progress toward the 100% checklist already counts during the story. Do the Chapter 1 meditation the morning after the mission Down to Earth (see the warning below) before Chapter 1 ends.</p>
      <ul class="chapter-list">
        <li><b>Chapter 1</b><span>Gone Fishing — first mission; meditate at Jason's house before the chapter ends</span></li>
        <li><b>Chapter 2</b><span>Breakfast Run · Coffee Break (partner free-roam opens) · Daily Driver (garages) · Moses (Scooter Bros) · Hit Kingpin Bowling</span></li>
        <li><b>Chapter 3</b><span>The Cartel Heist · Welcome to Vice City · Clonin' Keys, Makin' GS (Randy) · Yasmani's Jewelry Jobs · Credit Check (Raul) · Here Kitty Kitty (Tyrone)</span></li>
        <li><b>Chapter 4</b><span>Child's Play · Headliners · VCIA Takedown · Ocean Beach / Another Life · Starting From Zero</span></li>
        <li><b>Chapter 5</b><span>Operation Savage Glory</span></li>
      </ul>
    </div>

    <div class="step">
      <div class="step-head"><span class="step-num">Step 2</span><h3>The 100% checklist and challenges</h3><span class="step-hours">~100 hours</span></div>
      <p>After the story, the 100% checklist opens under Progress, then Stats, then 100% Completion. It is the gold trophy A Long Road and the longest grind in the game — about 60% true completion.</p>
      <div class="checklist-100" style="border:none;padding:0;margin-top:16px">
        <table class="breakdown">
          <thead><tr><th>Category</th><th>Needed</th><th>Notes</th></tr></thead>
          <tbody>
            <tr><td>Vehicles</td><td class="num">200 / 277</td><td>Base models; WAiNK-scan them</td></tr>
            <tr><td>Animals</td><td class="num">100 / 255</td><td>Study with binoculars</td></tr>
            <tr><td>Weapons</td><td class="num">50 / 66</td><td>Collect across the state</td></tr>
            <tr><td>Optional missions</td><td class="num">any 100</td><td>200–300+ exist</td></tr>
            <tr><td>Stunts</td><td class="num">300 / 397</td><td>130 jumps · 202 under-bridge · 40 knife flights · 25 base jumps</td></tr>
            <tr><td>Challenges</td><td class="num">70 / 80</td><td>50 unlocks One Last Thing on the way</td></tr>
            <tr><td>Meditations</td><td class="num">15 / 18</td><td>Do the Chapter 1 one early — see warning</td></tr>
            <tr><td>Must finish in full</td><td class="num">all</td><td>Robberies · underwater discoveries · shooting ranges (42 gold) · drone races (14 locations) · Bret quests (15 Target Decks)</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="step">
      <div class="step-head"><span class="step-num">Step 3</span><h3>Strangers &amp; Freaks and cleanup</h3><span class="step-hours">~10 hours</span></div>
      <p>Finish 8 Strangers &amp; Freaks mission strands (confirmed: Kirk and the Skunk Ape, Kyle, Yago, Pilot Pete) and sweep up whatever is left — cards, WAiNK scans, vehicles, bank vaults. When the last trophy pops, the platinum follows at once.</p>
    </div>

    <div class="missable-card">
      <h3>⚠ The one trophy that can be missed</h3>
      <p><strong>${escapeHtml(missableName)}</strong> — meditate at every spot across Leonida (18 spots, 10 locations). One meditation at Jason's house in Chapter 1 becomes permanently unavailable after Chapter 1: in the morning after the mission Down to Earth, Lucia talks about meditating in the kitchen, then goes to the balcony — follow her and choose Accept.</p>
      <p>Every other trophy can be earned in post-story free-roam. Quest-givers who go away for a while always come back, and no other trophy depends on a one-time moment.</p>
    </div>`;
}

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
