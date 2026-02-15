import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ExamenVraag {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  category: string;
  reference: string;
}

@Injectable({
  providedIn: 'root',
})
export class ExamenService {
  constructor(private http: HttpClient) {}

  getVragen(): Observable<ExamenVraag[]> {
    return this.http.get<ExamenVraag[]>('/content/ak/h4/examen.json');
  }
}
