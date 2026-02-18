import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BegrippenService } from './begrippen.service';

@Component({
  standalone: true,
  selector: 'app-begrip',
  imports: [CommonModule, RouterModule],
  templateUrl: './begrip.component.html'
})

export class BegripComponent {
  item = signal<any | null>(null);
  key = signal<string>('');
  index = signal<number>(0);
  hintLevel = signal<number>(0);

  quizMode = signal<boolean>(false);
  questions = signal<any[]>([]);
  qIndex = signal<number>(0);
  selected = signal<string | null>(null);
  correctCount = signal<number>(0);
  finishedQuiz = signal<boolean>(false);

  currentDescription = computed(() => {
    const it = this.item();
    if (!it) return '';
    const lvl = this.hintLevel();
    if (lvl === 0) return it.content.boek_omschrijving;
    if (lvl === 1) return it.content.eenvoudige_omschrijving_1 || it.content.boek_omschrijving;
    return it.content.eenvoudige_omschrijving_2 || it.content.eenvoudige_omschrijving_1 || it.content.boek_omschrijving;
  });

  begrippenAll: string[] = [];

  constructor(private route: ActivatedRoute, private svc: BegrippenService, private router: Router) {
    this.route.params.subscribe(async (p) => {
      const idx = Number(p['index'] || 0);
      this.index.set(isNaN(idx) ? 0 : idx);
      await this.load();
    });
  }

  async loadAllBegrippen() {
    const count = await this.svc.count();
    const tmp: string[] = [];
    for (let i = 0; i < count; i++) {
      const item = await this.svc.getByIndex(i);
      if (item) tmp.push(item.key);
    }
    this.begrippenAll = tmp;
  }

  async load() {
    const it = await this.svc.getByIndex(this.index());
    if (!it) {
      this.key.set('Onbekend begrip');
      this.item.set(null);
      return;
    }
    this.item.set(it);
    this.key.set(it.key);
    this.hintLevel.set(0);
    this.quizMode.set(false);
    this.finishedQuiz.set(false);
    this.qIndex.set(0);
    this.selected.set(null);
    this.correctCount.set(0);
    this.questions.set((it.content.mc_vragen || []).slice(0, 3));
  }

  easier() { if (this.hintLevel() < 2) this.hintLevel.set(this.hintLevel() + 1); }
  harder() { if (this.hintLevel() > 0) this.hintLevel.set(this.hintLevel() - 1); }

  startQuiz() {
    this.quizMode.set(true);
    this.finishedQuiz.set(false);
    this.qIndex.set(0);
    this.selected.set(null);
    this.correctCount.set(0);
    this.questions.set((this.item()?.content?.mc_vragen || []).slice(0, 3));
  }

  currentOptions = computed(() => {
    const q = this.questions()[this.qIndex()];
    if (!q || !q.opties) return [] as string[];
    return Object.keys(q.opties);
  });

  select(opt: string) { this.selected.set(opt); }

  submitAnswer() {
    const q = this.questions()[this.qIndex()];
    if (!q) return;
    if (this.selected() === q.juiste_antwoord) this.correctCount.set(this.correctCount() + 1);
    this.qIndex.set(this.qIndex() + 1);
    this.selected.set(null);
    if (this.qIndex() >= this.questions().length) {
      this.finishedQuiz.set(true);
      this.quizMode.set(false);
    }
  }

  async gotoNext() {
    const count = await this.svc.count();
    const next = Math.min(this.index() + 1, count - 1);
    this.router.navigate(['/begrip', next]);
  }

  async gotoPrev() {
    const prev = Math.max(this.index() - 1, 0);
    this.router.navigate(['/begrip', prev]);
  }
}
