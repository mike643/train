import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExamenService, ExamenVraag } from './examen.service';

@Component({
  standalone: true,
  selector: 'app-examen',
  imports: [CommonModule, FormsModule],
  templateUrl: './examen.component.html',
  styleUrls: ['./examen.component.css'],
})
export class ExamenComponent implements OnInit {
  vragen = signal<ExamenVraag[]>([]);
  currentIndex = signal<number>(0);
  selectedAnswer = signal<string | null>(null);
  answered = signal<boolean>(false);
  isCorrect = signal<boolean | null>(null);
  openInput = signal<string>('');

  constructor(private examenService: ExamenService) {}

  ngOnInit() {
    this.examenService.getVragen().subscribe((vragen) => {
      const filtered = vragen.filter((v) => v.id && v.question);
      this.shuffleArray(filtered);
      this.vragen.set(filtered);
    });
  }

  private shuffleArray(array: ExamenVraag[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  get currentVraag(): ExamenVraag | null {
    const vragen = this.vragen();
    return vragen.length > this.currentIndex() ? vragen[this.currentIndex()] : null;
  }

  getOptionsForQuestion(q: ExamenVraag | null): string[] {
    if (!q) return [];
    if (q.options && q.options.length > 0) return q.options;
    const corr = (q.correctAnswer || '').toLowerCase();
    if (corr === 'waar' || corr === 'niet waar' || corr === 'nietwaar') return ['Waar', 'Niet waar'];
    if (corr === 'true' || corr === 'false') return ['Waar', 'Niet waar'];
    return [];
  }

  isOpenQuestion(q: ExamenVraag | null) {
    return this.getOptionsForQuestion(q).length === 0;
  }

  selectAnswer(option: string) {
    if (!this.answered()) {
      this.selectedAnswer.set(option);
    }
  }

  submitAnswer() {
    if (this.answered()) return;
    const q = this.currentVraag;
    if (!q) return;

    if (this.isOpenQuestion(q)) {
      if (!this.openInput()) return;
      this.selectedAnswer.set(this.openInput());
      this.answered.set(true);
      this.isCorrect.set(null);
      return;
    }

    if (!this.selectedAnswer()) return;
    const corr = q.correctAnswer === this.selectedAnswer();
    this.isCorrect.set(corr);
    this.answered.set(true);
  }

  nextQuestion() {
    if (this.currentIndex() < this.vragen().length - 1) {
      this.currentIndex.update((i) => i + 1);
      this.resetQuestion();
    }
  }

  previousQuestion() {
    if (this.currentIndex() > 0) {
      this.currentIndex.update((i) => i - 1);
      this.resetQuestion();
    }
  }

  private resetQuestion() {
    this.selectedAnswer.set(null);
    this.answered.set(false);
    this.isCorrect.set(null);
    this.openInput.set('');
  }

  getOptionLabel(index: number): string {
    return String.fromCharCode(97 + index); // a, b, c, d
  }
}
