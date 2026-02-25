import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface BegripData {
  key: string;
  content: any;
}

@Injectable({ providedIn: 'root' })
export class BegrippenService {
  private data: Record<string, any> | null = null;
  private keys: string[] = [];
  currentFilePath = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  async loadFile(filePath: string) {
    this.currentFilePath.set(filePath);
    this.data = null;
    this.keys = [];
    await this.ensureLoaded();
  }

  private async ensureLoaded() {
    if (this.data) return;
    const filePath = this.currentFilePath() || 'content/ak/h4/begrippen.json';
    const url = `content/${filePath}`;
    
    const rawData = await firstValueFrom(this.http.get<any>(url));
    
    // Check if the data has a "begrippen" array (new format)
    if (Array.isArray(rawData.begrippen)) {
      // Transform from array format to key-value format
      this.data = {};
      rawData.begrippen.forEach((item: any) => {
        const key = item.begrip;
        
        // Transform vragen to the format expected by BegripComponent
        const mc_vragen = (item.vragen || []).map((v: any) => {
          if (Array.isArray(v.antwoorden)) {
            // New format: antwoorden is array, juiste_antwoord is index
            const opties: Record<string, string> = {};
            const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
            v.antwoorden.forEach((antwoord: string, idx: number) => {
              opties[letters[idx] || idx.toString()] = antwoord;
            });
            return {
              vraag: v.vraag,
              opties: opties,
              juiste_antwoord: letters[v.juiste_antwoord || 0] || '0'
            };
          }
          // Old format: assume it's already correct
          return v;
        });
        
        this.data![key] = {
          boek_omschrijving: item.definitie,
          eenvoudige_omschrijving_1: item.uitleg_voor_kind?.[0] || '',
          eenvoudige_omschrijving_2: item.uitleg_voor_kind?.[1] || '',
          ezelsbrug: item.ezelsbrug || '',
          mc_vragen: mc_vragen
        };
      });
    } else {
      // Old format: direct key-value map
      this.data = rawData;
    }
    
    this.keys = Object.keys(this.data || {});
  }

  async count(): Promise<number> {
    await this.ensureLoaded();
    return this.keys.length;
  }

  async getByIndex(index: number): Promise<BegripData | null> {
    await this.ensureLoaded();
    if (index < 0 || index >= this.keys.length) return null;
    const key = this.keys[index];
    return { key, content: this.data![key] };
  }

  async indexOf(key: string): Promise<number> {
    await this.ensureLoaded();
    return this.keys.indexOf(key);
  }
}
