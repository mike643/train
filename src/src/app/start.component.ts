import { Component, signal, computed } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { BegrippenService } from './begrippen.service';

@Component({
  standalone: true,
  selector: 'app-start',
  imports: [CommonModule, RouterModule],
  templateUrl: './start.component.html'
})
export class StartComponent {
  content = signal<any>(null);
  selectedVak = signal<string | null>(null);
  selectedThema = signal<string | null>(null);

  
  constructor(private http: HttpClient, private svc: BegrippenService, private router: Router) {
    this.loadContent();
  }

  allVakken = computed(() => {
    const c = this.content();
    if (!c || !c.vakken) return [];
    return Object.entries(c.vakken).map(([id, data]: any) => ({
      id,
      ...data
    }));
  });

  themaForVak = computed(() => {
    const vak = this.selectedVak();
    const c = this.content();
    if (!vak || !c || !c.vakken || !c.vakken[vak]) return [];
    const themas = c.vakken[vak].themas || {};
    return Object.entries(themas).map(([id, data]: any) => ({
      id,
      ...data
    }));
  });

  hoofdstukkenvoor = computed(() => {
    const vak = this.selectedVak();
    const thema = this.selectedThema();
    const c = this.content();
    if (!vak || !thema || !c || !c.vakken || !c.vakken[vak]) return [];
    const themaObj = c.vakken[vak].themas?.[thema];
    return themaObj?.hoofdstukken || [];
  });

  async loadContent() {
    const data = await firstValueFrom(this.http.get<any>('content/content.json'));
    this.content.set(data);
  }

  selectVak(vakId: string) {
    this.selectedVak.set(vakId);
    this.selectedThema.set(null);
  }

  selectThema(themaId: string) {
    this.selectedThema.set(themaId);
  }

  async selectHoofdstuk(hoofdstuk: any) {
    const bestandspad = hoofdstuk.bestand;
    await this.svc.loadFile(bestandspad);
    this.router.navigate(['/begrip', 0]);
  }

  startExamen() {
    this.router.navigate(['/examen']);
  }
}
