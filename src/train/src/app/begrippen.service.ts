import { Injectable } from '@angular/core';
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

  constructor(private http: HttpClient) {}

  private async ensureLoaded() {
    if (this.data) return;
    const url = 'content/ak/h4/begrippen.json';
    this.data = await firstValueFrom(this.http.get<Record<string, any>>(url));
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
